---
title: "Building a Real-Time AI Interviewer: Voice, Turn-Taking, and Latency Budgets"
description: "How I think about real-time AI voice systems in production: audio streaming, speech detection, transcription, LLM turn-taking, and the latency budget that makes an agent feel alive."
date: "2026-04-12"
tags: voice-agent, realtime-ai, websockets, llm, ai-engineering
coverImage: /thumbnail.jpg
featured: true
---

The difference between a chatbot and a voice agent is not speech. It is timing.

You can attach speech-to-text and text-to-speech to a normal LLM workflow and call it a voice agent, but users will feel the seams immediately. The agent cuts them off. It waits too long. It answers before the thought is finished. It speaks in paragraphs when a human would ask one sharp follow-up.

When I worked on AI interview flows, this became obvious very quickly. A live interview is not a document generation task. It is a real-time system with a conversation attached.

## The Product Constraint

For an AI interviewer, the user does not care that the model is clever if the interaction feels broken. The system has to do five things well:

1. Capture clean audio from the browser.
2. Detect when the candidate is actually done speaking.
3. Transcribe technical language accurately.
4. Generate a short, relevant next turn.
5. Speak back fast enough that the conversation still feels alive.

That creates a practical latency budget. If the candidate stops speaking and the agent takes three seconds to respond, trust drops. If it responds in under a second, the experience feels conversational.

The goal is not only lower latency. The goal is lower perceived latency with fewer conversational mistakes.

## The Pipeline

The basic pipeline looks simple:

```txt
Browser microphone
  -> WebSocket audio stream
  -> voice activity detection
  -> speech-to-text
  -> LLM turn generation
  -> text-to-speech
  -> browser playback
```

The implementation is where the real work begins.

Audio should be streamed in small chunks, not uploaded after the answer ends. The server needs enough buffering to avoid jitter, but not so much that every stage waits for a complete recording. The speech-to-text worker should receive audio as soon as there is a meaningful segment. The LLM should get a clean transcript plus the current interview state. The TTS layer should start as soon as the first usable sentence is available.

That architecture is less glamorous than a demo video, but it is the part that decides whether the product feels serious.

## Turn-Taking Is the Hardest Part

The first naive approach is silence detection: if the candidate is quiet for 500ms, assume the turn ended.

That fails in interviews.

People pause while thinking. They say "um" and restart. They stop for a second before giving the important part of the answer. If the agent jumps in during that pause, it feels rude and mechanical.

A better approach is voice activity detection plus conversational heuristics:

- Has the user spoken for long enough to count as an answer?
- Is the trailing silence long enough?
- Did the transcript end in an incomplete phrase?
- Is the current question asking for a long-form explanation?
- Did the candidate explicitly say they are done?

The agent should not treat silence as the only signal. Silence is an input, not a decision.

## Transcription Needs Domain Context

Generic transcription can handle daily conversation. Interviews contain vocabulary like "Kubernetes", "Postgres indexes", "event sourcing", "React Server Components", "latency", and "WebRTC". If the transcript corrupts those terms, the evaluation and follow-up quality suffer.

The fix is not only choosing a better STT model. The system should pass domain hints whenever possible:

- role being interviewed for
- question category
- expected technical vocabulary
- previous transcript context
- known company or stack terms

In an interview setting, transcription is not a standalone feature. It is part of the reasoning pipeline.

## LLM Turns Should Be Small

The LLM should not behave like a blog writer during a live conversation. It should be brief, specific, and stateful.

A good interviewer turn often does one of three things:

- asks a follow-up on a missing detail
- moves to the next question
- asks for clarification when the answer is ambiguous

The prompt should constrain that behavior. The model needs the current question, a small slice of history, the candidate transcript, and the interview policy. It does not need the entire session every time.

The response should also be streamable. If the first sentence is ready, TTS can begin while the rest of the response is still completing. That does not reduce total compute time, but it reduces the time the user spends waiting.

## What I Would Watch in Production

For this kind of system, I would track more than API latency.

Important metrics:

- end-of-speech to first audio byte
- false turn-end rate
- candidate interruption rate
- transcription confidence by question type
- retry rate for STT, LLM, and TTS
- average answer duration
- abandon rate after agent response delays

The strongest metric is not a backend metric at all. It is whether users continue speaking naturally after the first few turns. If they do, the system is earning trust.

## The Engineering Lesson

Real-time AI products are not just model wrappers. They are distributed systems with user psychology in the loop.

The model matters, but the product quality comes from everything around it: buffering, turn detection, prompt constraints, streaming, retries, fallbacks, and observability.

That is the kind of AI engineering I enjoy most. Not "call an API and display text", but building the system around the model so the experience feels reliable, useful, and human enough to keep going.
