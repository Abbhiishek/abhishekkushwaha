---
title: 'vaaniflow: The Open-Source Dictation Platform for Windows'
description: 'How VaaniFlow turns a global shortcut, chunked speech recognition, deterministic text processing, personal vocabulary, and Windows text injection into a system-wide dictation workflow.'
date: '2026-07-13'
tags: speech-to-text, windows, electron, whisper, open-source
coverImage: /me.webp
featured: true
---

Speech-to-text is only one step in a useful dictation product.

The harder problem is everything around it: starting from anywhere in Windows, capturing clean audio, preserving context across chunks, correcting domain-specific words, formatting the result without changing its meaning, and returning the text to the application where the user was already working.

That is the problem I built [VaaniFlow](https://github.com/Abbhiishek/vaaniflow) to explore. **Vaani** is the Windows desktop application; **VaaniFlow** is the open repository and product foundation behind it. The default interaction is deliberately small: hold a shortcut, speak, release, and receive text at the current cursor.

The architecture behind that interaction is not small.

One distinction matters before going deeper: VaaniFlow is currently **local-first**, not fully offline. Settings, history, snippets, dictionary entries, and profile data stay on the device, and there is no required VaaniFlow account or hosted backend. Transcription currently uses the user's configured Azure OpenAI Whisper deployment, so audio leaves the device for inference and the API key is required during normal use, not only during setup. A pluggable local inference provider is a future direction, not a feature I want to imply already exists.

That boundary is part of the design, not a footnote.

## The Product Problem Is Workflow Interruption

Most dictation demos stop after producing a transcript. A Windows dictation tool has to complete a longer contract:

1. Work while another application has focus.
2. Start and stop without forcing the user into a recording window.
3. Recognize names, commands, acronyms, and project vocabulary.
4. Preserve the speaker's intent during optional cleanup.
5. Insert the result into browsers, editors, chat clients, documents, and terminals.
6. Recover gracefully when the network, provider, microphone, or target application fails.

The user should experience one action. Internally, VaaniFlow treats it as a stateful pipeline with explicit boundaries.

```text
Global shortcut
      |
      v
Recording overlay -> 16 kHz mono PCM -> silence-aware WAV chunks
      |                                      |
      | live waveform                        v
      |                            Azure OpenAI Whisper
      |                                      |
      v                                      v
Session state machine <- ordered partial transcripts + previous-chunk context
      |
      v
Commands -> snippet protection -> optional polish -> dictionary replacements
      |
      v
Clipboard + Win32 keyboard input -> focused Windows application
      |
      v
Local history, latency data, vocabulary learning, and failure recovery
```

This is closer to a desktop automation system than a thin model wrapper.

## The Main Components

VaaniFlow is built with Electron and plain JavaScript. The renderer is intentionally limited to interface and microphone work; the Electron main process owns orchestration, provider calls, local persistence, shortcuts, text injection, and updates.

| Component                | Responsibility                                                                      | Important boundary                                                                   |
| ------------------------ | ----------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------ |
| Global hotkey listener   | Detect push-to-talk, hands-free toggles, cancellation, and shortcut conflicts       | Must work while another app is focused                                               |
| Recording overlay        | Capture microphone PCM, estimate ambient noise, trim silence, and emit WAV chunks   | Has microphone access but no direct provider credentials                             |
| Session state machine    | Coordinate recording, transcription, processing, paste, cancellation, and recovery  | Prevent stale asynchronous work from mutating a newer session                        |
| Transcriber              | Build Azure Whisper requests, apply timeouts, and retry transient failures once     | Provider-specific code stays behind one module                                       |
| Post-processing pipeline | Apply voice commands, snippets, cleanup, styles, and dictionary replacements        | Ordering must preserve user text exactly where promised                              |
| Windows injector         | Find the foreground app and paste through the clipboard plus Win32 `SendInput`      | Target applications do not expose one universal text API                             |
| Local store              | Persist settings, provider configuration, history, snippets, and dictionary entries | Current JSON storage is simple and inspectable, but secrets need stronger protection |

Electron's `contextIsolation` is enabled and Node integration is disabled in renderer windows. A preload bridge exposes named operations instead of handing the renderer unrestricted IPC access. That follows Electron's security guidance and keeps provider credentials and privileged desktop operations in the main process.

## A Session Is a State Machine, Not a Button

The core session moves through three top-level states:

```text
idle -> recording -> processing -> idle
           |             |
           +-> cancel ---+
```

The recording state has two modes.

- **Push-to-talk:** hold the configured shortcut and release it to finish.
- **Hands-free:** tap the shortcut, or press Space while holding it, and stop later with another action or configured silence detection.

This distinction makes the interaction fast for short messages without making long dictation uncomfortable.

The state machine also protects against races. Audio chunks may still be transcribing when the user cancels or starts another session. VaaniFlow increments a generation counter when resetting the pipeline. Every asynchronous result checks that generation before updating state. A late response from an old recording is ignored instead of being pasted into the wrong application.

That is a small implementation detail with a large product consequence: asynchronous speech systems must treat cancellation as invalidation, not just a visual state change.

## Chunking Hides the Tail Latency

Waiting to upload a complete recording makes every second of inference visible after the user stops speaking. VaaniFlow's fast mode moves part of that work into the recording period.

The overlay captures 16 kHz mono PCM through an `AudioWorklet`. It estimates a noise floor, detects natural pauses, preserves a small amount of padding, and emits WAV chunks. A chunk is cut after enough speech and silence, or after a forced maximum duration so a noisy room cannot create an unbounded buffer.

The main process transcribes chunks sequentially. The tail of the previous transcript is included as decoder context for the next request, together with preferred dictionary terms and snippet trigger phrases.

```javascript
const prompt = buildPrompt(settings, previousTranscriptTail);
const rawText = await transcribe(wavChunk, settings, { prompt });
previousTranscriptTail = cleanArtifacts(rawText).slice(-200);
```

Sequential processing is intentional. Parallel requests might finish faster in aggregate, but they can reorder text and lose boundary context. Dictation values a coherent sentence more than maximum request concurrency.

When the user releases the shortcut, earlier chunks may already be complete. Only the final audio and downstream cleanup remain on the critical path. VaaniFlow records transcription, polish, paste, and total post-release latency separately so future optimization can target the real bottleneck rather than one blended number.

## Recognition Is Only the First Draft

Raw speech recognition output is not ready to paste blindly. VaaniFlow uses a layered post-processing pipeline:

1. Remove known non-speech annotations and isolated hallucinated caption phrases.
2. Apply correction commands such as "scratch that."
3. Convert spoken punctuation and layout commands such as "new paragraph."
4. Detect and protect saved snippet triggers.
5. Optionally polish the surrounding text with a configured chat deployment.
6. Apply deterministic personal dictionary replacements.
7. Restore protected snippet text exactly.

The order is the design.

If dictionary replacements run before the model-based cleanup, the model can undo a preferred spelling. If snippets expand before cleanup without protection, a model can paraphrase a saved address, signature, command, or template. VaaniFlow replaces inline snippets with markers such as `[[VAANI_SNIPPET_0]]`, tells the polishing model to preserve them, verifies that every marker survived, and only then restores the original content.

If a marker disappears, the system falls back to the unpolished transcript rather than risk silently damaging the user's saved text.

That is the broader rule I want in AI-assisted writing tools: **probabilistic transformation should fail open into deterministic behavior**.

## The Personal Dictionary Has Two Jobs

A dictation dictionary is more than a list of replacements.

Before transcription, VaaniFlow uses preferred terms as Whisper prompt hints. This increases the chance that project names, acronyms, people, and technical identifiers are recognized with the expected spelling.

After transcription and optional cleanup, deterministic rules replace known variants. A user can map "kube control" to `kubectl`, preserve a product's unusual capitalization, or expand a frequently misheard name.

The application can also learn repeated high-confidence candidates such as acronyms, camelCase identifiers, and proper nouns used inside sentences. Learning is local and conservative: repeated candidates are counted before being promoted into visible dictionary entries.

These stages solve different problems:

| Stage                     | Goal                                     | Guarantee                               |
| ------------------------- | ---------------------------------------- | --------------------------------------- |
| Prompt hint               | Influence recognition before text exists | Best effort                             |
| AI cleanup instruction    | Preserve known terms while formatting    | Probabilistic, validated where possible |
| Deterministic replacement | Enforce the final spelling or expansion  | Exact match behavior                    |

Combining them is more reliable than expecting one prompt to solve personalization.

## Text Injection Is the Windows-Specific Core

Producing a good transcript is not enough if the user has to switch windows and paste it manually.

VaaniFlow keeps a small PowerShell helper alive and compiles a C# bridge to Win32 APIs. The helper reads the foreground process, writes the transcript to Electron's clipboard, releases modifiers that may still be held from the dictation shortcut, and sends a paste chord through `SendInput`.

Terminals are handled separately because many expect `Ctrl+Shift+V` instead of `Ctrl+V`. The app identifies common terminal process names and chooses the appropriate chord. Clipboard restoration is optional and delayed; before restoring, VaaniFlow checks that the clipboard still contains the dictated text so it does not overwrite something the user copied in the meantime.

This pragmatic design works across many applications because it uses the interaction they already support: paste.

It also has limits. Microsoft's documentation notes that `SendInput` is subject to User Interface Privilege Isolation. A normally launched dictation app cannot reliably inject input into a higher-integrity application running as administrator. Some remote desktops, games, protected fields, custom editors, and Electron applications may also handle simulated paste differently.

The right response is not to hide those edges. It is to make injection observable and build fallbacks:

- leave the transcript on the clipboard when paste fails;
- show a clear completion state instead of pretending insertion succeeded;
- offer app-specific adapters where a stable API exists;
- test elevated, terminal, browser, Office, messaging, and remote-session targets separately.

## Local-First Does Not Mean Fully Local

VaaniFlow currently has no required account and no VaaniFlow-hosted backend. The application stores its operating data as local JSON files under the Windows user-data directory.

| Data                                  | Current location                                                                 | Leaves the device?                                                  |
| ------------------------------------- | -------------------------------------------------------------------------------- | ------------------------------------------------------------------- |
| Settings and preferences              | Local                                                                            | No                                                                  |
| Transcript history and usage insights | Local                                                                            | No                                                                  |
| Personal dictionary and snippets      | Local                                                                            | No                                                                  |
| Provider endpoint and API key         | Local configuration file                                                         | Used to authenticate provider calls                                 |
| Recorded audio                        | Memory during normal processing; failed chunks may be saved locally for recovery | Yes, sent to the configured Azure OpenAI resource for transcription |
| Text sent for optional polishing      | Local before request                                                             | Yes, when AI polishing is enabled                                   |

This model gives users control over the provider resource and avoids a second hosted data layer. It also creates responsibilities.

The current provider credential is stored in an editable local configuration file. That is convenient for an early open-source release, but it should move behind Windows Data Protection API or Credential Manager while preserving an import path for advanced users. Local-first software should protect local secrets, not only avoid a central database.

The other major improvement is provider abstraction. The session layer should not know whether transcription came from Azure OpenAI, the OpenAI API, a local `whisper.cpp` process, or another engine.

```javascript
class TranscriptionProvider {
  async warmup(settings) {}
  async transcribe(wavBuffer, { prompt, language, signal }) {
    throw new Error('Not implemented');
  }
  async healthcheck() {
    return { ok: true };
  }
}
```

With that boundary, a local provider can trade download size, memory, startup time, and hardware requirements for offline inference and zero per-request provider cost. A cloud provider can prioritize low setup complexity, model quality, and lighter client requirements. Users should be able to choose that tradeoff explicitly.

## Failure Modes Worth Designing First

Speech software touches hardware, networks, external APIs, operating-system hooks, and arbitrary target applications. Failure is normal.

| Failure                               | Current behavior                                                            | Next improvement                                          |
| ------------------------------------- | --------------------------------------------------------------------------- | --------------------------------------------------------- |
| Microphone denied or unavailable      | Return to idle and surface an error                                         | Add guided Windows permission recovery                    |
| Transient network or provider error   | Retry once; preserve failed WAV chunks locally if transcription still fails | Add an explicit retry queue with user-controlled deletion |
| Near-silent audio                     | Trim silence and reject empty speech                                        | Expose input-level diagnostics during setup               |
| Old async result arrives after cancel | Generation check discards stale work                                        | Add race-focused integration tests around rapid restart   |
| AI polish times out or looks unsafe   | Fall back to deterministic transcript formatting                            | Show whether pasted text was polished or raw              |
| Snippet marker is changed             | Reject polished output and restore from protected source                    | Version snippet syntax for future providers               |
| Simulated paste fails                 | Keep the generated text available and log failure                           | Add clipboard-only mode and per-app strategies            |
| Local settings schema changes         | Migrate entries and keep a pre-migration backup                             | Add export/import and recovery UI                         |
| Installer is untrusted by Windows     | User may see reputation warnings                                            | Sign release artifacts and document verification          |

The important pattern is that user speech should not disappear. A provider outage is inconvenient; losing a paragraph the user already dictated is a product failure.

## What I Would Improve Next

The next phase is less about adding a longer feature list and more about hardening the boundaries.

### 1. Make transcription providers pluggable

Extract the Azure request logic behind a provider contract, then add a local engine as a first-class option. Keep chunking, commands, snippets, history, and injection provider-independent.

### 2. Protect credentials with Windows-native storage

Store secrets with DPAPI or Credential Manager and keep non-secret provider configuration editable. Redact credentials from diagnostics and exports.

### 3. Add a real license file

The repository currently declares MIT in its README and package metadata, but it does not include a root `LICENSE` file. Adding the license text is necessary to make contribution and reuse terms unambiguous rather than relying on metadata alone.

### 4. Sign Windows releases

The GitHub Actions release workflow builds and publishes NSIS installers, but it does not currently sign them. Code signing and documented checksums would make installation and update trust clearer.

### 5. Treat integrations as adapters

LinkedIn, WhatsApp, Outlook, terminals, and Electron apps should not become conditionals scattered across the session pipeline. An adapter can define matching rules, paste strategy, default writing style, and known limitations while the core remains application-agnostic.

### 6. Measure quality without creating surveillance

Local latency and correction metrics can answer useful questions: Which stage is slow? Which terms are repeatedly corrected? Which target apps fail to paste? Diagnostics should be opt-in, inspectable, and exportable, with no default requirement to send a behavioral profile to a VaaniFlow service.

## A Practical Contribution Checklist

Before adding a dictation feature, I would ask:

- Does it work without moving focus away from the target application?
- Does cancellation invalidate every pending asynchronous operation?
- Can provider failure lose recorded speech?
- Is model-generated text validated before it replaces deterministic output?
- Are snippets, names, commands, numbers, and code identifiers preserved?
- Does the feature behave differently in terminals or elevated applications?
- Is sensitive data stored locally, sent to a provider, or both?
- Can the user understand which boundary failed?
- Does the implementation add a provider-specific assumption to the core session?
- Is there a test for the failure path, not only the happy path?

That checklist is more valuable than another settings toggle.

## The Takeaway

VaaniFlow is an experiment in making speech input feel native to Windows instead of feeling like a separate transcription website.

The model matters, but the product is the pipeline around it: keyboard hooks, adaptive audio capture, ordered chunks, context hints, deterministic commands, protected snippets, app-aware formatting, Windows text injection, local history, and recovery when one of those pieces fails.

The most important architectural lesson from building it is simple: **dictation quality is not transcript accuracy alone. It is the probability that the user's intended text reaches the intended application without surprise.**

VaaniFlow is available on [GitHub](https://github.com/Abbhiishek/vaaniflow), and the Windows download and project overview are available at [vaaniflow.vercel.app](https://vaaniflow.vercel.app).

## Technical References

- [VaaniFlow source repository](https://github.com/Abbhiishek/vaaniflow)
- [Azure OpenAI Whisper quickstart](https://learn.microsoft.com/en-us/azure/ai-foundry/openai/whisper-quickstart)
- [Electron context isolation](https://www.electronjs.org/docs/latest/tutorial/context-isolation)
- [Microsoft `SendInput` documentation](https://learn.microsoft.com/en-us/windows/win32/api/winuser/nf-winuser-sendinput)
- [Windows `CryptProtectData` documentation](https://learn.microsoft.com/en-us/windows/win32/api/dpapi/nf-dpapi-cryptprotectdata)
- [Electron code-signing guidance](https://www.electronjs.org/docs/latest/tutorial/code-signing)
- [GitHub guidance on repository licensing](https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/licensing-a-repository)
