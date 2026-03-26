import { useEffect, useRef, useState } from "react";
import type { LiveServerMessage } from "@villutur/gemini-ai-lib";
import { GeminiLiveChatSession } from "@villutur/gemini-ai-lib";
import type { MetaResponse } from "../contexts/MetaContext";
import { LiveForm } from "../components/forms/LiveForm";
import { ConfigFormRenderer } from "../components/ConfigFormRenderer";
import { GeneratedCodePanel } from "../components/GeneratedCodePanel";

type LiveConnectionState = "idle" | "connecting" | "connected" | "disconnecting" | "error";
type ApiKeyStatus = "idle" | "loading" | "success" | "error";

interface LiveEventLogEntry {
  id: string;
  timestamp: string;
  level: "info" | "warn" | "error";
  label: string;
  details?: string;
}

interface Props {
  meta: MetaResponse;
}

function summarizeLiveMessage(message: LiveServerMessage): string {
  if ("setupComplete" in message && message.setupComplete) {
    return "Setup complete";
  }
  if ("serverContent" in message && message.serverContent) {
    return "Server content received";
  }
  if ("toolCall" in message && message.toolCall) {
    return "Tool call received";
  }
  if ("toolCallCancellation" in message && message.toolCallCancellation) {
    return "Tool call cancelled";
  }
  if ("goAway" in message && message.goAway) {
    return "Server requested graceful reconnect";
  }
  if ("sessionResumptionUpdate" in message && message.sessionResumptionUpdate) {
    return "Session resumption update";
  }
  if ("usageMetadata" in message && message.usageMetadata) {
    return "Usage metadata received";
  }

  return "Live server message received";
}

function toPrettyDetails(value: unknown): string {
  if (typeof value === "string") {
    return value;
  }

  try {
    return JSON.stringify(value, null, 2);
  } catch {
    return String(value);
  }
}

