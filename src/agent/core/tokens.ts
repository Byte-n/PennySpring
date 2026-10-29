const CJK_PATTERN = /[\u2E80-\u9FFF\uF900-\uFAFF\uFF00-\uFFEF]/g;
const LATIN_CHARS_PER_TOKEN = 4;

export function estimateTokens(text: string): number {
  if (!text) {
    return 0;
  }
  const cjkCount = (text.match(CJK_PATTERN) ?? []).length;
  const latinCount = text.length - cjkCount;
  return Math.ceil(cjkCount + latinCount / LATIN_CHARS_PER_TOKEN);
}
