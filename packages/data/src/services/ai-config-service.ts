import { eq } from 'drizzle-orm'

import { agentProviders, agentSelections, agentThreads } from '../schema'
import type { Database } from '../types'
import {
  getAllProviders,
  getAgentSelection,
  normalizeProviderConfig,
  type NormalizedProviderConfig,
} from './agent-provider-service'
import type {
  AgentSelection,
  AgentSelectionScope,
  AiConfigProvider,
  AiConfigSnapshot,
  ApplyAiConfigResult,
  Tx,
} from './types'

interface NormalizedProviderEntry {
  id: number
  config: NormalizedProviderConfig
}

interface ProviderKeyRow {
  descriptorId: string
  name: string
  baseUrl: string
}

function providerKey(provider: ProviderKeyRow): string {
  return `${provider.descriptorId}\u0000${provider.baseUrl}\u0000${provider.name}`
}

function normalizeProviders(providers: AiConfigProvider[]): NormalizedProviderEntry[] {
  const ids = new Set<number>()
  const keys = new Set<string>()
  return providers.map(provider => {
    if (ids.has(provider.id)) {
      throw new Error(`AI 配置存在重复的提供商 ID: ${provider.id}`)
    }
    ids.add(provider.id)

    const config = normalizeProviderConfig(provider)
    const key = providerKey(config)
    if (keys.has(key)) {
      throw new Error('AI 配置包含重复的提供商')
    }
    keys.add(key)
    return { id: provider.id, config }
  })
}

function resolveModelId(modelId: string, provider: NormalizedProviderConfig): string {
  if (modelId === '') return ''
  if (provider.models.some(model => model.modelId === modelId)) {
    return modelId
  }
  return provider.defaultModelId
}

function mapSelection(
  selection: AgentSelection,
  providerIdMap: Record<number, number>,
  providersById: Map<number, NormalizedProviderConfig>,
): AgentSelection {
  if (selection.providerId === 0) {
    return { providerId: 0, modelId: '' }
  }
  const providerId = providerIdMap[selection.providerId]
  if (providerId === undefined) {
    return { providerId: 0, modelId: '' }
  }
  const provider = providersById.get(providerId)
  if (!provider) {
    return { providerId, modelId: '' }
  }
  return {
    providerId,
    modelId: resolveModelId(selection.modelId, provider),
  }
}

function upsertSelection(
  tx: Tx,
  scope: AgentSelectionScope,
  selection: AgentSelection,
): Promise<unknown> {
  return tx
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
}

export async function buildAiConfigSnapshot(db: Database): Promise<AiConfigSnapshot> {
  const [providers, agentSelection, quickBookSelection] = await Promise.all([
    getAllProviders(db),
    getAgentSelection(db, 'agent'),
    getAgentSelection(db, 'quickBook'),
  ])

  return {
    providers: providers.map(provider => ({
      id: provider.id,
      descriptorId: provider.descriptorId,
      name: provider.name,
      baseUrl: provider.baseUrl,
      defaultModelId: provider.defaultModelId,
      models: provider.models,
      storeResponses: provider.storeResponses,
    })),
    agentSelection,
    quickBookSelection,
  }
}

export async function applyAiConfigSnapshot(
  db: Database,
  snapshot: AiConfigSnapshot,
): Promise<ApplyAiConfigResult> {
  const normalizedProviders = normalizeProviders(snapshot.providers)

  return db.transaction(async tx => {
    const existingRows = await tx.select().from(agentProviders).all()
    const existingByKey = new Map(existingRows.map(row => [providerKey(row), row]))
    const existingById = new Map(existingRows.map(row => [row.id, row]))
    const providersById = new Map<number, NormalizedProviderConfig>()
    const providerIdMap: Record<number, number> = {}
    let providersCreated = 0
    let providersUpdated = 0

    for (const entry of normalizedProviders) {
      const key = providerKey(entry.config)
      const existing = existingByKey.get(key)
      const values = {
        descriptorId: entry.config.descriptorId,
        name: entry.config.name,
        baseUrl: entry.config.baseUrl,
        defaultModelId: entry.config.defaultModelId,
        models: JSON.stringify(entry.config.models),
        storeResponses: entry.config.storeResponses ? 1 : 0,
      }

      let providerId: number
      if (existing) {
        await tx
          .update(agentProviders)
          .set(values)
          .where(eq(agentProviders.id, existing.id))
        providerId = existing.id
        providersUpdated += 1
      } else {
        const inserted = await tx
          .insert(agentProviders)
          .values(values)
          .returning({ id: agentProviders.id })
        const insertedId = inserted[0]?.id
        if (insertedId === undefined) {
          throw new Error('导入 AI 提供商失败')
        }
        providerId = insertedId
        providersCreated += 1
      }

      providerIdMap[entry.id] = providerId
      providersById.set(providerId, entry.config)
    }

    const snapshotProviders = new Map(
      normalizedProviders.map(entry => [entry.id, entry.config]),
    )
    const threads = await tx.select().from(agentThreads).all()
    let threadsUpdated = 0

    for (const thread of threads) {
      if (thread.providerId === 0) continue
      const mappedProviderId = providerIdMap[thread.providerId]
      const sourceProvider = snapshotProviders.get(thread.providerId)
      if (mappedProviderId === undefined || sourceProvider === undefined) continue

      const targetAtOldId = existingById.get(thread.providerId)
      if (
        targetAtOldId &&
        providerKey(targetAtOldId) !== providerKey(sourceProvider)
      ) {
        continue
      }

      const provider = providersById.get(mappedProviderId)
      if (!provider) continue
      const modelId = resolveModelId(thread.modelId, provider)
      if (
        thread.providerId !== mappedProviderId ||
        thread.modelId !== modelId
      ) {
        await tx
          .update(agentThreads)
          .set({ providerId: mappedProviderId, modelId })
          .where(eq(agentThreads.id, thread.id))
      }
      threadsUpdated += 1
    }

    await upsertSelection(
      tx,
      'agent',
      mapSelection(snapshot.agentSelection, providerIdMap, providersById),
    )
    await upsertSelection(
      tx,
      'quickBook',
      mapSelection(snapshot.quickBookSelection, providerIdMap, providersById),
    )

    return {
      providerIdMap,
      providersCreated,
      providersUpdated,
      threadsUpdated,
    }
  })
}
