import { useState } from "react";

interface Props {
  values: any;
  onChange: (values: any) => void;
}

export function TextForm({ values, onChange }: Props) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <label>
        <strong>Prompt</strong>
        <textarea
          value={values.prompt || ""}
          onChange={(e) => onChange({ ...values, prompt: e.target.value })}
          style={{ width: "100%", padding: 8, minHeight: 120 }}
          placeholder="Enter your prompt here..."
        />
      </label>
    </div>
  );
}
