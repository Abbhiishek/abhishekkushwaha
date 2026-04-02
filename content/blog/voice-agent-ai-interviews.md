---
title: "Building a Real-Time Voice Agent for AI Interviews: Whisper, WebSockets, and LLM Turn-Taking"
description: "How we engineered the voice pipeline at HyrecruitAI — streaming audio over WebSockets, transcribing with Whisper, and orchestrating LLM responses in under 800ms."
date: "2026-04-02"
tags: voice-agent, speech-to-text, websockets, llm, ai
coverImage: /thumbnail.jpg
featured: false
---

Our first version of the AI interviewer was text-only. Candidates typed answers; the LLM evaluated them. Completion rates were 34%. After we shipped voice, they jumped to 71%. The problem was never the AI quality — it was the friction. Nobody wants to type a 3-minute answer to a behavioral question.

But building a voice agent for a live interview is not a weekend project. This post covers how we went from zero to a production voice pipeline at HyrecruitAI that handles thousands of sessions per day — the architecture, the failures, and the numbers.

---

## The Problem

Text-based AI interviews feel like filling a form. Voice feels like a conversation — and that gap matters enormously for candidate experience.

We had three hard constraints:

1. **Latency under 1 second** from end-of-speech to AI response start. Anything above 1.5s feels unresponsive in a conversation.
2. **Accurate transcription** across accents, domain jargon ("TypeScript", "microservices", "K8s"), and background noise.
3. **Graceful turn-taking** — the agent needs to know when the candidate is done talking, not just when there's silence.

Off-the-shelf solutions (ElevenLabs Conversational AI, Vapi) added $0.08–$0.12 per minute of conversation. At our volume, that's a non-starter. We needed to own the stack.

---

## The Architecture

The pipeline has four stages: **capture → transcribe → infer → speak**.

```
Browser mic → WebSocket → Whisper STT → Claude API → TTS → WebSocket → Browser
                                ↓
                        Turn detector (VAD)
```

Each stage runs as a separate process, connected by Redis pub/sub queues. This means we can scale Whisper workers independently of inference workers, and a slow LLM response doesn't back-pressure the audio stream.

### WebSocket Audio Streaming

We stream raw PCM audio (16kHz, 16-bit mono) from the browser over a WebSocket. We chose PCM over opus/webm because Whisper works best on raw audio and the re-encoding overhead adds ~80ms of latency.

```typescript
// client: capture and stream audio
const startAudioStream = async (ws: WebSocket) => {
  const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  const ctx = new AudioContext({ sampleRate: 16000 });
  const source = ctx.createMediaStreamSource(stream);
  const processor = ctx.createScriptProcessor(4096, 1, 1);

  processor.onaudioprocess = (e) => {
    const input = e.inputBuffer.getChannelData(0);
    const pcm = convertFloat32ToInt16(input);
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(pcm.buffer);
    }
  };

  source.connect(processor);
  processor.connect(ctx.destination);
};

const convertFloat32ToInt16 = (buffer: Float32Array): Int16Array => {
  const output = new Int16Array(buffer.length);
  for (let i = 0; i < buffer.length; i++) {
    const s = Math.max(-1, Math.min(1, buffer[i]));
    output[i] = s < 0 ? s * 0x8000 : s * 0x7fff;
  }
  return output;
};
```

On the server, the WebSocket handler buffers incoming chunks and forwards them to a voice activity detection (VAD) process:

```typescript
// server: WebSocket handler
wss.on("connection", (ws, req) => {
  const sessionId = extractSessionId(req);
  const chunks: Buffer[] = [];

  ws.on("message", async (data: Buffer) => {
    chunks.push(data);
    await redis.publish(`audio:${sessionId}`, data.toString("base64"));
  });

  ws.on("close", () => {
    cleanup(sessionId);
  });
});
```

---

## Turn Detection with VAD

The hardest part of a voice agent isn't transcription — it's knowing when the candidate has finished speaking. A simple silence threshold (e.g., 500ms of no audio) doesn't work: people pause mid-sentence to think. We tried it. The agent kept cutting candidates off.

