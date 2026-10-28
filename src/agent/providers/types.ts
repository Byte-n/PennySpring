export type ProviderApiKind = 'responses' | 'chat' | 'openai-compatible';

export interface ProviderDescriptor {
  id: string;
  name: string;
  description: string;
  apiKind: ProviderApiKind;
  defaultBaseUrl: string;
  baseUrlHint: string;
  modelPlaceholder: string;
  requiresApiKey: boolean;
}

export interface AgentProviderConfig {
  id: string;
  descriptorId: string;
  name: string;
  baseUrl: string;
  model: string;
  storeResponses: boolean;
  createdAt: number;
  updatedAt: number;
}

export interface AgentProviderDraft {
  descriptorId: string;
  name: string;
  baseUrl: string;
  model: string;
  storeResponses?: boolean;
}
