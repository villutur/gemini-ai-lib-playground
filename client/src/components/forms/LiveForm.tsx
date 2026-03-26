interface Props {
  values: any;
  onChange: (values: any) => void;
}

export function LiveForm({ values, onChange }: Props) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <p className="muted" style={{ margin: 0 }}>
        <em>
          Live sessions run entirely in the browser using GeminiLiveChatSession.
          Your API key is fetched from the local dev server, and the bundled
          audio worklet is used automatically unless you override it in the
          config panel.
        </em>
      </p>

      <label>
        <strong>Greeting Prompt</strong>
        <textarea
          value={values.greetingPrompt || ""}
          onChange={(e) => onChange({ ...values, greetingPrompt: e.target.value })}
          style={{ width: "100%", padding: 8, minHeight: 80 }}
          placeholder="Say hello and ask how you can help."
        />
      </label>
    </div>
  );
}
