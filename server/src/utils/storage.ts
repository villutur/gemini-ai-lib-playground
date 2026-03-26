import { join, resolve } from "path";
import { existsSync, mkdirSync, writeFileSync, readdirSync, statSync, readFileSync } from "fs";
import { saveWaveFile } from "./wav.js";

export function getRuns(serviceId: string) {
  const servicePath = join(process.cwd(), ".data", serviceId);
  if (!existsSync(servicePath)) return [];
  
  const runs = readdirSync(servicePath).filter(f => statSync(join(servicePath, f)).isDirectory());
  // Sort newest first
  return runs.sort().reverse();
}

export function getRun(serviceId: string, runId: string) {
  const runPath = join(process.cwd(), ".data", serviceId, runId);
  if (!existsSync(runPath)) return null;

  try {
    const request = JSON.parse(readFileSync(join(runPath, "request.json"), "utf8"));
    const result = JSON.parse(readFileSync(join(runPath, "result.json"), "utf8"));
    const files = readdirSync(runPath).filter(f => statSync(join(runPath, f)).isFile());
    
    return { id: runId, request, result, files };
  } catch (err) {
    return null;
  }
}

export function getRunFilePath(serviceId: string, runId: string, fileName: string) {
  const runPath = resolve(process.cwd(), ".data", serviceId, runId);
  const filePath = resolve(runPath, fileName);
  
  // Basic path traversal prevention
  if (!filePath.startsWith(runPath)) return null;
  if (!existsSync(filePath)) return null;
  
  return filePath;
}

export async function saveRun(serviceId: string, request: any, result: any, codeSnippet: string) {
  const shortId = Math.random().toString(36).substring(2, 8);
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const folderName = `${timestamp}-${shortId}`;
  
  const basePath = join(process.cwd(), ".data", serviceId, folderName);
  
  if (!existsSync(basePath)) {
    mkdirSync(basePath, { recursive: true });
  }

  writeFileSync(join(basePath, "request.json"), JSON.stringify(request, null, 2));
  
  const parsedResult = { ...result };
  
  // Handle Audio (Native TTS) - always raw PCM 24kHz -> WAV
  if (serviceId === "audio" && result.audioBase64) {
    const buffer = Buffer.from(result.audioBase64, "base64");
    await saveWaveFile(join(basePath, "output.wav"), buffer);
    parsedResult.audioBase64 = "[Extracted to output.wav]";
  }
  
  // Handle Music - usually audio/mpeg (MP3)
  if (serviceId === "music" && result.audioBase64) {
    const buffer = Buffer.from(result.audioBase64, "base64");
    writeFileSync(join(basePath, "output.mp3"), buffer);
    parsedResult.audioBase64 = "[Extracted to output.mp3]";
  }

  if (serviceId === "video" && result.generatedVideos && result.generatedVideos.length > 0) {
    const videoInfo = result.generatedVideos[0];
    let videoBuffer: Buffer | undefined;

    if (videoInfo.videoBytes) {
      videoBuffer = Buffer.from(videoInfo.videoBytes, "base64");
    } else if (videoInfo.uri) {
      try {
        const apiKey = process.env.GEMINI_API_KEY;
        const downloadUrl = videoInfo.uri.includes('?') 
          ? `${videoInfo.uri}&key=${apiKey}` 
          : `${videoInfo.uri}?key=${apiKey}`;
          
        console.log(`Downloading video artifact from: ${videoInfo.uri}`);
        const response = await fetch(downloadUrl);
        if (response.ok) {
          videoBuffer = Buffer.from(await response.arrayBuffer());
        } else {
          console.error(`Failed to download video from URI: ${response.status} ${response.statusText}`);
        }
      } catch (err) {
        console.error("Error downloading video artifact:", err);
      }
    }

    if (videoBuffer) {
      writeFileSync(join(basePath, "output.mp4"), videoBuffer);
      parsedResult.videoBase64 = "[Extracted to output.mp4]";
      // Add a convenience property for immediate preview
      result.videoBase64 = videoBuffer.toString("base64");
    }
  }
  
  if (serviceId === "image" && result.base64Images) {
    result.base64Images.forEach((img: string, index: number) => {
      const base64Data = img.replace(/^data:image\/\w+;base64,/, "");
      const buffer = Buffer.from(base64Data, "base64");
      writeFileSync(join(basePath, `output-${index}.png`), buffer);
    });
    parsedResult.base64Images = "[Extracted to image files]";
  }
  
  if (serviceId === "image" && result.base64Image) {
      const base64Data = result.base64Image.replace(/^data:image\/\w+;base64,/, "");
      const buffer = Buffer.from(base64Data, "base64");
      writeFileSync(join(basePath, "output.png"), buffer);
      parsedResult.base64Image = "[Extracted to output.png]";
  }

  writeFileSync(join(basePath, "result.json"), JSON.stringify(parsedResult, null, 2));
  writeFileSync(join(basePath, "example.ts"), codeSnippet);

  return folderName;
}
