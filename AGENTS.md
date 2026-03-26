# gemini-ai-lib-playground

This repository is a lightweight playground for experimenting with
`@villutur/gemini-ai-lib` in a simple full-stack setup.

## Purpose

- Provide a fast place to try Gemini integration ideas without affecting app or
  library repos.
- Keep the structure intentionally small: React + Vite on the client, Express
  on the server.
- Use this repo to validate usage patterns, examples, and integration flows
  before promoting reusable logic elsewhere.

## Project Structure

- `client/src/`: React client entrypoints and UI.
- `server/src/`: Express server routes and server-only integration code.
- `index.html`: Vite client HTML entrypoint.
- `vite.config.ts`: Vite config and local API proxy.
- `README.md`: consumer-facing project overview and startup instructions.
- `package.json`: scripts and dependency surface.

## Working Rules

- Keep all repository code, comments, docs, and commit messages in English.
- Prefer server-side Gemini access by default.
- Treat `GEMINI_API_KEY` as the standard server-side integration path.
- Treat browser-side Gemini access as an explicit exception, not the default.
- Keep playground-specific experiments in this repo.
- Keep reusable Gemini SDK abstractions in `@villutur/gemini-ai-lib`, not here.
- Do not use cross-repo relative source imports such as `../gemini-ai-lib/src/...`.
- Import the library through the package name: `@villutur/gemini-ai-lib`.
- Keep the server as the API boundary for client features that need secrets,
  request shaping, or file access.
- Keep the client focused on UI, interaction, and request orchestration.

## Documentation Maintenance

- Update `README.md` when setup, scripts, ports, or recommended usage changes.
- Add `docs/future-work.md` if the playground starts collecting deferred work
  beyond a few lightweight notes.
- If the repo grows meaningfully, align it with the workspace documentation
  structure under `docs/`.

## Validation

Use `pnpm` in this repository.

- `pnpm dev`: start the Vite client and Express server in watch mode
- `pnpm build`: build the client and compile the server
- `pnpm typecheck`: run TypeScript checks for both client and server

## Ownership Boundary

- Playground-only demos, experiments, and temporary integration code belong
  here.
- Reusable Gemini services, helpers, model catalogs, and capability metadata
  belong in `@villutur/gemini-ai-lib`.
- If a pattern becomes broadly useful, move it into the library instead of
  letting the playground become the source of truth.
