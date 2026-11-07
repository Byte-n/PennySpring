import type { AiConfigSnapshot } from '@pennyspring/api';
import { z } from 'zod';

const modelSchema = z.object({
  modelId: z.string().min(1),
  contextWindow: z.number().int().positive(),
  reasoningEffort: z.enum(['off', 'low', 'medium', 'high']),
  multimodal: z.boolean(),
});

const providerSchema = z.object({
  id: z.number().int().positive(),
  descriptorId: z.string().min(1),
  name: z.string().min(1),
  baseUrl: z.string().min(1),
  defaultModelId: z.string(),
  models: z.array(modelSchema),
  storeResponses: z.boolean(),
  apiKey: z.string().default(''),
});

const selectionSchema = z.object({
  providerId: z.number().int().nonnegative(),
  modelId: z.string(),
});

const agentRulesSchema = z.object({
  agentRules: z.string(),
  quickBookRules: z.string(),
});

const snapshotSchema = z.object({
  providers: z.array(providerSchema),
  agentSelection: selectionSchema,
  quickBookSelection: selectionSchema,
  /** 旧版设置包没有该字段；缺失时导入不覆盖目标账本已有规则。 */
  agentRules: agentRulesSchema.optional(),
});

export function parseAiConfigSnapshot(value: unknown): AiConfigSnapshot {
  const result = snapshotSchema.safeParse(value);
  if (!result.success) {
    throw new Error(
      `AI 设置格式不正确: ${result.error.issues[0]?.message ?? '未知错误'}`,
    );
  }
  return result.data as AiConfigSnapshot;
}
