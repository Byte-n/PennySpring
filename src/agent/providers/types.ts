import type {
  AgentProviderModel,
  AgentProviderRow,
  AgentReasoningEffort,
} from '@pennyspring/api';

export type {
  AgentProviderModel,
  AgentProviderRow,
  AgentReasoningEffort,
};

export type ProviderApiKind =
  | 'responses'
  | 'chat'
  | 'alibaba'
  | 'openai-compatible';

/** 数据库提供商行，id 为服务器级自增整数。 */
export type AgentProviderConfig = AgentProviderRow;

/** 提供商模型配置。 */
export type AgentModelConfig = AgentProviderModel;

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

export interface AgentProviderDraft {
  descriptorId: string;
  name: string;
  baseUrl: string;
  defaultModelId?: string;
  models: AgentModelDraft[];
  storeResponses?: boolean;
}
