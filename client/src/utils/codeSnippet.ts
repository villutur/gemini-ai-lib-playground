import type { ServiceId } from "../../../server/src/shared/types";

export function generateCodeSnippet(serviceId: ServiceId, model: string, inputs: Record<string, any>, config: Record<string, any>): string {
  const configStr = Object.keys(config).length > 0 ? JSON.stringify({ model, ...config }, null, 2) : `{ model: "${model}" }`;

  switch (serviceId) {
    case "text":
      return `import { GeminiTextService } from "@villutur/gemini-ai-lib";

const service = new GeminiTextService({ apiKey: process.env.GEMINI_API_KEY });

const result = await service.generateText(
  ${JSON.stringify(inputs.prompt || "")},
  ${configStr}
);

console.log(result.text);`;

    case "chat":
      return `import { GeminiChatService } from "@villutur/gemini-ai-lib";

const service = new GeminiChatService({
  apiKey: process.env.GEMINI_API_KEY,
  model: "${model}",
  ...${JSON.stringify(config, null, 2).replace(/\n/g, "\n  ")}
});

const result = await service.sendMessage(${JSON.stringify(inputs.message || "Hello")});
console.log(result.text);`;

    case "image":
      return `import { GeminiImageService } from "@villutur/gemini-ai-lib";

const service = new GeminiImageService({ apiKey: process.env.GEMINI_API_KEY });

const result = await service.generateImageFromPrompt(
  ${JSON.stringify(inputs.prompt || "")},
  ${configStr}
);

console.log(result.base64Images);`;

    case "audio":
      return `import { GeminiAudioService } from "@villutur/gemini-ai-lib";

const service = new GeminiAudioService({ apiKey: process.env.GEMINI_API_KEY });

const buffer = await service.generateAudio(
  ${JSON.stringify(inputs.text || "")},
  ${JSON.stringify(inputs.prompt || "")},
  ${configStr}
);

// buffer contains raw PCM audio data (24kHz, 16-bit, mono)
// Use a utility like 'wav' to save it as a playable file`;

    case "embedding":
      return `import { GeminiEmbeddingService } from "@villutur/gemini-ai-lib";

const service = new GeminiEmbeddingService({ apiKey: process.env.GEMINI_API_KEY });

const result = await service.embedText(
  ${JSON.stringify(inputs.content || "")},
  ${configStr}
);

console.log(result.embeddings);`;
      
    case "video":
      return `import { GeminiVideoService } from "@villutur/gemini-ai-lib";

const service = new GeminiVideoService({ apiKey: process.env.GEMINI_API_KEY });

const result = await service.generateVideoFromPrompt(
  ${JSON.stringify(inputs.prompt || "")},
  ${configStr}
);

const videoInfo = result.generatedVideos[0];
if (videoInfo.videoBytes) {
  // Use raw bytes from videoInfo.videoBytes
} else if (videoInfo.uri) {
  // Download using videoInfo.uri + api key
  const downloadUrl = \`\${videoInfo.uri}\${videoInfo.uri.includes('?') ? '&' : '?'}key=\${process.env.GEMINI_API_KEY}\`;
  const response = await fetch(downloadUrl);
  const buffer = await response.arrayBuffer();
  // save buffer to file...
}`;
      
    case "music":
      return `import { GeminiMusicService } from "@villutur/gemini-ai-lib";

const service = new GeminiMusicService({ apiKey: process.env.GEMINI_API_KEY });

const result = await service.generateMusicFromPrompt(
  ${JSON.stringify(inputs.prompt || "")},
  ${configStr}
);

// result.audioBuffer contains the MP3 data`;
      
    case "live":
      return `// CLIENT-SIDE ONLY EXAMPLE
import { GeminiLiveChatSession } from "@villutur/gemini-ai-lib";

const { apiKey } = await fetch("/api/live/key").then((response) => response.json());

const session = new GeminiLiveChatSession({
  apiKey,
  model: "${model}",
  ...${JSON.stringify(config, null, 2).replace(/\n/g, "\n  ")}
});

session.setOptions({
  ...session.options,
  onSetupComplete() {
    console.log("Live session ready.");
  },
  onInputTranscription(text, isFinal) {
    console.log("User said:", text, isFinal ? "(final)" : "(partial)");
  },
  onOutputTranscription(text, isFinal) {
    console.log("Model said:", text, isFinal ? "(final)" : "(partial)");
  },
  onError(error) {
    console.error("Live session error:", error);
  },
});

await session.connect(${JSON.stringify(inputs.greetingPrompt || "")} || undefined);
session.sendTextMessage("Hello from the browser live session!");
`;

    default:
      return "// No snippet available for this service";
  }
}
