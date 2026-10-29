import {
  AgentError,
  isAgentError,
  toHttpError,
  toNetworkError,
} from '../core/protocol/errors';
import {
  buildChatCompletionsUrl,
  buildModelsUrl,
  buildResponsesUrl,
  isValidBaseUrl,
  normalizeBaseUrl,
} from '../core/url';
import { requireProviderDescriptor } from './catalog';
import type { AgentProviderConfig } from './types';

const CONNECTION_TEST_TIMEOUT_MS = 15_000;
const CONNECTION_TEST_MAX_TOKENS = 16;
const BODY_EXCERPT_LIMIT = 200;

export interface ProviderModelsResult {
  models: string[];
}

export interface ProviderConnectionResult {
  ok: boolean;
  message: string;
  models?: string[];
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function readModelIds(payload: unknown): string[] {
  if (!isRecord(payload) || !Array.isArray(payload.data)) {
    return [];
  }
  return payload.data
    .map(item => (isRecord(item) && typeof item.id === 'string' ? item.id : null))
    .filter((id): id is string => id !== null);
}

function errorMessage(error: unknown): string {
  if (isAgentError(error)) {
    return error.message;
  }
  if (error instanceof Error && error.message.trim()) {
    return error.message.slice(0, BODY_EXCERPT_LIMIT);
  }
  return '连接失败，请检查配置。';
}

function requireConnectionConfig(
  config: AgentProviderConfig,
  apiKey: string,
): { baseUrl: string; apiKey: string } {
  const descriptor = requireProviderDescriptor(config.descriptorId);
  const baseUrl = normalizeBaseUrl(config.baseUrl);
  const key = apiKey.trim();

  if (!isValidBaseUrl(baseUrl)) {
    throw new AgentError(
      'not-configured',
      'Base URL 格式不正确，应形如 https://host/v1。',
    );
  }
  if (descriptor.requiresApiKey && !key) {
    throw new AgentError('not-configured', '请先填写 API Key。');
  }
  return { baseUrl, apiKey: key };
}

function buildConnectionHeaders(apiKey: string): Record<string, string> {
  return {
    'Content-Type': 'application/json',
    ...(apiKey ? { Authorization: `Bearer ${apiKey}` } : {}),
  };
}

async function fetchWithTimeout(
  url: string,
  init: RequestInit,
): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), CONNECTION_TEST_TIMEOUT_MS);
  try {
    return await fetch(url, { ...init, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

export async function fetchProviderModels(
  config: AgentProviderConfig,
  apiKey: string,
): Promise<string[]> {
  const { baseUrl, apiKey: key } = requireConnectionConfig(config, apiKey);
  const response = await fetchWithTimeout(buildModelsUrl(baseUrl), {
    method: 'GET',
    headers: buildConnectionHeaders(key),
  });

  if (!response.ok) {
    const body = await response.text().catch(() => '');
    throw toHttpError(response.status, body);
  }

  const payload: unknown = await response.json().catch(() => null);
  return readModelIds(payload);
}

function buildProbeRequest(
  config: AgentProviderConfig,
  modelId: string,
  baseUrl: string,
): { url: string; body: Record<string, unknown> } {
  const descriptor = requireProviderDescriptor(config.descriptorId);
  if (descriptor.apiKind === 'responses') {
    return {
      url: buildResponsesUrl(baseUrl),
      body: {
        model: modelId,
        input: [{ role: 'user', content: 'ping' }],
        max_output_tokens: CONNECTION_TEST_MAX_TOKENS,
      },
    };
  }
  return {
    url: buildChatCompletionsUrl(baseUrl),
    body: {
      model: modelId,
      messages: [{ role: 'user', content: 'ping' }],
      max_tokens: CONNECTION_TEST_MAX_TOKENS,
    },
  };
}

export async function testProviderConnection(
  config: AgentProviderConfig,
  modelId: string,
  apiKey: string,
): Promise<ProviderConnectionResult> {
  try {
    const { baseUrl, apiKey: key } = requireConnectionConfig(config, apiKey);
    if (!modelId.trim()) {
      throw new AgentError('not-configured', '请先添加模型。');
    }

    const probe = buildProbeRequest(config, modelId, baseUrl);
    const response = await fetchWithTimeout(probe.url, {
      method: 'POST',
      headers: buildConnectionHeaders(key),
      body: JSON.stringify(probe.body),
    });

    if (!response.ok) {
      const body = await response.text().catch(() => '');
      throw toHttpError(response.status, body);
    }

    return { ok: true, message: '连接成功。' };
  } catch (error) {
    if (error instanceof AgentError && error.code === 'timeout') {
      return { ok: false, message: error.message };
    }
    if (error instanceof Error && error.name === 'AbortError') {
      return { ok: false, message: '连接超时，请检查网络或端点地址。' };
    }
    return { ok: false, message: errorMessage(toNetworkError(error)) };
  }
}
