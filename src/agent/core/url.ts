const TRAILING_SLASHES = /\/+$/;
const CHAT_COMPLETIONS_SUFFIX = /\/chat\/completions\/?$/i;
const BASE_URL_PATTERN = /^https?:\/\/[^\s/]+(\/\S*)?$/i;

export function normalizeBaseUrl(raw: string): string {
  return raw
    .trim()
    .replace(TRAILING_SLASHES, '')
    .replace(CHAT_COMPLETIONS_SUFFIX, '')
    .replace(TRAILING_SLASHES, '');
}

export function isValidBaseUrl(raw: string): boolean {
  return BASE_URL_PATTERN.test(normalizeBaseUrl(raw));
}

export function buildChatCompletionsUrl(baseUrl: string): string {
  return `${normalizeBaseUrl(baseUrl)}/chat/completions`;
}

export function buildModelsUrl(baseUrl: string): string {
  return `${normalizeBaseUrl(baseUrl)}/models`;
}
