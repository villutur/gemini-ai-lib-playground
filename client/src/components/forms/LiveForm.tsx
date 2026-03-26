import { useState } from "react";

interface Props {
  values: any;
  onChange: (values: any) => void;
}

export function LiveForm({ values, onChange }: Props) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <p className="muted" style={{ margin: 0 }}>
        <em>Note: Live Sessions run entirely in the browser using WebSockets. 
        Your API key is securely fetched from the local dev server.</em>
      </p>

      <label>
        <strong>System Instruction</strong>
        <textarea
          value={values.systemInstruction || ""}
          onChange={(e) => onChange({ ...values, systemInstruction: e.target.value })}
          style={{ width: "100%", padding: 8, minHeight: 80 }}
          placeholder="You are a friendly live assistant."
        />
      </label>

      <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
        <label style={{ display: "flex", alignItems: "center", gap: 4 }}>
          <input
            type="checkbox"
            checked={values.enableAudio !== false}
            onChange={(e) => onChange({ ...values, enableAudio: e.target.checked })}
          />
          Enable Audio
        </label>

        <label style={{ display: "flex", alignItems: "center", gap: 4 }}>
          <input
            type="checkbox"
            checked={!!values.enableVideo}
            onChange={(e) => onChange({ ...values, enableVideo: e.target.checked })}
          />
          Enable Video
        </label>
      </div>
    </div>
  );
}
