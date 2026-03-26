# Phase 2: Text, Chat, Image, and Audio Pages

## Objectives
Implement the config-driven form renderer, the execution API for the core generation services, and build the specific UI pages for Text, Chat, Embedding, Image, and Audio.

## Tasks

### 1. Config-Driven Form Renderer (Client)
- [ ] Build a generic form component driven by capability descriptors:
  - `string` + `allowedValues` -> select
  - `string` without enum -> text input
  - `number` -> number input
  - `boolean` -> checkbox/toggle
  - `array` + `allowedValues` -> multi-select chips/checkboxes
  - `object` / unknown -> JSON textarea with inline validation

### 2. Service Pages UI
- [ ] **Text Page:** Add Prompt and Content Array modes.
- [ ] **Chat Page:** Implement hand-authored session form (message input, initial history, session options) while integrating the shared model catalog.
- [ ] **Image Page:** Add prompt, optional reference images (file upload), and SVG mode toggle.
- [ ] **Audio Page:** Add text input and style/tone prompt.
- [ ] **Embedding Page:** Add Single Text, Batch Text, and Multimodal Content modes.

### 3. Execution API (Server)
- [ ] Implement `POST /api/run/:service`.
  - Handle JSON transport for text/chat/embedding/audio text.
  - Handle `multipart/form-data` for image/multimodal file uploads.
  - Execute the request using `@villutur/gemini-ai-lib`.
  - Return the raw result payload to the client.

### 4. Basic Execution UI (Client)
- [ ] Wire the "Run" button to `POST /api/run/:service`.
- [ ] Display the raw execution result in the execution result panel.

## Acceptance Criteria
- Forms render correctly based on metadata descriptors.
- Users can input data and execute Text, Chat, Embedding, Image, and Audio requests.
- Responses from the Gemini API are successfully returned to the client and displayed.