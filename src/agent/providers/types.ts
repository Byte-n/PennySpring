export type ProviderApiKind = 'responses' | 'chat' | 'openai-compatible';

export type AgentReasoningEffort = 'off' | 'low' | 'medium' | 'high';

export interface AgentModelConfig {
  modelId: string;
  contextWindow: number;
  reasoningEffort: AgentReasoningEffort;
  /** 是否支持图片输入（多模态）。 */
  multimodal: boolean;
}

export interface AgentModelDraft {
  modelId: string;
  contextWindow?: number;
  reasoningEffort?: AgentReasoningEffort;
  multimodal?: boolean;
}

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
  defaultModelId: string;
  models: AgentModelConfig[];
  storeResponses: boolean;
  createdAt: number;
  updatedAt: number;
}

export interface AgentProviderDraft {
  descriptorId: string;
  name: string;
  baseUrl: string;
  defaultModelId?: string;
  models: AgentModelDraft[];
  storeResponses?: boolean;
}
