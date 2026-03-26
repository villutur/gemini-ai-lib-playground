import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import type { ServicePageDefinition, ServiceId } from "../../../server/src/shared/types";

export interface MetaResponse {
  services: ServicePageDefinition[];
  models: Record<ServiceId, string[]>;
  configs: Record<ServiceId, Record<string, any[]>>; // TODO: type descriptors accurately later
  presets: Record<ServiceId, any[]>;
}

interface MetaContextType {
  meta: MetaResponse | null;
  loading: boolean;
  error: string | null;
}

export const MetaContext = createContext<MetaContextType>({
  meta: null,
  loading: true,
  error: null,
});

export function MetaProvider({ children }: { children: ReactNode }) {
  const [meta, setMeta] = useState<MetaResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    
    fetch("/api/meta")
      .then((res) => {
        if (!res.ok) throw new Error(`API error: ${res.status}`);
        return res.json();
      })
      .then((data) => {
        if (!cancelled) {
          setMeta(data);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err.message);
          setLoading(false);
        }
      });
      
    return () => { cancelled = true; };
  }, []);

  return (
    <MetaContext.Provider value={{ meta, loading, error }}>
      {children}
    </MetaContext.Provider>
  );
}

export function useMeta() {
  return useContext(MetaContext);
}