We use [Silero VAD](https://github.com/snakers4/silero-vad) running as a Python sidecar process. It gives us a probability score (0–1) for speech presence on each 32ms audio frame. Our turn-end heuristic:

```python
# vad_worker.py
import torch
from silero_vad import load_silero_vad, get_speech_timestamps

model, utils = load_silero_vad(onnx=True)

def should_end_turn(probabilities: list[float]) -> bool:
    # trailing 600ms all below 0.3 AND
    # we've seen at least 1.5s of speech
    window = probabilities[-19:]  # 19 frames × 32ms ≈ 600ms
    speech_frames = sum(1 for p in probabilities if p > 0.5)

    silence_trailing = all(p < 0.3 for p in window)
    sufficient_speech = speech_frames * 32 > 1500  # >1.5s speech

    return silence_trailing and sufficient_speech
```

This drops false turn-ends by ~85% compared to the naive silence threshold. We still see issues with very long pauses (candidates thinking for 3+ seconds mid-answer) — we handle those by resuming transcription if speech resumes within 5 seconds.

---

## Transcription with Whisper

We run Whisper `large-v3` on A10G GPUs (single GPU per worker, 4 workers). Batch size 1, streaming mode. Cold start was our first problem — Whisper takes 4–6 seconds to load on the first request. We pre-warm workers by sending a 1-second silence clip every 30 seconds.

```python
# transcribe_worker.py
import whisper
import numpy as np

model = whisper.load_model("large-v3", device="cuda")

def transcribe(pcm_bytes: bytes, language: str = "en") -> str:
    audio = np.frombuffer(pcm_bytes, dtype=np.int16).astype(np.float32) / 32768.0
    result = model.transcribe(
        audio,
        language=language,
        initial_prompt="Interview question about software engineering, TypeScript, microservices, Kubernetes, React.",
        fp16=True,
        temperature=0,
    )
    return result["text"].strip()
```

The `initial_prompt` is key — it primes Whisper's decoder with domain vocabulary, cutting word error rate on technical terms from ~12% to ~3%.

Average transcription time for a 60-second answer: **380ms** on A10G with `large-v3`.

---

## LLM Orchestration

Once we have the transcript, we hit Claude. The prompt is assembled from:
- The job description (cached, loaded once per session)
- The question being asked
- The conversation history (last 3 exchanges)
- The candidate's answer transcript
- A structured response schema

```typescript
interface InterviewTurn {
  role: "interviewer" | "candidate";
  content: string;
  timestamp: number;
}

interface LLMRequest {
  jobDescription: string;
  currentQuestion: string;
  conversationHistory: InterviewTurn[];
  candidateAnswer: string;
}

const buildInterviewPrompt = (req: LLMRequest): string => {
  const history = req.conversationHistory
    .slice(-6)
    .map((t) => `${t.role === "interviewer" ? "You" : "Candidate"}: ${t.content}`)
    .join("\n");

  return `You are conducting a technical interview for: ${req.jobDescription}

Current question: ${req.currentQuestion}

Conversation so far:
${history}

Candidate just said: "${req.candidateAnswer}"

Respond as the interviewer. Either:
1. Ask a natural follow-up to probe deeper
2. Acknowledge and move to the next question
3. Ask for clarification if the answer was unclear

Keep your response to 1-2 sentences. Do not evaluate the candidate out loud.`;
};
```

We use streaming responses from Claude so TTS can start reading the first sentence before the full response is generated. This alone saved ~300ms of perceived latency.

---

## The Iteration

**Attempt 1: One big WebSocket handler.** Audio capture, VAD, transcription, LLM, TTS — all in one Node.js process. It worked for 1 concurrent session. At 10, it fell over. Node's event loop can't handle the CPU load of audio processing.

**Attempt 2: Separate services, HTTP.** We split into microservices and called them over HTTP. Worked great until we measured: 120ms of HTTP overhead per hop × 4 hops = 480ms added latency. Unacceptable.

**Attempt 3: Redis pub/sub + workers (current).** Services communicate via Redis channels. The Node.js WS handler publishes audio chunks; Python workers subscribe and process. Total inter-service overhead: ~15ms. This is what we run in production.

The other big iteration was **TTS selection**. We tried three providers:

| Provider | Latency (first chunk) | Cost/1k chars | Naturalness |
|---|---|---|---|
| ElevenLabs | 280ms | $0.30 | Excellent |
| Azure TTS | 120ms | $0.016 | Good |
| Cartesia | 90ms | $0.065 | Very Good |

We ended up on Azure TTS for cost at scale, with Cartesia as the fallback for high-stakes sessions where naturalness matters more.

---

## Architecture / Flow Diagram

```
┌─────────────────────────────────────────────────────────┐
│                      Browser                            │
│  [Mic] → AudioContext(16kHz) → ScriptProcessor → WS     │
│  WS ← ArrayBuffer(PCM) ← TTS AudioPlayer               │
└────────────────┬────────────────────────────────────────┘
                 │ WebSocket (raw PCM chunks)
                 ▼
┌─────────────────────────────────────────────────────────┐
│              Node.js WS Gateway                         │
│  - Session auth + rate limiting                         │
│  - Publishes to Redis: audio:{sessionId}               │
│  - Subscribes from Redis: tts:{sessionId}              │
└──────┬────────────────────────────────────────┬─────────┘
       │ Redis pub/sub                           │ Redis pub/sub
       ▼                                         ▼
┌─────────────┐    transcript:{id}   ┌──────────────────┐
│  VAD Worker │ ──────────────────→  │ Whisper Worker   │
│  (Python)   │                      │ (Python, GPU)    │
│  Silero VAD │                      │ large-v3, fp16   │
└─────────────┘                      └────────┬─────────┘
                                              │ transcript:{id}
                                              ▼
                                    ┌──────────────────┐
                                    │  LLM Orchestrator│
                                    │  (Node.js)       │
                                    │  Claude API      │
                                    │  Streaming       │
                                    └────────┬─────────┘
                                             │ llm_stream:{id}
                                             ▼
                                    ┌──────────────────┐
                                    │   TTS Worker     │
                                    │   Azure / Cart.  │
                                    │   Streams audio  │
                                    └──────────────────┘
```

Data flows left-to-right through Redis channels. Each worker autoscales independently via Kubernetes HPA based on queue depth, not CPU.

---

## Learnings & Outcomes

After 3 months in production across 40,000+ interview sessions:

- **End-to-end latency (P50):** 720ms from end-of-speech to first TTS audio chunk
- **End-to-end latency (P95):** 1,180ms
- **Transcription WER on technical terms:** ~3% (down from 12% without domain prompt)
- **False turn-end rate:** 4% (down from 31% with naive silence threshold)
- **Session completion rate:** 71% (up from 34% text-only)
- **Cost per session (30-min interview):** ~$0.18 (vs $2.40 with ElevenLabs-native stack)

The biggest surprise: candidates with strong accents had better completion rates than with text (which has a self-selection bias — non-native speakers often abandon text interviews faster). Whisper's multilingual training helps here.

---

## Suggestions

**1. Don't optimize latency before you have a working pipeline.** We spent a week optimizing audio compression before we had end-to-end flow. Wrong order.

**2. Invest in VAD early.** The turn detection problem is harder than transcription. A bad VAD makes the entire conversation feel broken no matter how fast your LLM is.

**3. Domain prompts for Whisper are free latency wins.** If you know your domain vocabulary, provide it as `initial_prompt`. It costs nothing and meaningfully improves accuracy.

**4. Stream everything.** Whisper → LLM → TTS. Each stage should start as soon as it has partial input. The perceived latency drops dramatically even if total compute time doesn't.

**5. Measure what candidates experience, not what your monitors show.** We had great P99 latency on our dashboards. Candidates were still frustrated. We added client-side timing (time from mic cutoff to first audio byte) and discovered a 200ms gap we'd been blind to.

The voice pipeline is now the core of every HyrecruitAI session. If you're building something similar and hit the same walls, the Redis pub/sub pattern and the Silero VAD heuristics are the two things I'd steal first.
