import type { InferSelectModel } from 'drizzle-orm'
import { eq } from 'drizzle-orm'

import type { AgentReasoningEffort, AgentSelectionScope } from '../constants'
import { agentProviders, agentSelections, agentThreads, bookProviderKeys } from '../schema'
import type { Database } from '../types'
import type {
  AgentProviderModel,
  AgentProviderRow,
  AgentSelection,
  CreateAgentProviderInput,
  Tx,
  UpdateAgentProviderInput,
} from './types'

const DEFAULT_CONTEXT_WINDOW = 200_000
const DEFAULT_REASONING_EFFORT: AgentReasoningEffort = 'off'
const REASONING_EFFORTS: readonly AgentReasoningEffort[] = ['off', 'low', 'medium', 'high']

type ProviderDbRow = InferSelectModel<typeof agentProviders>

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function normalizeContextWindow(value: unknown): number {
  if (typeof value !== 'number' || !Number.isFinite(value) || value <= 0) {
    return DEFAULT_CONTEXT_WINDOW
  }
  return Math.floor(value)
}

function normalizeReasoningEffort(value: unknown): AgentReasoningEffort {
  return typeof value === 'string' &&
    REASONING_EFFORTS.includes(value as AgentReasoningEffort)
    ? (value as AgentReasoningEffort)
    : DEFAULT_REASONING_EFFORT
}

function parseModels(raw: string): AgentProviderModel[] {
  let parsed: unknown
  try {
    parsed = JSON.parse(raw)
  } catch {
    return []
  }
  if (!Array.isArray(parsed)) {
    return []
  }

  const models: AgentProviderModel[] = []
  const seen = new Set<string>()
  for (const item of parsed) {
    if (!isRecord(item) || typeof item.modelId !== 'string') {
      continue
    }
    const modelId = item.modelId.trim()
    if (!modelId || seen.has(modelId)) {
      continue
    }
    seen.add(modelId)
    models.push({
      modelId,
      contextWindow: normalizeContextWindow(item.contextWindow),
      reasoningEffort: normalizeReasoningEffort(item.reasoningEffort),
      multimodal: item.multimodal === true,
    })
  }
  return models
}

function serializeModels(models: AgentProviderModel[]): string {
  return JSON.stringify(models)
}

function normalizeProviderInput(input: CreateAgentProviderInput | UpdateAgentProviderInput) {
  const descriptorId = input.descriptorId.trim()
  if (!descriptorId) {
    throw new Error('提供商类型不能为空')
  }
  const name = input.name.trim()
  if (!name) {
    throw new Error('提供商名称不能为空')
  }
  const baseUrl = input.baseUrl.trim()
  if (!baseUrl) {
    throw new Error('Base URL 不能为空')
  }

  const models = parseModels(serializeModels(input.models))
  const requestedDefault = input.defaultModelId?.trim() ?? ''
  const defaultModelId = models.some(model => model.modelId === requestedDefault)
    ? requestedDefault
    : (models[0]?.modelId ?? '')

  return {
    descriptorId,
    name,
    baseUrl,
    defaultModelId,
    models,
    storeResponses: input.storeResponses !== false,
  }
}

function toProviderRow(row: ProviderDbRow): AgentProviderRow {
  return {
    id: row.id,
    descriptorId: row.descriptorId,
    name: row.name,
    baseUrl: row.baseUrl,
    defaultModelId: row.defaultModelId,
    models: parseModels(row.models),
    storeResponses: row.storeResponses === 1,
    createdTime: row.createdTime,
    updatedTime: row.updatedTime,
  }
}

async function getProviderDbRow(tx: Tx, providerId: number): Promise<ProviderDbRow> {
  const row = await tx.select().from(agentProviders).where(eq(agentProviders.id, providerId)).get()
  if (!row) {
    throw new Error(`提供商不存在: ${providerId}`)
  }
  return row
}

export async function getAllProviders(db: Database): Promise<AgentProviderRow[]> {
  const rows = await db.select().from(agentProviders).orderBy(agentProviders.id).all()
  return rows.map(toProviderRow)
}

export async function getProviderById(db: Database, providerId: number): Promise<AgentProviderRow> {
  return toProviderRow(await getProviderDbRow(db as Tx, providerId))
}

export function createProvider(
  db: Database,
  input: CreateAgentProviderInput,
): Promise<AgentProviderRow> {
  const normalized = normalizeProviderInput(input)

  return db.transaction(async tx => {
    const inserted = await tx
      .insert(agentProviders)
      .values({
        descriptorId: normalized.descriptorId,
        name: normalized.name,
        baseUrl: normalized.baseUrl,
        defaultModelId: normalized.defaultModelId,
        models: serializeModels(normalized.models),
        storeResponses: normalized.storeResponses ? 1 : 0,
      })
      .returning({ id: agentProviders.id })

    const providerId = inserted[0]?.id
    if (providerId === undefined) {
      throw new Error('创建提供商失败')
    }
    return toProviderRow(await getProviderDbRow(tx, providerId))
  })
}

