import { useState } from "react";
import { useMeta } from "../contexts/MetaContext";

export interface ConfigOptionDescriptor {
  key: string;
  label: string;
  description: string;
  kind: "string" | "number" | "boolean" | "array" | "object";
  defaultValue?: any;
  allowedValues?: string[];
  min?: number;
  max?: number;
  step?: number;
  note?: string;
}

interface Props {
  descriptors: ConfigOptionDescriptor[];
  values: Record<string, any>;
  onChange: (values: Record<string, any>) => void;
}

function VoicesModal({ onClose }: { onClose: () => void }) {
  const { meta } = useMeta();
  const voices = meta?.voices || [];

  return (
    <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.8)", zIndex: 3000, display: "flex", justifyContent: "center", alignItems: "center", padding: 32 }}>
      <div style={{ background: "#1e293b", width: "100%", maxWidth: 800, maxHeight: "90vh", borderRadius: 12, display: "flex", flexDirection: "column", overflow: "hidden", border: "1px solid rgba(148, 163, 184, 0.22)", boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)" }}>
        <div style={{ padding: "24px 32px", borderBottom: "1px solid rgba(255,255,255,0.1)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h2 style={{ margin: 0 }}>Available Voices</h2>
          <button onClick={onClose} style={{ background: "transparent", color: "#fff", border: "1px solid rgba(255,255,255,0.5)", borderRadius: 6, padding: "6px 12px", cursor: "pointer" }}>Close</button>
        </div>
        <div style={{ padding: 32, overflowY: "auto", display: "flex", flexDirection: "column", gap: 16 }}>
          {voices.map((voice) => (
            <div key={voice.name} style={{ background: "rgba(0,0,0,0.3)", padding: 16, borderRadius: 8, display: "flex", flexWrap: "wrap", gap: 16, alignItems: "center" }}>
              <div style={{ flex: 1, minWidth: 200 }}>
                <div style={{ display: "flex", alignItems: "baseline", gap: 12 }}>
                  <h3 style={{ margin: 0, color: "#60a5fa" }}>{voice.name}</h3>
                  <span style={{ fontSize: "0.85em", color: "#94a3b8" }}>{voice.gender} • {voice.pitchLabel}</span>
                </div>
                <p style={{ margin: "8px 0", fontSize: "0.95em", lineHeight: 1.4 }}>{voice.description}</p>
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                  {voice.characteristics?.map((char: string) => (
                    <span key={char} style={{ background: "rgba(255,255,255,0.1)", padding: "2px 8px", borderRadius: 12, fontSize: "0.75em" }}>{char}</span>
                  ))}
                </div>
              </div>
              <div>
                <audio controls src={voice.sampleUrl} preload="none" style={{ height: 36, width: 250 }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function ConfigFormRenderer({ descriptors, values, onChange }: Props) {
  const [showVoicesModal, setShowVoicesModal] = useState(false);
  const { meta } = useMeta();

  const handleChange = (key: string, value: any) => {
    onChange({ ...values, [key]: value });
  };

  if (!descriptors || descriptors.length === 0) {
    return <p className="muted">No configuration options available for this model.</p>;
  }

  return (
    <>
      <div className="config-form" style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        {descriptors.map((desc) => {
          const val = values[desc.key] !== undefined ? values[desc.key] : (desc.defaultValue ?? "");
          
          // Inject voices dynamically into "voiceName" allowedValues
          let allowedValues = desc.allowedValues;
          if (desc.key === "voiceName" && meta?.voices) {
            allowedValues = meta.voices.map(v => v.name);
          }

          return (
            <div key={desc.key} className="config-field">
              <label style={{ display: "flex", alignItems: "center", marginBottom: 4, gap: 8 }}>
                <span>
                  <strong>{desc.label}</strong> <span className="muted" style={{ fontSize: "0.85em" }}>({desc.key})</span>
                </span>
                {desc.key === "voiceName" && (
                  <button 
                    onClick={() => setShowVoicesModal(true)}
                    style={{ background: "rgba(96, 165, 250, 0.2)", border: "1px solid #60a5fa", color: "#60a5fa", width: 20, height: 20, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.8rem", cursor: "pointer", padding: 0 }}
                    title="View voice samples"
                  >
                    i
                  </button>
                )}
              </label>
              
              <p className="muted" style={{ margin: "0 0 8px 0", fontSize: "0.9em" }}>{desc.description}</p>
              {desc.note && <p style={{ margin: "0 0 8px 0", fontSize: "0.85em", color: "#60a5fa" }}>{desc.note}</p>}

              {desc.kind === "boolean" && (
                <input 
                  type="checkbox" 
                  checked={!!val} 
                  onChange={(e) => handleChange(desc.key, e.target.checked)} 
                />
              )}

              {desc.kind === "string" && allowedValues && (
                <select 
                  value={val} 
                  onChange={(e) => handleChange(desc.key, e.target.value)}
                  style={{ width: "100%", padding: 6 }}
                >
                  <option value="">-- default --</option>
                  {allowedValues.map(v => <option key={v} value={v}>{v}</option>)}
                </select>
              )}

              {desc.kind === "string" && !allowedValues && (
                <input 
                  type="text" 
                  value={val} 
                  onChange={(e) => handleChange(desc.key, e.target.value)}
                  style={{ width: "100%", padding: 6 }}
                />
              )}

              {desc.kind === "number" && (
                <input 
                  type="number" 
                  value={val} 
                  min={desc.min} 
                  max={desc.max} 
                  step={desc.step ?? "any"}
                  onChange={(e) => handleChange(desc.key, Number(e.target.value))}
                  style={{ width: "100%", padding: 6 }}
                />
              )}

              {desc.kind === "array" && allowedValues && (
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  {allowedValues.map(v => {
                    const isChecked = Array.isArray(val) && val.includes(v);
                    return (
                      <label key={v} style={{ display: "flex", alignItems: "center", gap: 4 }}>
                        <input 
                          type="checkbox" 
                          checked={isChecked} 
                          onChange={(e) => {
                            const currentArray = Array.isArray(val) ? val : [];
                            if (e.target.checked) {
                              handleChange(desc.key, [...currentArray, v]);
                            } else {
                              handleChange(desc.key, currentArray.filter(i => i !== v));
                            }
                          }}
                        />
                        {v}
                      </label>
                    );
                  })}
                </div>
              )}

              {(desc.kind === "object" || (desc.kind === "array" && !allowedValues)) && (
                <textarea
                  value={typeof val === "string" ? val : JSON.stringify(val, null, 2)}
                  onChange={(e) => {
                    const strVal = e.target.value;
                    try {
                      const parsed = JSON.parse(strVal);
                      handleChange(desc.key, parsed);
                    } catch (err) {
                      handleChange(desc.key, strVal); // keep raw string while editing
                    }
                  }}
                  style={{ width: "100%", padding: 6, minHeight: 80, fontFamily: "monospace" }}
                />
              )}
            </div>
          );
        })}
      </div>
      {showVoicesModal && <VoicesModal onClose={() => setShowVoicesModal(false)} />}
    </>
  );
}
