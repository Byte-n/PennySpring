export {};

interface DirentLike {
  isDirectory: () => boolean;
  isFile: () => boolean;
  name: string;
}

const fs = require('fs') as {
  readFileSync: (filePath: string, encoding: string) => string;
  readdirSync: (
    directory: string,
    options: { withFileTypes: true },
  ) => DirentLike[];
};
const path = require('path') as {
  join: (...paths: string[]) => string;
  relative: (from: string, to: string) => string;
};

const PREVIEW_ROOT = 'packages/pennyspring-ui/examples/previews';
const ALLOWED_DEMO_IMPORTS = new Set([
  '@pennyspring/theme',
  '@pennyspring/ui',
  'phosphor-react-native',
  'react',
  'react-native',
]);
const DEMO_FILE_PATTERN = /\/demos\/.*\.tsx$/;
const PREVIEW_SOURCE_FILE_PATTERN = /(?:\/demos\/.*|\/index)\.tsx$/;
const IMPORT_SOURCE_PATTERN =
  /import(?:\s+type)?[\s\S]*?\sfrom\s['"]([^'"]+)['"];?/g;
const EXPORT_DEFAULT_PATTERN = /export\s+default\b/;

function collectPreviewDemoFiles(directory: string): string[] {
  const entries = fs.readdirSync(directory, { withFileTypes: true });

  return entries.flatMap(entry => {
    const entryPath = path.join(directory, entry.name);

    if (entry.isDirectory()) {
      return collectPreviewDemoFiles(entryPath);
    }

    if (entry.isFile() && DEMO_FILE_PATTERN.test(entryPath)) {
      return [entryPath];
    }

    return [];
  });
}

function collectPreviewSourceFiles(directory: string): string[] {
  const entries = fs.readdirSync(directory, { withFileTypes: true });

  return entries.flatMap(entry => {
    const entryPath = path.join(directory, entry.name);

    if (entry.isDirectory()) {
      return collectPreviewSourceFiles(entryPath);
    }

    if (entry.isFile() && PREVIEW_SOURCE_FILE_PATTERN.test(entryPath)) {
      return [entryPath];
    }

    return [];
  });
}

describe('preview demo imports', () => {
  it('only imports from packages available in live preview scope', () => {
    const violations = collectPreviewDemoFiles(PREVIEW_ROOT).flatMap(file => {
      const source = fs.readFileSync(file, 'utf8');
      const imports = Array.from(source.matchAll(IMPORT_SOURCE_PATTERN));

      return imports
        .map(match => match[1] ?? '')
        .filter(importSource => !ALLOWED_DEMO_IMPORTS.has(importSource))
        .map(importSource => ({
          file: path.relative(PREVIEW_ROOT, file),
          importSource,
        }));
    });

    expect(violations).toEqual([]);
  });

  it('requires every live preview source to provide a default export', () => {
    const violations = collectPreviewSourceFiles(PREVIEW_ROOT)
      .filter(file => !EXPORT_DEFAULT_PATTERN.test(fs.readFileSync(file, 'utf8')))
      .map(file => path.relative(PREVIEW_ROOT, file));

    expect(violations).toEqual([]);
  });
});
