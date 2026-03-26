import { useState } from "react";

interface Props {
  values: any;
  onChange: (values: any) => void;
}

export function ChatForm({ values, onChange }: Props) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <label>
        <strong>System Instruction (optional)</strong>
        <textarea
          value={values.systemInstruction || ""}
          onChange={(e) => onChange({ ...values, systemInstruction: e.target.value })}
          style={{ width: "100%", padding: 8, minHeight: 60 }}
          placeholder="You are a helpful assistant..."
        />
      </label>
      <label>
        <strong>Message</strong>
        <textarea
          value={values.message || ""}
          onChange={(e) => onChange({ ...values, message: e.target.value })}
          style={{ width: "100%", padding: 8, minHeight: 80 }}
          placeholder="Say hello!"
        />
      </label>
    </div>
  );
}
