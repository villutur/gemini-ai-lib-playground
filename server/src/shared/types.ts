export type ServiceId =
  | "text"
  | "chat"
  | "embedding"
  | "image"
  | "audio"
  | "music"
  | "video"
  | "live";

export interface ServicePageDefinition {
  id: ServiceId;
  name: string;
  description: string;
}
