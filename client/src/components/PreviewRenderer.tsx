import type { ServiceId } from "../../../server/src/shared/types";
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

interface Props {
  serviceId: ServiceId;
  runId: string | null;
  result: any;
}

function JsonBlock({ data }: { data: any }) {
  return (
    <div style={{ borderRadius: 8, overflow: "hidden", marginTop: 8 }}>
      <SyntaxHighlighter 
        language="json" 
        style={vscDarkPlus} 
        customStyle={{ background: "rgba(0,0,0,0.5)", margin: 0, padding: 12, fontSize: "0.85em", maxHeight: 400 }}
      >
        {JSON.stringify(data, null, 2)}
      </SyntaxHighlighter>
    </div>
  );
}

export function PreviewRenderer({ serviceId, runId, result }: Props) {
  if (!result) return <p className="muted">Waiting for execution...</p>;

  // If there's an error, just show the JSON
  if (result.error || result.success === false) {
    return <JsonBlock data={result} />;
  }

  const data = result.result || result; // handle raw result vs {success, result, runId} wrapper

  switch (serviceId) {
    case "audio":
    case "music": {
      if (!runId) return <p className="muted">Run saved, but no runId returned to preview audio.</p>;
      const fileName = serviceId === "audio" ? "output.wav" : "output.mp3";
      const mimeType = serviceId === "audio" ? "audio/wav" : "audio/mpeg";
      return (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <audio key={runId} controls style={{ width: "100%" }}>
            <source src={`/api/runs/${serviceId}/${runId}/files/${fileName}`} type={mimeType} />
            Your browser does not support the audio element.
          </audio>
          <details>
            <summary style={{ cursor: "pointer", color: "#60a5fa" }}>View raw JSON</summary>
            <JsonBlock data={data} />
          </details>
        </div>
      );
    }
    
    case "video": {
      let videoSrc = "";
      if (data.videoBase64 && data.videoBase64 !== "[Extracted to output.mp4]") {
        videoSrc = `data:video/mp4;base64,${data.videoBase64}`;
      } else if (runId) {
        videoSrc = `/api/runs/video/${runId}/files/output.mp4`;
      }

      if (!videoSrc) return <p className="muted">No video data available for preview.</p>;

      return (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <video key={runId || 'preview'} controls src={videoSrc} style={{ width: "100%", maxHeight: 400, background: "black" }} />
          <details>
            <summary style={{ cursor: "pointer", color: "#60a5fa" }}>View raw JSON</summary>
            <JsonBlock data={data} />
          </details>
        </div>
      );
    }
    
    case "image": {
      // Determine if it's one image or multiple, and if it's base64 or a saved file path
      const images: string[] = [];
      if (data.base64Images) {
        if (data.base64Images === "[Extracted to image files]" && runId) {
          images.push(`/api/runs/image/${runId}/files/output-0.png`);
          images.push(`/api/runs/image/${runId}/files/output-1.png`);
          images.push(`/api/runs/image/${runId}/files/output-2.png`);
          images.push(`/api/runs/image/${runId}/files/output-3.png`);
        } else if (Array.isArray(data.base64Images)) {
          images.push(...data.base64Images.map((img: string) => img.startsWith("data:") ? img : `data:image/png;base64,${img}`));
        }
      } else if (data.base64Image) {
        if (data.base64Image === "[Extracted to output.png]" && runId) {
          images.push(`/api/runs/image/${runId}/files/output.png`);
        } else {
          images.push(data.base64Image.startsWith("data:") ? data.base64Image : `data:image/png;base64,${data.base64Image}`);
        }
      }

      return (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {images.length > 0 ? (
            <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
              {images.map(src => (
                <img 
                  key={src.substring(0, 100)} 
                  src={src} 
                  alt="Generated" 
                  style={{ maxWidth: "100%", maxHeight: 300, borderRadius: 8, objectFit: "contain", background: "rgba(255,255,255,0.05)" }}
                  onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                />
              ))}
            </div>
          ) : (
             <p className="muted">No image returned.</p>
          )}
          <details>
            <summary style={{ cursor: "pointer", color: "#60a5fa" }}>View raw JSON</summary>
            <JsonBlock data={data} />
          </details>
        </div>
      );
    }
    
    case "text":
    case "chat":
      const textToDisplay = data.text || data.response?.text || JSON.stringify(data, null, 2);
      return (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ whiteSpace: "pre-wrap", background: "rgba(0,0,0,0.5)", padding: 16, borderRadius: 8, lineHeight: 1.6 }}>
            {textToDisplay}
          </div>
          <details>
            <summary style={{ cursor: "pointer", color: "#60a5fa" }}>View raw JSON</summary>
            <JsonBlock data={data} />
          </details>
        </div>
      );

    default:
      return <JsonBlock data={data} />;
  }
}
