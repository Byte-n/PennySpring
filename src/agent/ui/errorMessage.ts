import { APICallError } from 'ai';

import { isAgentError, toHttpError } from '../core/protocol/errors';

export function getErrorMessage(error: unknown): string {
  if (isAgentError(error)) {
    return error.message;
  }
  if (APICallError.isInstance(error) && error.statusCode) {
    return toHttpError(error.statusCode, error.responseBody ?? '').message;
  }
  if (error instanceof Error && error.message.trim()) {
    return error.message;
  }
  return '回答失败，请稍后再试。';
}

export function isAbortedError(error: unknown): boolean {
  if (isAgentError(error) && error.code === 'aborted') {
    return true;
  }
  return error instanceof Error && error.name === 'AbortError';
}
