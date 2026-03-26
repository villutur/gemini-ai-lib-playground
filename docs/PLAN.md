# `gemini-ai-lib-playground`: Local Service Playground v1

## Summary
Build `gemini-ai-lib-playground` as a local-only React + Vite client with an Express backend that exposes one playground page per interactive `@villutur/gemini-ai-lib` service:

- Text
- Chat
- Embedding
- Image
- Audio
- Music
- Video
- Live

`GeminiBaseService` does not get its own page because it is a shared base layer, not a runnable user-facing service.

The playground should let a developer:
- pick a model per service
- build config from the config/capability metadata exported by `@villutur/gemini-ai-lib`
- choose curated presets that prefill prompt + config
- see generated implementation code for the current form state
- run the request
- save results under `.data/`
- browse previous runs on each page with preview + download

Default runtime policy:
- all services except Live execute server-side
- `GeminiLiveChatSession` executes client-side only
- the client fetches `GEMINI_API_KEY` through a local API endpoint for Live
- no auth or security hardening is required in this phase

## Implementation Changes

### 1. App structure and routing
Use a routed SPA with a left navigation and one page per service:
- `/text`
- `/chat`
- `/embedding`
- `/image`
- `/audio`
- `/music`
- `/video`
- `/live`

Add one lightweight overview/home page only if it helps navigation, but the service pages are the primary product surface.

Each service page uses the same high-level layout:
- header with service name, model picker, and short capability summary
- preset/example selector
- request form
- generated implementation code panel
- execution result panel
- saved runs list for that service

### 2. Config-driven forms
Use the exported capability/config metadata from `@villutur/gemini-ai-lib` as the canonical input for building config UIs wherever available.

Descriptor-driven pages:
- Text
- Embedding
- Image
- Audio
- Music
- Video
- Live

Special case:
- Chat uses the text-model catalog and capability helpers for model selection, but its session form is hand-authored because the library does not export a dedicated chat config-option catalog.

Generic form rendering rules:
- `string` + `allowedValues` -> select
- `string` without enum -> text input
- `number` -> number input
- `boolean` -> checkbox/toggle
- `array` + `allowedValues` -> multi-select chips or checkbox group
- `object` or unsupported array shapes -> JSON textarea with inline validation/help

Every page should also expose the service-specific non-config inputs that are not part of the config descriptors:
- Text: prompt or content mode
- Chat: message input, initial history, session options
- Embedding: single text, multi-text batch, or multimodal content entries
- Image: prompt, optional reference images, optional SVG mode
- Audio: text plus optional style/tone prompt
- Music: prompt and optional image guide
- Video: prompt, image-to-video, or video extension mode
- Live: system instruction, tools, voice, session toggles, connect/disconnect

### 3. Presets and generated code
Add a curated preset catalog per service as repo-tracked data, not user-editable storage.

Each preset includes:
- id
- label
- short description
- recommended model
- input payload
- config payload
- optional tags

Preset behavior:
- selecting a preset prefills the form immediately
- the generated code snippet updates from the resulting form state
- users can then keep editing the form

Generated code behavior is locked to the current form state, not static snippets:
- every service page shows implementation code based on the current input/config
- include `typescript` examples using `@villutur/gemini-ai-lib`
- include import, service construction, request call, and basic result handling
- add copy-to-clipboard
- save the snippet alongside each persisted run as `example.ts`

Live page code examples must be clearly marked as client-side only.

### 4. Backend execution API
Use the Express server as the execution layer for all non-live services.

Environment:
- read `GEMINI_API_KEY` from process env
- add `.env.example` with at least:
  - `GEMINI_API_KEY=`
  - `PORT=3001`

Server endpoints:
- `GET /api/meta`
  - returns available service definitions, known models, basic capability summaries, and preset metadata needed by the UI
- `POST /api/run/:service`
  - executes one service request
  - accepts JSON for text/chat/audio and mixed JSON + multipart for pages with file input
- `GET /api/runs/:service`
  - lists saved runs for the service
- `GET /api/runs/:service/:runId`
  - returns run metadata and preview payload
- `GET /api/runs/:service/:runId/files/:fileName`
  - downloads persisted artifacts
- `GET /api/live/key`
  - returns `{ apiKey }` for local Live usage only

Transport choice:
- use `multipart/form-data` for any page that may upload binary inputs
- use JSON only for pages with text-only input

### 5. Persistence in `.data/`
Persist all generated outputs under `.data/` in repo-local storage, with one folder per service and run.

