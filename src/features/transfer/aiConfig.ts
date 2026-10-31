import type { AiConfigSnapshot } from '@pennyspring/api'
import { strFromU8, strToU8 } from 'fflate'
import { z } from 'zod'

import { unzipFiles, zipFiles, type PackageFiles } from './zip'

export const AI_CONFIG_FORMAT = 'pennyspring.ai-config'
export const AI_CONFIG_FORMAT_VERSION = 1
export const AI_CONFIG_PACKAGE_EXTENSION = 'psa'

const DEFAULT_APP_VERSION = '0.0.1'

export interface AiConfigManifest {
  format: typeof AI_CONFIG_FORMAT
  formatVersion: number
  appVersion: string
  createdAt: number
  providerCount: number
}

export interface BuiltAiConfigPackage {
  manifest: AiConfigManifest
  snapshot: AiConfigSnapshot
  files: PackageFiles
}

export interface ParsedAiConfigPackage {
  manifest: AiConfigManifest
  snapshot: AiConfigSnapshot
}

export interface BuildAiConfigPackageOptions {
  appVersion?: string
  createdAt?: number
}

const modelSchema = z.object({
  modelId: z.string().min(1),
  contextWindow: z.number().int().positive(),
  reasoningEffort: z.enum(['off', 'low', 'medium', 'high']),
  multimodal: z.boolean(),
})

const providerSchema = z.object({
  id: z.number().int().positive(),
  descriptorId: z.string().min(1),
  name: z.string().min(1),
  baseUrl: z.string().min(1),
  defaultModelId: z.string(),
  models: z.array(modelSchema),
  storeResponses: z.boolean(),
})

const selectionSchema = z.object({
  providerId: z.number().int().nonnegative(),
  modelId: z.string(),
})

const snapshotSchema = z.object({
  providers: z.array(providerSchema),
  agentSelection: selectionSchema,
  quickBookSelection: selectionSchema,
})

const manifestSchema = z.object({
  format: z.literal(AI_CONFIG_FORMAT),
  formatVersion: z.number().int().positive(),
  appVersion: z.string(),
  createdAt: z.number().int().nonnegative(),
  providerCount: z.number().int().nonnegative(),
})

function readJson(files: PackageFiles, path: string): unknown {
  const file = files[path]
  if (!file) throw new Error(`AI 配置包缺少文件: ${path}`)
  try {
    return JSON.parse(strFromU8(file))
  } catch {
    throw new Error(`AI 配置包文件格式不正确: ${path}`)
  }
}

export function buildAiConfigPackage(
  snapshot: AiConfigSnapshot,
  options: BuildAiConfigPackageOptions = {},
): BuiltAiConfigPackage {
  const parsed = snapshotSchema.parse(snapshot) as AiConfigSnapshot
  const manifest: AiConfigManifest = {
    format: AI_CONFIG_FORMAT,
    formatVersion: AI_CONFIG_FORMAT_VERSION,
    appVersion: options.appVersion ?? DEFAULT_APP_VERSION,
    createdAt: options.createdAt ?? Date.now(),
    providerCount: parsed.providers.length,
  }
  return {
    manifest,
    snapshot: parsed,
    files: {
      'manifest.json': strToU8(JSON.stringify(manifest)),
      'ai-config.json': strToU8(JSON.stringify(parsed)),
    },
  }
}

export function zipAiConfigPackage(files: PackageFiles): Promise<Uint8Array> {
  return zipFiles(files)
}

export async function parseAiConfigPackage(
  data: Uint8Array,
): Promise<ParsedAiConfigPackage> {
  const files = await unzipFiles(data)
  const manifestResult = manifestSchema.safeParse(readJson(files, 'manifest.json'))
  if (!manifestResult.success) {
    throw new Error(
      `AI 配置包清单格式不正确: ${manifestResult.error.issues[0]?.message ?? '未知错误'}`,
    )
  }
  if (manifestResult.data.formatVersion > AI_CONFIG_FORMAT_VERSION) {
    throw new Error('AI 配置包版本过高，请升级 PennySpring 后再导入')
  }

  const snapshotResult = snapshotSchema.safeParse(readJson(files, 'ai-config.json'))
  if (!snapshotResult.success) {
    throw new Error(
      `AI 配置包内容格式不正确: ${snapshotResult.error.issues[0]?.message ?? '未知错误'}`,
    )
  }

  return {
    manifest: manifestResult.data,
    snapshot: snapshotResult.data as AiConfigSnapshot,
  }
}

function formatDate(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function createAiConfigFileName(createdAt: number): string {
  return `PennySpring_AI配置_${formatDate(new Date(createdAt))}.${AI_CONFIG_PACKAGE_EXTENSION}`
}
