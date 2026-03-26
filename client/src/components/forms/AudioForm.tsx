import { useState } from "react";

interface Props {
  values: any;
  onChange: (values: any) => void;
}

export function AudioForm({ values, onChange }: Props) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <label>
        <strong>Text to Speech</strong>
        <textarea
          value={values.text || ""}
          onChange={(e) => onChange({ ...values, text: e.target.value })}
          style={{ width: "100%", padding: 8, minHeight: 120 }}
          placeholder="Text to convert to audio..."
        />
      </label>
    </div>
  );
}
