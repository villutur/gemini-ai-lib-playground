import type { ServiceId } from "../../../server/src/shared/types";
import { generateCodeSnippet } from "../utils/codeSnippet";
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

interface Props {
  serviceId: ServiceId;
  model: string;
  inputs: Record<string, any>;
  config: Record<string, any>;
}

export function GeneratedCodePanel({ serviceId, model, inputs, config }: Props) {
  const snippet = generateCodeSnippet(serviceId, model, inputs, config);

  const handleCopy = () => {
    navigator.clipboard.writeText(snippet);
  };

  return (
    <div style={{ position: "relative", borderRadius: 8, overflow: "hidden" }}>
      <button 
        onClick={handleCopy}
        style={{ position: "absolute", top: 8, right: 8, padding: "4px 8px", background: "rgba(255,255,255,0.1)", color: "#fff", border: "1px solid rgba(255,255,255,0.2)", borderRadius: 4, cursor: "pointer", zIndex: 10 }}
      >
        Copy
      </button>
      <SyntaxHighlighter 
        language="typescript" 
        style={vscDarkPlus} 
        customStyle={{ margin: 0, padding: 16, background: "rgba(0,0,0,0.5)", fontSize: "0.9rem" }}
      >
        {snippet}
      </SyntaxHighlighter>
    </div>
  );
}