Recommended structure:
- `.data/text/...`
- `.data/chat/...`
- `.data/embedding/...`
- `.data/image/...`
- `.data/audio/...`
- `.data/music/...`
- `.data/video/...`
- `.data/live/...`

Per-run folder contents:
- `request.json`
- `result.json`
- `example.ts`
- generated binary/media files when applicable
- optional `preview.*` file when a direct preview artifact is useful

Use a stable run folder naming pattern such as:
- `{timestamp}-{shortId}`

Service-specific persistence defaults:
- Text: response text as `.md` or `.txt` plus JSON metadata
- Chat: transcript JSON plus readable markdown transcript
- Embedding: `embeddings.json` plus summarized preview metadata
- Image: image or SVG files plus JSON metadata
- Audio/Music: audio files plus JSON metadata
- Video: downloaded video file plus JSON metadata
- Live: transcript/event log JSON; no binary persistence required in v1 unless the session later exposes saved audio chunks

### 6. Preview and download behavior
Each service page lists prior runs for that service only.

Preview defaults:
- Text/Chat: preview text directly in the UI
- Embedding: preview metadata plus truncated vectors, not full raw arrays by default
- Image: thumbnail/full preview
- Audio/Music: audio player
- Video: video player
- Live: transcript/event timeline

Downloads should expose all persisted run artifacts, not just the primary output.

### 7. Service-specific page behavior
Use the library’s natural service API shape instead of forcing one generic request model.

Recommended page modes:
- Text: `Prompt` and `Content Array`
- Chat: persistent session with send-message flow and visible history
- Embedding: `Single Text`, `Batch Text`, `Multimodal Content`
- Image: `Prompt/Image Generation` and `SVG Generation`
- Audio: `Text to Speech`
- Music: `Prompt` and `Image-Guided`
- Video: `Prompt`, `Image to Video`, `Extend Video`
- Live: browser-only session page with connect/disconnect, event log, live transcripts, and basic mic/audio controls

### 8. UI and implementation style
Keep the first version intentionally practical and lightweight:
- React Router for navigation
- shared page shell and reusable service form sections
- simple local state per page, no heavy global state system unless reuse clearly justifies it
- one shared “config form renderer” fed by capability descriptors
- one shared “saved runs list” component
- one shared “generated code panel” component

The visual style can stay clean and functional rather than polished-product-level in this phase.

## Public APIs / Interfaces
Internal playground contracts to add:

- `ServiceId = "text" | "chat" | "embedding" | "image" | "audio" | "music" | "video" | "live"`
- `PresetDefinition`
- `RunRecord`
- `RunArtifact`
- `RunPreview`
- `GeneratedCodeSnippet`
- `ServicePageDefinition`

Server route contract:
- `GET /api/meta`
- `POST /api/run/:service`
- `GET /api/runs/:service`
- `GET /api/runs/:service/:runId`
- `GET /api/runs/:service/:runId/files/:fileName`
- `GET /api/live/key`

Do not add a database. `.data/` remains the only persistence layer.

## Test Plan
- Routing:
  - every service page loads and shows the correct form shell
- Metadata-driven UI:
  - model selectors populate from exported model catalogs
  - config controls render from exported config descriptors
  - chat page uses its hand-authored session form without breaking the shared patterns
- Presets:
  - selecting a preset prefills input + config correctly
  - generated code updates from the applied preset and subsequent edits
- Execution:
  - server-side services run through `POST /api/run/:service`
  - live page fetches key from `GET /api/live/key` and initializes client-only session flow
- Persistence:
  - every successful run creates a folder in `.data/`
  - `request.json`, `result.json`, and `example.ts` are written
  - binary outputs are downloadable for image/audio/music/video
- Saved runs UI:
  - each page lists only its own runs
  - previews render correctly per service type
  - artifact download links work
- Env:
  - missing `GEMINI_API_KEY` produces a clear startup or runtime error
  - `.env.example` matches actual server expectations
- Validation:
  - `pnpm typecheck`
  - `pnpm build`

## Assumptions and Defaults
- This is a local developer playground, not a deployable multi-user product.
- Returning the raw API key from `/api/live/key` is acceptable in this repo because the user explicitly wants local-only behavior.
- Presets are curated repo data, not user-created saved templates in v1.
- Saved runs are append-only in v1; delete/rename management can wait.
- The playground should prefer the real exported metadata from `@villutur/gemini-ai-lib`; when a service does not expose enough metadata, the playground may use a thin hand-authored adapter rather than extending the library in this phase.
