import type {
  AgentModelConfig,
  AgentModelDraft,
  AgentProviderConfig,
  AgentReasoningEffort,
} from './types';

export const DEFAULT_CONTEXT_WINDOW = 200_000;

export const CONTEXT_WINDOW_OPTIONS: readonly {
  value: number;
  label: string;
}[] = [
  { value: 200_000, label: '200k' },
  { value: 400_000, label: '400k' },
  { value: 1_000_000, label: '1m' },
];

export const DEFAULT_REASONING_EFFORT: AgentReasoningEffort = 'off';

export const REASONING_EFFORT_OPTIONS: readonly {
  value: AgentReasoningEffort;
  label: string;
}[] = [
  { value: 'off', label: '关闭' },
  { value: 'low', label: '低' },
  { value: 'medium', label: '中' },
  { value: 'high', label: '高' },
];

const REASONING_EFFORTS = new Set<AgentReasoningEffort>(
  REASONING_EFFORT_OPTIONS.map(option => option.value),
);

export function isReasoningEffort(
  value: unknown,
): value is AgentReasoningEffort {
  return (
    typeof value === 'string' &&
    REASONING_EFFORTS.has(value as AgentReasoningEffort)
  );
}

export function normalizeContextWindow(value: number | undefined): number {
  if (value === undefined || !Number.isFinite(value) || value <= 0) {
    return DEFAULT_CONTEXT_WINDOW;
  }
  return Math.floor(value);
}

export function normalizeModelDraft(draft: AgentModelDraft): AgentModelConfig {
  return {
    modelId: draft.modelId.trim(),
    contextWindow: normalizeContextWindow(draft.contextWindow),
    reasoningEffort: isReasoningEffort(draft.reasoningEffort)
      ? draft.reasoningEffort
      : DEFAULT_REASONING_EFFORT,
  };
}

export function getProviderDefaultModel(
  provider: AgentProviderConfig,
): AgentModelConfig | null {
  return (
    provider.models.find(model => model.modelId === provider.defaultModelId) ??
    provider.models[0] ??
    null
  );
}

export function resolveProviderModel(
  provider: AgentProviderConfig,
  modelId?: string | null,
): AgentModelConfig | null {
  if (modelId) {
    const found = provider.models.find(model => model.modelId === modelId);
    if (found) {
      return found;
    }
  }
  return getProviderDefaultModel(provider);
}

export function formatContextWindow(tokens: number): string {
  if (tokens < 1_000) {
    return String(tokens);
  }
  const thousands = tokens / 1_000;
  return `${thousands >= 100 ? Math.round(thousands) : Number(thousands.toFixed(1))}k`;
}

export function formatReasoningEffort(effort: AgentReasoningEffort): string {
  const option = REASONING_EFFORT_OPTIONS.find(item => item.value === effort);
  return option?.label ?? '关闭';
}
