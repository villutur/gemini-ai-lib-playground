import express from "express";
import { GEMINI_TEXT_MODELS, getTextModelDisplayName } from "@villutur/gemini-ai-lib";

const app = express();
const port = Number(process.env.PORT ?? 3001);

app.use(express.json());

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
