import { useState } from "react";

interface Props {
  values: any;
  onChange: (values: any) => void;
}

export function EmbeddingForm({ values, onChange }: Props) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <label>
        <strong>Content to embed</strong>
        <textarea
          value={values.content || ""}
          onChange={(e) => onChange({ ...values, content: e.target.value })}
          style={{ width: "100%", padding: 8, minHeight: 120 }}
          placeholder="Text to embed..."
        />
      </label>
    </div>
  );
}
