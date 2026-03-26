import { useState } from "react";

interface Props {
  values: any;
  onChange: (values: any) => void;
}

export function MusicForm({ values, onChange }: Props) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <label>
        <strong>Music Prompt</strong>
        <textarea
          value={values.prompt || ""}
          onChange={(e) => onChange({ ...values, prompt: e.target.value })}
          style={{ width: "100%", padding: 8, minHeight: 120 }}
          placeholder="A catchy synth-pop song about writing code..."
        />
      </label>
      <label>
        <strong>Image Guide (Optional URL)</strong>
        <input
          type="text"
          value={values.imageGuide || ""}
          onChange={(e) => onChange({ ...values, imageGuide: e.target.value })}
          style={{ width: "100%", padding: 8 }}
          placeholder="https://example.com/cover.jpg"
        />
      </label>
    </div>
  );
}
