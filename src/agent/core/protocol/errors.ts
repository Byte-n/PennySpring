export type AgentErrorCode =
  | 'not-configured'
  | 'unauthorized'
  | 'forbidden'
  | 'not-found'
  | 'rate-limited'
  | 'bad-request'
  | 'bad-response'
  | 'server'
  | 'network'
  | 'timeout'
  | 'aborted'

export class AgentError extends Error {
  readonly code: AgentErrorCode
  readonly status?: number

  constructor(code: AgentErrorCode, message: string, status?: number) {
    super(message)
    this.name = 'AgentError'
    this.code = code
    this.status = status
  }
}

export function isAgentError(error: unknown): error is AgentError {
  return error instanceof AgentError
}

const BODY_EXCERPT_LIMIT = 200

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function excerpt(text: string): string {
  return text.replace(/\s+/g, ' ').trim().slice(0, BODY_EXCERPT_LIMIT)
}

function extractServerMessage(body: string): string {
  if (!body.trim()) {
    return ''
  }

  try {
    const parsed: unknown = JSON.parse(body)
    if (isRecord(parsed)) {
      const nested = parsed.error
      if (isRecord(nested) && typeof nested.message === 'string') {
        return excerpt(nested.message)
      }
      if (typeof parsed.message === 'string') {
        return excerpt(parsed.message)
      }
    }
  } catch {
    // 非 JSON 响应体按原文截断，便于定位网关或代理错误
  }

  return excerpt(body)
}

export function toHttpError(status: number, body: string): AgentError {
  const detail = extractServerMessage(body)
  const suffix = detail ? `：${detail}` : ''

  if (status === 401) {
    return new AgentError('unauthorized', 'API Key 无效或已过期（401），请在设置中检查 Key。', status)
  }
  if (status === 403) {
    return new AgentError('forbidden', `该 Key 无权访问此端点（403）${suffix}`, status)
  }
  if (status === 404) {
    return new AgentError(
      'not-found',
      `接口地址不存在（404）。Base URL 应形如 https://host/v1，且不要包含 /responses 或 /chat/completions${suffix}`,
      status,
    )
  }
  if (status === 429) {
    return new AgentError('rate-limited', '请求过于频繁或额度不足（429），请稍后再试。', status)
  }
  if (status === 400) {
    return new AgentError('bad-request', `请求被拒绝（400）${suffix}`, status)
  }
  if (status >= 500) {
    return new AgentError('server', `服务端错误（${status}）${suffix}`, status)
  }
  return new AgentError('bad-response', `请求失败（HTTP ${status}）${suffix}`, status)
}

export function toNetworkError(error: unknown): AgentError {
  if (isAgentError(error)) {
    return error
  }

  const message = error instanceof Error ? error.message : String(error)
  const name = error instanceof Error ? error.name : ''

  if (name === 'AbortError' || /abort|cancel/i.test(message)) {
    return new AgentError('aborted', '请求已取消')
  }
  if (/timeout|timed out/i.test(message)) {
    return new AgentError('timeout', '请求超时，请稍后再试。')
  }
  return new AgentError('network', '网络请求失败，请检查网络连接或代理设置。')
}

export function createAbortedError(): AgentError {
  return new AgentError('aborted', '请求已取消')
}