export function LiveServicePage({ meta }: Props) {
  const models = meta.models.live || [];
  const [selectedModel, setSelectedModel] = useState(models[0] ?? "");
  const [inputs, setInputs] = useState<Record<string, any>>({});
  const [config, setConfig] = useState<Record<string, any>>({});
  const [connectionState, setConnectionState] = useState<LiveConnectionState>("idle");
  const [apiKeyStatus, setApiKeyStatus] = useState<ApiKeyStatus>("idle");
  const [inputTranscript, setInputTranscript] = useState("");
  const [outputTranscript, setOutputTranscript] = useState("");
  const [textMessageDraft, setTextMessageDraft] = useState("");
  const [lastError, setLastError] = useState<string | null>(null);
  const [eventLog, setEventLog] = useState<LiveEventLogEntry[]>([]);
  const sessionRef = useRef<GeminiLiveChatSession | null>(null);
  const configSignatureRef = useRef<string | null>(null);

  const descriptors = meta.configs.live?.[selectedModel] ?? [];

  useEffect(() => {
    if (models.length > 0 && !models.includes(selectedModel)) {
      setSelectedModel(models[0]);
    }
  }, [models, selectedModel]);

  useEffect(() => {
    return () => {
      const activeSession = sessionRef.current;
      sessionRef.current = null;
      if (activeSession) {
        activeSession.disconnect("Unmounting /live page");
      }
    };
  }, []);

  const appendEvent = (level: LiveEventLogEntry["level"], label: string, details?: string) => {
    setEventLog((current) => [
      {
        id: `${Date.now()}-${current.length}`,
        timestamp: new Date().toLocaleTimeString(),
        level,
        label,
        details,
      },
      ...current,
    ]);
  };

  const disconnectSession = (reason?: string) => {
    const activeSession = sessionRef.current;
    if (!activeSession) {
      setConnectionState((state) => (state === "error" ? "error" : "idle"));
      return;
    }

    setConnectionState("disconnecting");
    sessionRef.current = null;

    try {
      activeSession.disconnect(reason ?? "Disconnected from /live page");
    } catch (error) {
      appendEvent("warn", "Disconnect warning", error instanceof Error ? error.message : String(error));
    } finally {
      setConnectionState("idle");
    }
  };

  useEffect(() => {
    const signature = JSON.stringify({ model: selectedModel, config });
    if (!configSignatureRef.current) {
      configSignatureRef.current = signature;
      return;
    }

    if (configSignatureRef.current !== signature) {
      configSignatureRef.current = signature;
      if (sessionRef.current) {
        appendEvent("info", "Session disconnected", "Model or config changed. Connect again to apply the new settings.");
        disconnectSession("Model or config changed");
      }
    }
  }, [selectedModel, config]);

  const handleConnect = async () => {
    if (connectionState === "connecting" || connectionState === "connected") {
      return;
    }

    setConnectionState("connecting");
    setApiKeyStatus("loading");
    setLastError(null);
    setInputTranscript("");
    setOutputTranscript("");
    appendEvent("info", "Connecting", `Starting Live session with model ${selectedModel}.`);

    try {
      const keyResponse = await fetch("/api/live/key");
      if (!keyResponse.ok) {
        throw new Error(`Failed to fetch API key: ${keyResponse.status}`);
      }

      const keyPayload = await keyResponse.json() as { apiKey?: string };
      if (!keyPayload.apiKey) {
        throw new Error("Live API key response did not include an apiKey.");
      }

      setApiKeyStatus("success");

      const session = new GeminiLiveChatSession({
        apiKey: keyPayload.apiKey,
        model: selectedModel,
        ...config,
        onSetupComplete: () => {
          setConnectionState("connected");
          appendEvent("info", "Setup complete");
        },
        onInputTranscription: (transcript, isFinal) => {
          setInputTranscript(transcript);
          appendEvent("info", isFinal ? "Input transcription (final)" : "Input transcription", transcript);
        },
        onOutputTranscription: (transcript, isFinal) => {
          setOutputTranscript(transcript);
          appendEvent("info", isFinal ? "Output transcription (final)" : "Output transcription", transcript);
        },
        onMessage: (message: LiveServerMessage) => {
          appendEvent("info", summarizeLiveMessage(message), toPrettyDetails(message));
        },
        onToolCall: (id, name, args) => {
          appendEvent("info", `Tool call: ${name}`, toPrettyDetails({ id, args }));
        },
        onToolResponse: (id, name, response) => {
          appendEvent("info", `Tool response: ${name}`, toPrettyDetails({ id, response }));
        },
        onGoAway: (timeLeft) => {
          appendEvent("warn", "Go away warning", `Server requested reconnection. Time left: ${timeLeft}`);
        },
        onReconnecting: (attempt) => {
          appendEvent("warn", "Reconnecting", `Reconnect attempt ${attempt}.`);
        },
        onReconnected: () => {
          appendEvent("info", "Reconnected");
        },
        onError: (error) => {
          const message = error instanceof Error ? error.message : String(error);
          setLastError(message);
          setConnectionState("error");
          appendEvent("error", "Session error", message);
        },
        onEnd: () => {
          sessionRef.current = null;
          setConnectionState("idle");
          appendEvent("info", "Session ended");
        },
      });

      sessionRef.current = session;
      await session.connect(inputs.greetingPrompt?.trim() || undefined);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      setApiKeyStatus("error");
      setLastError(message);
      setConnectionState("error");
      appendEvent("error", "Connect failed", message);
      if (sessionRef.current) {
        try {
          sessionRef.current.disconnect("Connect failed");
        } catch {
          // no-op
        }
        sessionRef.current = null;
      }
    }
  };

  const handleDisconnect = () => {
    appendEvent("info", "Disconnecting");
    disconnectSession("Disconnected by user");
  };

  const handleSendText = () => {
    const trimmedMessage = textMessageDraft.trim();
    if (!trimmedMessage || !sessionRef.current || connectionState !== "connected") {
      return;
    }

    sessionRef.current.sendTextMessage(trimmedMessage);
    appendEvent("info", "Text message sent", trimmedMessage);
    setTextMessageDraft("");
  };

  const statusColor =
    connectionState === "connected"
      ? "#34d399"
      : connectionState === "connecting" || connectionState === "disconnecting"
        ? "#fbbf24"
        : connectionState === "error"
          ? "#f87171"
          : "#94a3b8";

  return (
    <div className="service-page">
      <header className="service-header">
        <h1>Live</h1>
        <p className="lede">Real-time multimodal session in the browser using GeminiLiveChatSession.</p>

        <div style={{ display: "flex", gap: 24, flexWrap: "wrap", alignItems: "center" }}>
          <div className="model-picker">
            <label htmlFor="live-model-select"><strong>Model:</strong> </label>
            <select
              id="live-model-select"
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value)}
              disabled={connectionState === "connecting" || connectionState === "connected"}
            >
              {models.map((model) => (
                <option key={model} value={model}>{model}</option>
              ))}
            </select>
          </div>

          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              padding: "8px 12px",
              borderRadius: 999,
              background: "rgba(15, 23, 42, 0.75)",
              border: `1px solid ${statusColor}`,
              color: statusColor,
              fontWeight: 600,
            }}
          >
            <span style={{ width: 8, height: 8, borderRadius: "50%", background: statusColor }} />
            {connectionState.toUpperCase()}
          </div>

          <div className="muted" style={{ fontSize: "0.9rem" }}>
            API key: {apiKeyStatus}
          </div>
        </div>
      </header>

      <section className="service-layout" style={{ marginTop: 24, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 32 }}>
        <div className="request-area" style={{ display: "flex", flexDirection: "column", gap: 32 }}>
          <div>
            <h3>Session Input</h3>
            <LiveForm values={inputs} onChange={setInputs} />
          </div>

          <div>
            <h3>Configuration</h3>
            <ConfigFormRenderer descriptors={descriptors} values={config} onChange={setConfig} />
          </div>

          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            <button
              onClick={handleConnect}
              disabled={connectionState === "connecting" || connectionState === "connected"}
              style={{
                padding: "12px 24px",
                fontSize: "1.05rem",
                cursor: connectionState === "connecting" || connectionState === "connected" ? "not-allowed" : "pointer",
                background: connectionState === "connecting" || connectionState === "connected" ? "#64748b" : "#3b82f6",
                color: "white",
                border: "none",
                borderRadius: 6,
              }}
            >
              {connectionState === "connecting" ? "Connecting..." : "Connect"}
            </button>

            <button
              onClick={handleDisconnect}
              disabled={connectionState !== "connected" && connectionState !== "error"}
              style={{
                padding: "12px 24px",
                fontSize: "1.05rem",
                cursor: connectionState !== "connected" && connectionState !== "error" ? "not-allowed" : "pointer",
                background: connectionState !== "connected" && connectionState !== "error" ? "#475569" : "#7f1d1d",
                color: "white",
                border: "none",
                borderRadius: 6,
              }}
            >
              {connectionState === "disconnecting" ? "Disconnecting..." : "Disconnect"}
            </button>

            <button
              onClick={() => setEventLog([])}
              style={{
                padding: "12px 20px",
                fontSize: "0.95rem",
                cursor: "pointer",
                background: "transparent",
                color: "#cbd5e1",
                border: "1px solid rgba(148, 163, 184, 0.3)",
                borderRadius: 6,
              }}
            >
              Clear Log
            </button>
          </div>
        </div>

        <div className="results-area" style={{ display: "flex", flexDirection: "column", gap: 32 }}>
          <div className="execution-area">
            <h3>Live Session Console</h3>

            <div style={{ display: "grid", gap: 16 }}>
              <div style={{ background: "rgba(0,0,0,0.35)", borderRadius: 10, padding: 16 }}>
                <div style={{ fontWeight: 700, marginBottom: 8 }}>Input Transcript</div>
                <div style={{ whiteSpace: "pre-wrap", minHeight: 48 }} className="muted">
                  {inputTranscript || "Waiting for microphone input..."}
                </div>
              </div>

              <div style={{ background: "rgba(0,0,0,0.35)", borderRadius: 10, padding: 16 }}>
                <div style={{ fontWeight: 700, marginBottom: 8 }}>Output Transcript</div>
                <div style={{ whiteSpace: "pre-wrap", minHeight: 48 }} className="muted">
                  {outputTranscript || "Waiting for model output..."}
                </div>
              </div>

              <div style={{ background: "rgba(0,0,0,0.35)", borderRadius: 10, padding: 16 }}>
                <div style={{ fontWeight: 700, marginBottom: 8 }}>Send Text</div>
                <div style={{ display: "flex", gap: 12 }}>
                  <textarea
                    value={textMessageDraft}
                    onChange={(e) => setTextMessageDraft(e.target.value)}
                    style={{ width: "100%", minHeight: 72, padding: 10 }}
                    placeholder="Send a text turn into the live session..."
                  />
                  <button
                    onClick={handleSendText}
                    disabled={connectionState !== "connected" || textMessageDraft.trim().length === 0}
                    style={{
                      padding: "12px 18px",
                      minWidth: 96,
                      cursor: connectionState !== "connected" || textMessageDraft.trim().length === 0 ? "not-allowed" : "pointer",
                      background: connectionState !== "connected" || textMessageDraft.trim().length === 0 ? "#475569" : "#2563eb",
                      color: "white",
                      border: "none",
                      borderRadius: 6,
                    }}
                  >
                    Send Text
                  </button>
                </div>
              </div>

              <div style={{ background: "rgba(0,0,0,0.35)", borderRadius: 10, padding: 16 }}>
                <div style={{ fontWeight: 700, marginBottom: 8 }}>Event Log</div>
                {eventLog.length === 0 ? (
                  <p className="muted" style={{ margin: 0 }}>No live session events yet.</p>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: 10, maxHeight: 360, overflowY: "auto" }}>
                    {eventLog.map((entry) => (
                      <div
                        key={entry.id}
                        style={{
                          background: "rgba(15, 23, 42, 0.75)",
                          borderRadius: 8,
                          padding: 12,
                          border: `1px solid ${entry.level === "error" ? "rgba(248,113,113,0.6)" : entry.level === "warn" ? "rgba(251,191,36,0.5)" : "rgba(96,165,250,0.25)"}`,
                        }}
                      >
                        <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
                          <strong>{entry.label}</strong>
                          <span className="muted" style={{ fontSize: "0.8rem" }}>{entry.timestamp}</span>
                        </div>
                        {entry.details && (
                          <pre
                            style={{
                              whiteSpace: "pre-wrap",
                              margin: "8px 0 0",
                              fontFamily: "inherit",
                              fontSize: "0.9rem",
                              color: "#cbd5e1",
                            }}
                          >
                            {entry.details}
                          </pre>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {lastError && (
                <div style={{ background: "rgba(127,29,29,0.3)", border: "1px solid rgba(248,113,113,0.45)", borderRadius: 10, padding: 16 }}>
                  <div style={{ fontWeight: 700, marginBottom: 8, color: "#fca5a5" }}>Last Error</div>
                  <div style={{ whiteSpace: "pre-wrap" }}>{lastError}</div>
                </div>
              )}
            </div>
          </div>

          <div className="code-area">
            <h3>Generated Code</h3>
            <GeneratedCodePanel serviceId="live" model={selectedModel} inputs={inputs} config={config} />
          </div>

          <div className="runs-area">
            <h3>Saved Runs</h3>
            <p className="muted">Live sessions are not persisted yet.</p>
          </div>
        </div>
      </section>
    </div>
  );
}
