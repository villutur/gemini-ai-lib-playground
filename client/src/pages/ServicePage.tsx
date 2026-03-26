import { useParams } from "react-router-dom";
import { useMeta } from "../contexts/MetaContext";
import { useState, useEffect } from "react";
import type { ServiceId } from "../../../server/src/shared/types";

export function ServicePage() {
  const { serviceId } = useParams<{ serviceId: string }>();
  const id = serviceId as ServiceId;
  const { meta, loading, error } = useMeta();
  const [selectedModel, setSelectedModel] = useState<string>("");

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

      <section className="service-layout" style={{ marginTop: 24, display: "grid", gap: 32 }}>
        <div className="request-area">
          <h3>Request Form</h3>
          <p className="muted">Placeholder for {id} form inputs.</p>
        </div>

        <div className="code-area">
          <h3>Generated Code</h3>
          <pre style={{ background: "rgba(0,0,0,0.5)", padding: 12, borderRadius: 8 }}>
            <code>// code goes here</code>
          </pre>
        </div>

        <div className="execution-area">
          <h3>Execution Result</h3>
          <p className="muted">Waiting for execution...</p>
        </div>
        
        <div className="runs-area">
          <h3>Saved Runs</h3>
          <p className="muted">No runs yet.</p>
        </div>
      </section>
    </div>
  );
}
