# gemini-ai-lib-playground

A comprehensive, local-first interactive playground for experimenting with Gemini multimodal services using the `@villutur/gemini-ai-lib` library.

## Features

- **Interactive Service Pages**: Dedicated interfaces for Text, Chat, Image, Audio, Music, Video, and Live sessions.
- **Config-Driven Forms**: UI forms are dynamically generated based on model capability descriptors from the library.
- **Real-time Code Snippets**: View and copy the exact TypeScript implementation for your current configuration.
- **Local Persistence**: Every successful run is saved locally in the `.data/` directory, including metadata, raw JSON results, and generated media files (WAV, MP4, PNG).
- **History Browser**: Review previous runs, download artifacts, and preview generated content directly in the app.
- **Voice Catalog**: Explore and listen to samples of all available Gemini voices.

## Prerequisites

- [Node.js](https://nodejs.org/) (v20 or higher recommended)
- [pnpm](https://pnpm.io/)
- A **Gemini API Key** (Get one at [Google AI Studio](https://aistudio.google.com/))

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/villutur/gemini-ai-lib-playground.git
cd gemini-ai-lib-playground
```

### 2. Install dependencies

```bash
pnpm install
```

### 3. Configure Environment

Create a `.env.local` file in the root directory:

```bash
GEMINI_API_KEY=your_api_key_here
PORT=3001
```

### 4. Start Development Mode

```bash
pnpm dev
```

This will start both the Express backend (port 3001) and the Vite frontend (port 5173). Open [http://localhost:5173](http://localhost:5173) in your browser.

## Tech Stack

- **Frontend**: React, Vite, React Router, Prism (Syntax Highlighting)
- **Backend**: Node.js, Express, Multer
- **Library**: [@villutur/gemini-ai-lib](https://github.com/villutur/gemini-ai-lib)
- **Persistence**: Local filesystem (no database required)

## License

MIT
