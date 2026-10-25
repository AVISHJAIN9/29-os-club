# Architecture Decisions Log (ADR)

| Decision | Chosen Option | Alternative Considered | Deciding Factor |
|---|---|---|---|
| **Vision Pipeline** | MediaPipe Hands WebAssembly | Cloud GPU Inference API | Zero network latency and 100% camera privacy. |
| **Document Engine** | Mozilla PDF.js | Server PNG Pre-conversion | Vector-sharp rendering at all zoom levels. |
| **Debounce Strategy**| Velocity + 500ms Lock | Simple Timestamp Check | Rejects natural conversational hand movement. |
