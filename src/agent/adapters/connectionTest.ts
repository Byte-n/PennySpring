import { AgentError, toHttpError, toNetworkError } from '../core/protocol/errors';
import { buildModelsUrl, isValidBaseUrl } from '../core/url';

const CONNECTION_TEST_TIMEOUT_MS = 15_000;
const MODEL_PREVIEW_LIMIT = 5;

export interface ConnectionTestInput {
  baseUrl: string;
  apiKey: string;
}

export interface ConnectionTestResult {
  ok: boolean;
  message: string;
  models?: string[];
}

function readModelIds(payload: unknown): string[] {
  if (typeof payload !== 'object' || payload === null) {
    return [];
  }

  const data = (payload as { data?: unknown }).data;
  if (!Array.isArray(data)) {
    return [];
  }

  return data
    .map(item => {
      if (typeof item !== 'object' || item === null) {
        return null;
      }
      const id = (item as { id?: unknown }).id;
      return typeof id === 'string' && id.length > 0 ? id : null;
    })
    .filter((id): id is string => id !== null);
}

export async function testAgentConnection(
  input: ConnectionTestInput,
): Promise<ConnectionTestResult> {
  const baseUrl = input.baseUrl.trim();
  const apiKey = input.apiKey.trim();

  if (!isValidBaseUrl(baseUrl)) {
    return {
      ok: false,
      message: 'Base URL 格式不正确，应形如 https://host/v1。',
    };
  }
  if (!apiKey) {
    return { ok: false, message: '请先填写 API Key。' };
  }

  const controller = new AbortController();
  const timer = setTimeout(() => {
    controller.abort();
  }, CONNECTION_TEST_TIMEOUT_MS);

  try {
    const response = await fetch(buildModelsUrl(baseUrl), {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      signal: controller.signal,
    });

    if (!response.ok) {
      const body = await response.text().catch(() => '');
      throw toHttpError(response.status, body);
    }

    const payload: unknown = await response.json().catch(() => null);
    const models = readModelIds(payload);

    if (models.length === 0) {
      return { ok: true, message: '连接成功。', models };
    }

    const preview = models.slice(0, MODEL_PREVIEW_LIMIT).join('、');
    const suffix = models.length > MODEL_PREVIEW_LIMIT ? ' 等' : '';

    return {
      ok: true,
      message: `连接成功，可用模型 ${models.length} 个：${preview}${suffix}`,
      models,
    };
  } catch (error) {
    if (controller.signal.aborted) {
      return { ok: false, message: '连接超时，请检查网络或改为直连地址。' };
    }
    if (error instanceof AgentError) {
      return { ok: false, message: error.message };
    }
    return { ok: false, message: toNetworkError(error).message };
  } finally {
    clearTimeout(timer);
  }
}
