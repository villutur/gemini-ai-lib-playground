import { useState, useEffect } from "react";
import { PreviewRenderer } from "./PreviewRenderer";
import type { ServiceId } from "../../../server/src/shared/types";
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

interface Props {
  serviceId: ServiceId;
  runId: string;
  runData: any;
  onClose: () => void;
}

function TextFilePreview({ url, fileName }: { url: string, fileName: string }) {
  const [content, setContent] = useState<string>("Loading...");

  useEffect(() => {
    fetch(url)
      .then(res => res.text())
      .then(text => setContent(text))
      .catch(err => setContent(`Error loading file: ${err.message}`));
  }, [url]);

  const ext = fileName.split('.').pop()?.toLowerCase();
  let lang = "plaintext";
  if (ext === "json") lang = "json";
  else if (ext === "ts") lang = "typescript";
  else if (ext === "js") lang = "javascript";
  else if (ext === "md") lang = "markdown";

  return (
    <div style={{ width: "100%", height: "100%", overflow: "auto", background: "#1e1e1e" }}>
      <SyntaxHighlighter 
        language={lang} 
        style={vscDarkPlus} 
        customStyle={{ background: "transparent", padding: 24, margin: 0, fontSize: "0.9rem", height: "100%" }}
      >
        {content}
      </SyntaxHighlighter>
    </div>
  );
}

export function SavedRunModal({ serviceId, runId, runData, onClose }: Props) {
  const [previewFile, setPreviewFile] = useState<string | null>(null);

  const renderFilePreview = () => {
    if (!previewFile) return null;
    const url = `/api/runs/${serviceId}/${runId}/files/${previewFile}`;
    const ext = previewFile.split('.').pop()?.toLowerCase();

    let content = null;
    if (['png', 'jpg', 'jpeg', 'gif', 'svg', 'webp'].includes(ext || "")) {
      content = <img src={url} alt={previewFile} style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain" }} />;
    } else if (['mp4', 'webm'].includes(ext || "")) {
      content = <video controls autoPlay src={url} style={{ maxWidth: "100%", maxHeight: "100%" }} />;
    } else if (['mp3', 'wav', 'ogg'].includes(ext || "")) {
      content = <audio controls autoPlay src={url} style={{ width: "80%" }} />;
    } else {
      // JSON, TXT, TS, MD etc
      content = <TextFilePreview url={url} fileName={previewFile} />;
    }

    return (
      <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.95)", display: "flex", flexDirection: "column", zIndex: 2000, padding: 32 }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
          <h3 style={{ margin: 0, color: "#fff" }}>{previewFile}</h3>
          <button 
            onClick={() => setPreviewFile(null)} 
            style={{ padding: "6px 16px", cursor: "pointer", background: "#3b82f6", color: "white", border: "none", borderRadius: 4, fontWeight: "bold" }}
          >
            Close Preview
          </button>
        </div>
        <div style={{ flex: 1, display: "flex", justifyContent: "center", alignItems: "center", overflow: "hidden", background: "#1e1e1e", borderRadius: 8, border: "1px solid rgba(148, 163, 184, 0.2)" }}>
          {content}
        </div>
      </div>
    );
  };

  return (
    <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.7)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1000, padding: 32 }}>
      <div style={{ background: "#0f172a", padding: 32, borderRadius: 12, width: "100%", maxWidth: 1100, maxHeight: "100%", overflowY: "auto", border: "1px solid rgba(148, 163, 184, 0.22)", position: "relative", boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.5)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24, borderBottom: "1px solid rgba(255,255,255,0.1)", paddingBottom: 16 }}>
          <h2 style={{ margin: 0 }}>Run Details: {runId}</h2>
          <button 
            onClick={onClose} 
            style={{ padding: "6px 12px", cursor: "pointer", background: "transparent", color: "#fff", border: "1px solid #fff", borderRadius: 4 }}
          >
            Close Modal
          </button>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 32 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
            <div>
              <h3>Request Data</h3>
              <div style={{ borderRadius: 8, overflow: "hidden" }}>
                <SyntaxHighlighter 
                  language="json" 
                  style={vscDarkPlus} 
                  customStyle={{ background: "rgba(0,0,0,0.5)", margin: 0, padding: 12, fontSize: "0.85em", maxHeight: 250 }}
                >
                  {JSON.stringify(runData.request, null, 2)}
                </SyntaxHighlighter>
              </div>
            </div>

            <div>
              <h3>Saved Files</h3>
              <ul style={{ listStyle: "none", padding: 0, display: "flex", flexDirection: "column", gap: 8 }}>
                {runData.files.map((f: string) => (
                  <li key={f} style={{ background: "rgba(0,0,0,0.3)", padding: "12px", borderRadius: 6, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ wordBreak: "break-all", paddingRight: 16 }}>{f}</span>
                    <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
                      <button 
                        onClick={() => setPreviewFile(f)} 
                        style={{ padding: "6px 12px", cursor: "pointer", background: "transparent", color: "#60a5fa", border: "1px solid #60a5fa", borderRadius: 4, fontSize: "0.85em" }}
                      >
                        Preview
                      </button>
                      <a 
                        href={`/api/runs/${serviceId}/${runId}/files/${f}`} 
                        download={f} 
                        style={{ padding: "6px 12px", background: "#3b82f6", color: "#fff", textDecoration: "none", borderRadius: 4, fontSize: "0.85em" }}
                      >
                        Download
                      </a>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          
          <div>
            <h3>Result Preview</h3>
            <div style={{ background: "rgba(0,0,0,0.2)", padding: 16, borderRadius: 8, border: "1px solid rgba(255,255,255,0.05)" }}>
              <PreviewRenderer serviceId={serviceId} runId={runId} result={{ success: true, result: runData.result }} />
            </div>
          </div>
        </div>
      </div>
      {renderFilePreview()}
    </div>
  );
}
