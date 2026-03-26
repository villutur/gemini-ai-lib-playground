import { useParams } from "react-router-dom";
import { useMeta } from "../contexts/MetaContext";
import { useState, useEffect } from "react";
import type { ServiceId } from "../../../server/src/shared/types";
import { TextForm } from "../components/forms/TextForm";
import { ChatForm } from "../components/forms/ChatForm";
import { ImageForm } from "../components/forms/ImageForm";
import { AudioForm } from "../components/forms/AudioForm";
import { EmbeddingForm } from "../components/forms/EmbeddingForm";
import { ConfigFormRenderer } from "../components/ConfigFormRenderer";

export function ServicePage() {
  const { serviceId } = useParams<{ serviceId: string }>();
  const id = serviceId as ServiceId;
  const { meta, loading, error } = useMeta();
  const [selectedModel, setSelectedModel] = useState<string>("");
  const [inputs, setInputs] = useState<Record<string, any>>({});
  const [config, setConfig] = useState<Record<string, any>>({});
  const [isExecuting, setIsExecuting] = useState(false);
  const [executionResult, setExecutionResult] = useState<any>(null);

  useEffect(() => {
    setInputs({});
    setConfig({});
    setExecutionResult(null);
  }, [id]);

  useEffect(() => {
    if (meta && meta.models[id] && meta.models[id].length > 0) {
      setSelectedModel(meta.models[id][0]);
    }
  }, [meta, id]);

  if (loading) return <p>Loading metadata...</p>;
  if (error) return <p className="error">Failed to load metadata: {error}</p>;
  if (!meta) return <p>No metadata available.</p>;

  const serviceInfo = meta.services.find((s) => s.id === id);
  const models = meta.models[id] || [];
  const descriptors = (meta.configs[id] && selectedModel) ? meta.configs[id][selectedModel] : [];

  const handleRun = async () => {
    setIsExecuting(true);
    setExecutionResult(null);
    try {
      const response = await fetch(`/api/run/${id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: selectedModel,
          inputs,
          config
        })
      });
      const data = await response.json();
      setExecutionResult(data);
    } catch (err: any) {
      setExecutionResult({ error: err.message });
    } finally {
      setIsExecuting(false);
    }
  };

  return (
    <div className="service-page">
      <header className="service-header">
        <h1>{serviceInfo?.name ?? id.toUpperCase()}</h1>
        <p className="lede">{serviceInfo?.description}</p>
        
        <div className="model-picker">
          <label htmlFor="model-select"><strong>Model:</strong> </label>
          <select 
            id="model-select" 
            value={selectedModel} 
            onChange={(e) => setSelectedModel(e.target.value)}
          >
            {models.map((m) => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
        </div>
      </header>

      <section className="service-layout" style={{ marginTop: 24, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 32 }}>
        <div className="request-area" style={{ display: "flex", flexDirection: "column", gap: 32 }}>
          <div>
            <h3>Input</h3>
            {id === "text" && <TextForm values={inputs} onChange={setInputs} />}
            {id === "chat" && <ChatForm values={inputs} onChange={setInputs} />}
            {id === "image" && <ImageForm values={inputs} onChange={setInputs} />}
            {id === "audio" && <AudioForm values={inputs} onChange={setInputs} />}
            {id === "embedding" && <EmbeddingForm values={inputs} onChange={setInputs} />}
            {id === "music" && <p className="muted">Music form coming soon.</p>}
            {id === "video" && <p className="muted">Video form coming soon.</p>}
            {id === "live" && <p className="muted">Live form coming soon.</p>}
          </div>
          
          <div>
            <h3>Configuration</h3>
            <ConfigFormRenderer 
              descriptors={descriptors || []} 
              values={config} 
              onChange={setConfig} 
            />
          </div>

          <button 
            onClick={handleRun}
            disabled={isExecuting}
            style={{ padding: "12px 24px", fontSize: "1.1rem", cursor: isExecuting ? "not-allowed" : "pointer", background: isExecuting ? "#64748b" : "#3b82f6", color: "white", border: "none", borderRadius: 6 }}
          >
            {isExecuting ? "Executing..." : "Run Request"}
          </button>
        </div>

        <div className="results-area" style={{ display: "flex", flexDirection: "column", gap: 32 }}>
          <div className="execution-area">
            <h3>Execution Result</h3>
            <pre style={{ background: "rgba(0,0,0,0.5)", padding: 12, borderRadius: 8, minHeight: 120, overflowX: "auto" }}>
              <code>
                {executionResult ? JSON.stringify(executionResult, null, 2) : "Waiting for execution..."}
              </code>
            </pre>
          </div>

          <div className="code-area">
            <h3>Generated Code</h3>
            <pre style={{ background: "rgba(0,0,0,0.5)", padding: 12, borderRadius: 8, overflowX: "auto" }}>
              <code>{`// Example Code (Dynamic later)\nconsole.log("Model:", "${selectedModel}");`}</code>
            </pre>
          </div>
          
          <div className="runs-area">
            <h3>Saved Runs</h3>
            <p className="muted">No runs yet.</p>
          </div>
        </div>
      </section>
    </div>
  );
}
