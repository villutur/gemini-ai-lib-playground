# Phase 1: App Shell, Routing, Env, and Meta API

## Objectives
Establish the foundational client and server structure. Implement routing, the shared page layout, environment validation, and the metadata API that drives the UI.

## Tasks

### 1. Environment & Setup
- [ ] Add `.env.example` with `GEMINI_API_KEY=` and `PORT=3001`.
- [ ] Implement startup validation in the Express server to fail clearly if `GEMINI_API_KEY` is missing.
- [ ] Define shared TypeScript interfaces in `shared/` or `client/src/types/`: `ServiceId`, `ServicePageDefinition`.

### 2. App Structure & Routing (Client)
- [ ] Set up React Router for SPA navigation.
- [ ] Create a left navigation sidebar with links to all 8 service pages: `/text`, `/chat`, `/embedding`, `/image`, `/audio`, `/music`, `/video`, `/live`.
- [ ] Implement the shared high-level page layout component:
  - Header (Service name, model picker, capability summary)
  - Layout areas for: preset selector, request form, code panel, execution result, saved runs list.

### 3. Meta API (Server)
- [ ] Implement `GET /api/meta` endpoint.
  - Returns available service definitions, known models, and capability/config summaries by importing and exposing `@villutur/gemini-ai-lib` metadata.
  - Returns preset metadata (curated static data).

### 4. Client Metadata Integration
- [ ] Fetch `/api/meta` on client startup.
- [ ] Wire the metadata into the shared page header (populate the model picker based on the selected service).

## Acceptance Criteria
- App starts, routing works, and navigating between services updates the URL and page title.
- The server fails to start without a API key.
- `GET /api/meta` successfully serves capability descriptors to the client.