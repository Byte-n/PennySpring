type PreviewSourceResolver = (previewId: string) => string | undefined;
interface PreviewDocIntro {
  title: string;
  description: string;
}
type PreviewIntroResolver = (previewId: string) => PreviewDocIntro | undefined;

declare const __PENNYSPRING_UI_PREVIEW_SOURCES__:
  | Record<string, string>
  | undefined;

const PREVIEW_DOC_ID_PATTERN = /<PreviewDoc\s+id=(?:"([^"]+)"|'([^']+)')\s*\/?>/;
const IMPORT_STATEMENT_PATTERN = /import\s+[\s\S]*?\s+from.*?\n/g;
const EXPORT_DEFAULT_FUNCTION_PATTERN = /export\s+default\s+function\s+/g;
const EXPORT_DEFAULT_STATEMENT_PATTERN =
  /export\s+default\s+[A-Z][A-Za-z0-9_]*\s*;?/g;
const EXPORT_NAMED_PATTERN = /export\s+/g;
const DEFAULT_EXPORTED_FUNCTION_PATTERN =
  /export\s+default\s+function\s+([A-Z][A-Za-z0-9_]*)\s*\(/;
const DEFAULT_EXPORTED_IDENTIFIER_PATTERN =
  /export\s+default\s+([A-Z][A-Za-z0-9_]*)\s*;/;
const JSX_EXPRESSION_PATTERN = /^\s*</;
const MISSING_DEFAULT_EXPORT_ERROR =
  'Preview live code requires a default exported component.';

function getDefinedPreviewSource(previewId: string): string | undefined {
  if (typeof __PENNYSPRING_UI_PREVIEW_SOURCES__ === 'undefined') {
    return undefined;
  }

  return __PENNYSPRING_UI_PREVIEW_SOURCES__?.[previewId];
}

export function resolvePreviewDocLiveCode(
  code?: string,
  resolvePreviewSource: PreviewSourceResolver = getDefinedPreviewSource,
): string | undefined {
  const normalizedCode = code?.replace(/\n$/, '');
  const previewIdMatch = normalizedCode?.match(PREVIEW_DOC_ID_PATTERN);
  const previewId = previewIdMatch?.[1] ?? previewIdMatch?.[2];

  if (!previewId) {
    return normalizedCode;
  }

  return resolvePreviewSource(previewId)?.replace(/\n$/, '') ?? normalizedCode;
}

export function pruneLiveCode(code?: string): string {
  return (code ?? '')
    .replace(/\n$/, '')
    .replace(IMPORT_STATEMENT_PATTERN, '')
    .replace(EXPORT_DEFAULT_FUNCTION_PATTERN, 'function ')
    .replace(EXPORT_DEFAULT_STATEMENT_PATTERN, '')
    .replace(EXPORT_NAMED_PATTERN, '')
    .trimEnd()
    .trimStart();
}

export function resolveLiveExecutableCode(
  code?: string,
  resolvePreviewSource: PreviewSourceResolver = getDefinedPreviewSource,
): string {
  const displayCode = resolvePreviewDocLiveCode(code, resolvePreviewSource);
  const componentFunctionName =
    displayCode?.match(DEFAULT_EXPORTED_FUNCTION_PATTERN)?.[1] ??
    displayCode?.match(DEFAULT_EXPORTED_IDENTIFIER_PATTERN)?.[1];
  const executableCode = pruneLiveCode(displayCode);

  if (!componentFunctionName) {
    return JSX_EXPRESSION_PATTERN.test(executableCode)
      ? `render(${executableCode});`
      : `throw new Error(${JSON.stringify(MISSING_DEFAULT_EXPORT_ERROR)});`;
  }

  return `${executableCode}\n\nrender(<${componentFunctionName} />);`;
}

export function getPreviewDocIntro(
  previewId: string,
  resolvePreviewIntro: PreviewIntroResolver,
): PreviewDocIntro | undefined {
  return resolvePreviewIntro(previewId);
}
