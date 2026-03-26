import { useParams } from "react-router-dom";
import { useMeta } from "../contexts/MetaContext";
import { useState, useEffect } from "react";
import type { ServiceId } from "../../../server/src/shared/types";
import { TextForm } from "../components/forms/TextForm";
import { ChatForm } from "../components/forms/ChatForm";
import { ImageForm } from "../components/forms/ImageForm";
import { AudioForm } from "../components/forms/AudioForm";
import { EmbeddingForm } from "../components/forms/EmbeddingForm";
import { MusicForm } from "../components/forms/MusicForm";
import { VideoForm } from "../components/forms/VideoForm";
import { LiveForm } from "../components/forms/LiveForm";
import { ConfigFormRenderer } from "../components/ConfigFormRenderer";
import { PreviewRenderer } from "../components/PreviewRenderer";
import { GeneratedCodePanel } from "../components/GeneratedCodePanel";
import { SavedRunModal } from "../components/SavedRunModal";
import { generateCodeSnippet } from "../utils/codeSnippet";

export function ServicePage() {
  const { serviceId } = useParams<{ serviceId: string }>();
  const id = serviceId as ServiceId;
  const { meta, loading, error } = useMeta();
  const [selectedModel, setSelectedModel] = useState<string>("");
  const [inputs, setInputs] = useState<Record<string, any>>({});
  const [config, setConfig] = useState<Record<string, any>>({});
  const [isExecuting, setIsExecuting] = useState(false);
  const [executionResult, setExecutionResult] = useState<any>(null);
  const [savedRuns, setSavedRuns] = useState<string[]>([]);
  const [selectedRunId, setSelectedRunId] = useState<string | null>(null);
  const [selectedRunData, setSelectedRunData] = useState<any>(null);

  const handleViewRun = async (runId: string) => {
    try {
      const res = await fetch(`/api/runs/${id}/${runId}`);
      const data = await res.json();
      setSelectedRunData(data);
      setSelectedRunId(runId);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchRuns = async () => {
    try {
      const res = await fetch(`/api/runs/${id}`);
      const data = await res.json();
      setSavedRuns(data.runs || []);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    setInputs({});
    setConfig({});
    setExecutionResult(null);
    fetchRuns();
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
      const snippet = generateCodeSnippet(id, selectedModel, inputs, config);
      const response = await fetch(`/api/run/${id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: selectedModel,
          inputs,
          config,
          codeSnippet: snippet
        })
      });
      const data = await response.json();
      setExecutionResult(data);
      if (data.success) {
        fetchRuns();
      }
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
        
        <div style={{ display: "flex", gap: 24 }}>
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

          {meta.presets[id]?.length > 0 && (
            <div className="preset-picker">
              <label htmlFor="preset-select"><strong>Preset:</strong> </label>
              <select 
                id="preset-select" 
                defaultValue=""
                onChange={(e) => {
                  const preset = meta.presets[id].find((p: any) => p.id === e.target.value);
                  if (preset) {
                    setInputs(preset.inputs || {});
                    setConfig(preset.config || {});
                  }
                }}
              >
                <option value="" disabled>-- Select Preset --</option>
                {meta.presets[id].map((p: any) => (
                  <option key={p.id} value={p.id}>{p.label}</option>
                ))}
              </select>
            </div>
          )}
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
            {id === "music" && <MusicForm values={inputs} onChange={setInputs} />}
            {id === "video" && <VideoForm values={inputs} onChange={setInputs} />}
            {id === "live" && <LiveForm values={inputs} onChange={setInputs} />}
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
            <PreviewRenderer 
              serviceId={id} 
              runId={executionResult?.runId || null} 
              result={executionResult} 
            />
          </div>

          <div className="code-area">
            <h3>Generated Code</h3>
            <GeneratedCodePanel serviceId={id} model={selectedModel} inputs={inputs} config={config} />
          </div>
          
          <div className="runs-area">
            <h3>Saved Runs</h3>
            {savedRuns.length === 0 ? (
              <p className="muted">No runs yet.</p>
            ) : (
              <ul style={{ padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 8 }}>
                {savedRuns.map((runId) => (
                  <li key={runId} style={{ background: "rgba(0,0,0,0.3)", padding: 8, borderRadius: 6, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span>{runId}</span>
                    <button 
                      onClick={() => handleViewRun(runId)}
                      style={{ padding: "4px 12px", background: "transparent", color: "#60a5fa", border: "1px solid #60a5fa", borderRadius: 4, cursor: "pointer", fontSize: "0.85rem" }}
                    >
                      View
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </section>

      {selectedRunId && selectedRunData && (
        <SavedRunModal 
          serviceId={id}
          runId={selectedRunId}
          runData={selectedRunData}
          onClose={() => {
            setSelectedRunId(null);
            setSelectedRunData(null);
          }}
        />
      )}
    </div>
  );
}

