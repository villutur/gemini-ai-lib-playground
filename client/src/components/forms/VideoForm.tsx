import { useState } from "react";

interface Props {
  values: any;
  onChange: (values: any) => void;
}

export function VideoForm({ values, onChange }: Props) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <label>
        <strong>Video Prompt</strong>
        <textarea
          value={values.prompt || ""}
          onChange={(e) => onChange({ ...values, prompt: e.target.value })}
          style={{ width: "100%", padding: 8, minHeight: 120 }}
          placeholder="A cinematic drone shot over a neon city..."
        />
      </label>
      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
        <label><strong>Mode:</strong></label>
        <select
          value={values.mode || "prompt"}
          onChange={(e) => onChange({ ...values, mode: e.target.value })}
          style={{ padding: 6 }}
        >
          <option value="prompt">Prompt Only</option>
          <option value="image-to-video">Image to Video</option>
          <option value="extend">Extend Video</option>
        </select>
      </div>
    </div>
  );
}