async function reconcileModelReferences(
  tx: Tx,
  providerId: number,
  modelIds: readonly string[],
  fallbackModelId: string,
): Promise<void> {
  const validModelIds = new Set(modelIds)

  const selections = await tx
    .select({ id: agentSelections.id, modelId: agentSelections.modelId })
    .from(agentSelections)
    .where(eq(agentSelections.providerId, providerId))
  for (const selection of selections) {
    if (selection.modelId !== '' && !validModelIds.has(selection.modelId)) {
      await tx
        .update(agentSelections)
        .set({ modelId: fallbackModelId })
        .where(eq(agentSelections.id, selection.id))
    }
  }

  const threads = await tx
    .select({ id: agentThreads.id, modelId: agentThreads.modelId })
    .from(agentThreads)
    .where(eq(agentThreads.providerId, providerId))
  for (const thread of threads) {
    if (thread.modelId !== '' && !validModelIds.has(thread.modelId)) {
      await tx
        .update(agentThreads)
        .set({ modelId: fallbackModelId })
        .where(eq(agentThreads.id, thread.id))
    }
  }
}

export function updateProvider(
  db: Database,
  input: UpdateAgentProviderInput,
): Promise<AgentProviderRow> {
  const normalized = normalizeProviderInput(input)

  return db.transaction(async tx => {
    await getProviderDbRow(tx, input.id)
    await tx
      .update(agentProviders)
      .set({
        descriptorId: normalized.descriptorId,
        name: normalized.name,
        baseUrl: normalized.baseUrl,
        defaultModelId: normalized.defaultModelId,
        models: serializeModels(normalized.models),
        storeResponses: normalized.storeResponses ? 1 : 0,
      })
      .where(eq(agentProviders.id, input.id))
    await reconcileModelReferences(
      tx,
      input.id,
      normalized.models.map(model => model.modelId),
      normalized.defaultModelId,
    )

    return toProviderRow(await getProviderDbRow(tx, input.id))
  })
}

export function deleteProvider(db: Database, providerId: number): Promise<void> {
  return db.transaction(async tx => {
    await getProviderDbRow(tx, providerId)

    await tx
      .update(agentThreads)
      .set({ providerId: 0, modelId: '' })
      .where(eq(agentThreads.providerId, providerId))
    await tx.delete(bookProviderKeys).where(eq(bookProviderKeys.providerId, providerId))
    await tx
      .update(agentSelections)
      .set({ providerId: 0, modelId: '' })
      .where(eq(agentSelections.providerId, providerId))
    await tx.delete(agentProviders).where(eq(agentProviders.id, providerId))
  })
}

export async function validateAgentSelection(tx: Tx, selection: AgentSelection): Promise<void> {
  if (selection.providerId === 0) {
    if (selection.modelId !== '') {
      throw new Error('未选择提供商时模型必须为空')
    }
    return
  }
  if (selection.providerId < 0) {
    throw new Error(`提供商不存在: ${selection.providerId}`)
  }

  const provider = await getProviderDbRow(tx, selection.providerId)
  if (selection.modelId === '') {
    return
  }
  const models = parseModels(provider.models)
  if (!models.some(model => model.modelId === selection.modelId)) {
    throw new Error(`模型不存在: ${selection.modelId}`)
  }
}

export async function getAgentSelection(
  db: Database,
  scope: AgentSelectionScope,
): Promise<AgentSelection> {
  const row = await db
    .select()
    .from(agentSelections)
    .where(eq(agentSelections.scope, scope))
    .get()
  return row ? { providerId: row.providerId, modelId: row.modelId } : { providerId: 0, modelId: '' }
}

export function setAgentSelection(
  db: Database,
  scope: AgentSelectionScope,
  selection: AgentSelection,
): Promise<AgentSelection> {
  return db.transaction(async tx => {
    await validateAgentSelection(tx, selection)
    await tx
      .insert(agentSelections)
      .values({
        scope,
        providerId: selection.providerId,
        modelId: selection.modelId,
      })
      .onConflictDoUpdate({
        target: agentSelections.scope,
        set: {
          providerId: selection.providerId,
          modelId: selection.modelId,
          updatedTime: Date.now(),
        },
      })
    return { providerId: selection.providerId, modelId: selection.modelId }
  })
}
