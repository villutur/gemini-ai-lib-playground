import { useState } from "react";

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

export function ConfigFormRenderer({ descriptors, values, onChange }: Props) {
  const handleChange = (key: string, value: any) => {
    onChange({ ...values, [key]: value });
  };

  if (!descriptors || descriptors.length === 0) {
    return <p className="muted">No configuration options available for this model.</p>;
  }

  return (
    <div className="config-form" style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      {descriptors.map((desc) => {
        const val = values[desc.key] !== undefined ? values[desc.key] : (desc.defaultValue ?? "");

        return (
          <div key={desc.key} className="config-field">
            <label style={{ display: "block", marginBottom: 4 }}>
              <strong>{desc.label}</strong> <span className="muted" style={{ fontSize: "0.85em" }}>({desc.key})</span>
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

            {desc.kind === "string" && desc.allowedValues && (
              <select 
                value={val} 
                onChange={(e) => handleChange(desc.key, e.target.value)}
                style={{ width: "100%", padding: 6 }}
              >
                <option value="">-- default --</option>
                {desc.allowedValues.map(v => <option key={v} value={v}>{v}</option>)}
              </select>
            )}

            {desc.kind === "string" && !desc.allowedValues && (
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

            {desc.kind === "array" && desc.allowedValues && (
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {desc.allowedValues.map(v => {
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

            {(desc.kind === "object" || (desc.kind === "array" && !desc.allowedValues)) && (
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
  );
}
