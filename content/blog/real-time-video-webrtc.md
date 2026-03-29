---
title: "Building Real-Time Video Interviews with WebRTC"
description: "How we built reliable real-time video interviews at HyrecruitAI using WebRTC — signaling, TURN/STUN servers, network resilience, and recording."
date: "2026-02-10"
tags: webrtc, video, real-time, infrastructure
coverImage: /thumbnail.jpg
featured: true
---

# Building Real-Time Video Interviews with WebRTC

Video interviews are the core of HyrecruitAI. If the video drops, the interview fails, the candidate has a terrible experience, and the company loses trust in our platform. We could not afford to treat video as a secondary feature. Here is how we built it.

## Why WebRTC and Not a Third-Party SDK

We evaluated Twilio Video, Daily.co, and Agora before deciding to build on raw WebRTC with a thin signaling layer. The reasons:

- **Cost**: At our scale, per-minute pricing from video SDKs added up fast. WebRTC peer connections are free.
- **Control**: We needed to hook into the media streams for real-time transcription and AI analysis. Third-party SDKs made this difficult or impossible.
- **Latency**: Direct peer-to-peer connections give us the lowest possible latency for interview conversations.

The tradeoff is complexity. WebRTC is powerful but unforgiving.

## Signaling Architecture

WebRTC needs a signaling channel to exchange connection metadata (SDP offers/answers and ICE candidates). We built ours on top of WebSocket connections through our Next.js backend:

```typescript
// Simplified signaling flow
socket.on('offer', async (data) => {
  const pc = new RTCPeerConnection(rtcConfig);
  await pc.setRemoteDescription(new RTCSessionDescription(data.offer));
  const answer = await pc.createAnswer();
  await pc.setLocalDescription(answer);
  socket.emit('answer', { answer, roomId: data.roomId });
});

pc.onicecandidate = (event) => {
  if (event.candidate) {
    socket.emit('ice-candidate', {
      candidate: event.candidate,
      roomId,
    });
  }
};
```

The signaling server is stateless. It relays messages between participants in a room and does nothing else. All the heavy lifting happens in the browser.

## TURN/STUN Server Setup

This is where most WebRTC implementations break in production. STUN servers help peers discover their public IP addresses and work for about 80% of connections. The other 20% -- corporate firewalls, symmetric NATs, restrictive networks -- need TURN servers to relay media traffic.

We run our own TURN servers using coturn on Azure VMs in three regions:

- **US East** for North American interviews
- **EU West** for European interviews
- **Southeast Asia** for APAC coverage

```typescript
const rtcConfig: RTCConfiguration = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    {
      urls: 'turn:turn-us.hyrecruit.ai:443?transport=tcp',
      username: credentials.username,
      credential: credentials.password,
    },
  ],
  iceTransportPolicy: 'all',
};
```

We use TCP on port 443 for TURN as a fallback because some corporate firewalls block UDP entirely. The credentials rotate every 12 hours using a shared secret.

## Handling Network Instability

Real-world networks are messy. Candidates interview from coffee shops, shared apartments, and mobile hotspots. We built several layers of resilience:

- **Adaptive bitrate**: We monitor `RTCPeerConnection.getStats()` every 2 seconds and adjust video resolution and framerate based on available bandwidth. If bandwidth drops below 500kbps, we switch to audio-only with a static avatar.
- **Reconnection logic**: If the ICE connection state transitions to `disconnected`, we attempt an ICE restart before falling back to a full renegotiation. Most interruptions resolve within 3-5 seconds.
- **Connection quality indicator**: The UI shows a real-time connection quality badge (green/yellow/red) so participants know if their network is struggling.

```typescript
pc.onconnectionstatechange = () => {
  if (pc.connectionState === 'disconnected') {
    attemptIceRestart(pc);
  }
  if (pc.connectionState === 'failed') {
    initiateFullReconnection(roomId);
  }
};
```

## Recording

We need recordings for two reasons: candidates can review their performance, and our AI evaluation engine processes the transcript. We record server-side using a headless Chrome instance that joins each interview as a silent participant.

The recorder captures the composite media stream, pipes it through FFmpeg for encoding, and uploads chunks to Azure Blob Storage in near-real-time. If the recorder crashes, the interview continues unaffected -- recording is a non-blocking side effect.

This architecture also feeds our real-time transcription pipeline. The audio stream from the recorder goes to Azure Speech Services, and the transcript is available to the AI evaluator within seconds of each response.

## Lessons from Production

After handling thousands of interviews, these are the hard-won takeaways:

- **Always deploy TURN servers.** The 20% of users who need them are often the most important ones (enterprise clients behind corporate firewalls).
- **Test on real networks.** Chrome DevTools throttling does not replicate the packet loss patterns of a crowded airport WiFi.
- **Separate recording from the call path.** If your recording infrastructure is coupled to the call, a recording bug becomes an interview-ending bug.

WebRTC is not easy, but for our use case, owning the video layer has been one of the best technical decisions we made.
