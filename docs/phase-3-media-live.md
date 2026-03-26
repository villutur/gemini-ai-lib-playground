# Phase 3: Video, Live, Persistence, and Previews

## Objectives
Implement the remaining services (Video, Music, Live), build the local `.data/` persistence layer, and add media previews.

## Tasks

### 1. Service Pages UI & Live API
- [ ] **Music Page:** Add prompt and optional image guide inputs.
- [ ] **Video Page:** Add prompt, image-to-video, and extend video modes.
- [ ] **Live Page:** Implement browser-only session UI (system instruction, tools, voice toggles, connect/disconnect, event log).
- [ ] Implement `GET /api/live/key` (Server) to return `{ apiKey }` securely to the client for the Live page.

### 2. Persistence Layer (Server)
- [ ] Create a local file storage utility for `.data/` mapped by service: `.data/text/`, `.data/image/`, etc.
- [ ] Update `POST /api/run/:service` to persist every run into a stable `{timestamp}-{shortId}` folder.
  - Write `request.json` and `result.json`.
  - Write generated binary files (images, audio, video).
  - Write `example.ts` (passed from the client or generated server-side).
- [ ] Implement `GET /api/runs/:service` (List runs).
- [ ] Implement `GET /api/runs/:service/:runId` (Run metadata/preview).
- [ ] Implement `GET /api/runs/:service/:runId/files/:fileName` (Download artifact).

### 3. Previews (Client)
- [ ] Implement specific preview components for the result panel:
  - Audio/Music: HTML5 audio player.
  - Video: HTML5 video player.
  - Image: Image preview/thumbnail.
  - Text/Chat: Formatted text/markdown.
  - Embedding: Truncated vector/metadata preview.

## Acceptance Criteria
- Video and Music requests execute correctly.
- Live page connects to Gemini Live using the fetched API key.
- All executions (except Live, for now) correctly save inputs, outputs, and artifacts to `.data/`.
- The server serves persisted runs and artifacts.