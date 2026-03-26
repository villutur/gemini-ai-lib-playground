import express from "express";
import multer from "multer";
import {
  GEMINI_TEXT_MODELS,
  GEMINI_IMAGE_MODELS,
  GEMINI_AUDIO_MODELS,
  GEMINI_MUSIC_MODELS,
  GEMINI_EMBEDDING_MODELS,
  GEMINI_VIDEO_MODELS,
  GEMINI_LIVE_MODELS,
  getTextModelDisplayName,
  getTextModelConfigOptions,
  getImageModelConfigOptions,
  getAudioModelConfigOptions,
  getMusicModelConfigOptions,
  getEmbeddingModelConfigOptions,
  getVideoModelConfigOptions,
  getLiveModelConfigOptions,
  GeminiTextService,
  GeminiChatService,
  GeminiImageService,
  GeminiAudioService,
  GeminiEmbeddingService,
} from "@villutur/gemini-ai-lib";
import dotenv from "dotenv";
import { existsSync, mkdirSync } from "node:fs";
import { isAbsolute, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";


function loadEnvFiles(): void {
  const candidates = [
    join(process.cwd(), ".env.local"),
    join(process.cwd(), ".env"),
  ];

  const seen = new Set<string>();

  for (const path of candidates) {
    const normalizedPath = resolve(path);
    if (seen.has(normalizedPath) || !existsSync(normalizedPath)) {
      continue;
    }

    dotenv.config({
      path: normalizedPath,
      override: false,
    });
    seen.add(normalizedPath);
  }
}

loadEnvFiles();

const app = express();
const port = Number(process.env.PORT ?? 3001);

if (!process.env.GEMINI_API_KEY) {
  console.error("ERROR: GEMINI_API_KEY is not set in the environment.");
  process.exit(1);
}

app.use(express.json());

const upload = multer({ storage: multer.memoryStorage() });

app.post("/api/run/:service", upload.any(), async (req, res) => {
  const service = req.params.service;
  
  let inputs: any = {};
  let config: any = {};
  let selectedModel: string | undefined;

  try {
    if (req.body.inputs) inputs = typeof req.body.inputs === "string" ? JSON.parse(req.body.inputs) : req.body.inputs;
    else inputs = req.body;
    
    if (req.body.config) config = typeof req.body.config === "string" ? JSON.parse(req.body.config) : req.body.config;
    if (req.body.model) selectedModel = req.body.model;

    const apiKey = process.env.GEMINI_API_KEY;

    let result: any;
    switch (service) {
      case "text": {
        const textSvc = new GeminiTextService({ apiKey });
        result = await textSvc.generateText(inputs.prompt || "", { model: selectedModel, ...config });
        break;
      }
      case "chat": {
        const chatSvc = new GeminiChatService({
          apiKey,
          model: selectedModel,
          history: inputs.history,
          ...config
        });
        const message = inputs.message || "Hello";
        const chatResult = await chatSvc.sendMessage(message);
        result = { response: chatResult, history: await chatSvc.getHistory() };
        break;
      }
      case "image": {
        const imageSvc = new GeminiImageService({ apiKey });
        result = await imageSvc.generateImageFromPrompt(inputs.prompt || "", { model: selectedModel, ...config });
        break;
      }
      case "audio": {
        const audioSvc = new GeminiAudioService({ apiKey });
        const buffer = await audioSvc.generateAudio(inputs.text || "", inputs.prompt || "", { model: selectedModel, ...config });
        result = { audioBase64: buffer.toString("base64") };
        break;
      }
      case "embedding": {
        const embedSvc = new GeminiEmbeddingService({ apiKey });
        result = await embedSvc.embedText(inputs.content || "", { model: selectedModel, ...config });
        break;
      }
      default:
        return res.status(400).json({ error: `Service ${service} not implemented for execution yet.` });
    }

    res.json({ success: true, result });
  } catch (err: any) {
    console.error(`Run error [${service}]:`, err);
    res.status(500).json({ success: false, error: err.message, stack: err.stack });
  }
});

app.get("/api/meta", (_request, response) => {
  const meta = {
    services: [
      { id: "text", name: "Text", description: "Generate text and content" },
      { id: "chat", name: "Chat", description: "Multi-turn conversation" },
      { id: "embedding", name: "Embedding", description: "Generate embeddings from content" },
      { id: "image", name: "Image", description: "Generate images and SVGs" },
      { id: "audio", name: "Audio", description: "Text-to-speech audio generation" },
      { id: "music", name: "Music", description: "Prompt-driven music generation" },
      { id: "video", name: "Video", description: "Video generation" },
      { id: "live", name: "Live", description: "Real-time multimodal session" },
    ],
    models: {
      text: GEMINI_TEXT_MODELS,
      chat: GEMINI_TEXT_MODELS,
      embedding: GEMINI_EMBEDDING_MODELS,
      image: GEMINI_IMAGE_MODELS,
      audio: GEMINI_AUDIO_MODELS,
      music: GEMINI_MUSIC_MODELS,
      video: GEMINI_VIDEO_MODELS,
      live: GEMINI_LIVE_MODELS,
    },
    configs: {
      text: Object.fromEntries(GEMINI_TEXT_MODELS.map(m => [m, getTextModelConfigOptions(m)])),
      chat: Object.fromEntries(GEMINI_TEXT_MODELS.map(m => [m, getTextModelConfigOptions(m)])),
      embedding: Object.fromEntries(GEMINI_EMBEDDING_MODELS.map(m => [m, getEmbeddingModelConfigOptions(m)])),
      image: Object.fromEntries(GEMINI_IMAGE_MODELS.map(m => [m, getImageModelConfigOptions(m)])),
      audio: Object.fromEntries(GEMINI_AUDIO_MODELS.map(m => [m, getAudioModelConfigOptions(m)])),
      music: Object.fromEntries(GEMINI_MUSIC_MODELS.map(m => [m, getMusicModelConfigOptions(m)])),
      video: Object.fromEntries(GEMINI_VIDEO_MODELS.map(m => [m, getVideoModelConfigOptions(m)])),
      live: Object.fromEntries(GEMINI_LIVE_MODELS.map(m => [m, getLiveModelConfigOptions(m)])),
    },
    presets: {
      text: [],
      chat: [],
      embedding: [],
      image: [],
      audio: [],
      music: [],
      video: [],
      live: []
    }
  };

  response.json(meta);
});

app.get("/api/health", (_request, response) => {
  response.json({
    ok: true,
  });
});

app.get("/api/hello", (_request, response) => {
  response.json({
    message: "Hello from the Express server.",
    time: new Date().toISOString(),
    supportedTextModels: GEMINI_TEXT_MODELS.map((model) => `${model} (${getTextModelDisplayName(model)})`),
  });
});

app.listen(port, () => {
  console.log(`Server listening on http://localhost:${port}`);
});
