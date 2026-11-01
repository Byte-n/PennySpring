export const API_BASE = '/api';

export function buildPath(group: string, method: string): string {
  return `${API_BASE}/${group}/${method}`;
}

export interface ServerError {
  error: string;
}
