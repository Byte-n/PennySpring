const fs = require('node:fs');
const path = require('node:path');
const {
  DOC_COMPONENTS_DIR,
  GENERATED_DOC_MARKER,
  GENERATED_SOURCE_MARKER,
  PACKAGE_ROOT,
  PREVIEWS_ROOT,
  fail,
  toDisplayPath,
} = require('./preview-sync/shared.cjs');
const { scanPreviews } = require('./preview-sync/scan.cjs');
const { buildExpectedFiles } = require('./preview-sync/render.cjs');

function walkFiles(dir) {
  if (!fs.existsSync(dir)) {
    return [];
  }

  const files = [];

  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const entryPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      files.push(...walkFiles(entryPath));
    } else if (entry.isFile()) {
      files.push(entryPath);
    }
  }

  return files.sort();
}

function readFileIfExists(filePath) {
  return fs.existsSync(filePath) ? fs.readFileSync(filePath, 'utf8') : undefined;
}

function collectGeneratedFileIssues(expected, filePaths, marker, label) {
  const issues = [];

  for (const filePath of filePaths) {
    if (expected.has(filePath)) {
      continue;
    }

    const content = fs.readFileSync(filePath, 'utf8');

    if (content.includes(marker)) {
      issues.push(`删除未在扫描结果中的生成文件：${toDisplayPath(filePath)}`);
    } else {
      issues.push(`${label}下存在未纳管文件：${toDisplayPath(filePath)}`);
    }
  }

  return issues;
}

function collectStaleFiles(expected) {
  const docFiles = walkFiles(DOC_COMPONENTS_DIR).filter(filePath =>
    filePath.endsWith('.mdx'),
  );
  const demoFiles = walkFiles(PREVIEWS_ROOT).filter(filePath =>
    filePath.endsWith('/demos/index.ts'),
  );

  return [
    ...collectGeneratedFileIssues(
      expected,
      docFiles,
      GENERATED_DOC_MARKER,
      'docs/components ',
    ),
    ...collectGeneratedFileIssues(
      expected,
      demoFiles,
      GENERATED_SOURCE_MARKER,
      'examples/previews ',
    ),
  ];
}

function checkPreviewsSync() {
  const sections = scanPreviews();
  const expected = buildExpectedFiles(sections);
  const issues = [];

  for (const [filePath, expectedContent] of expected) {
    const actualContent = readFileIfExists(filePath);
    const relativePath = toDisplayPath(filePath);

    if (actualContent === undefined) {
      issues.push(`缺少生成文件：${relativePath}`);
    } else if (actualContent !== expectedContent) {
      issues.push(`生成文件已过期：${relativePath}`);
    }
  }

  issues.push(...collectStaleFiles(expected));
  return issues;
}

function removeStaleGeneratedFiles(staleIssues) {
  for (const issue of staleIssues) {
    if (!issue.startsWith('删除未在扫描结果中的生成文件：')) {
      fail(issue);
    }

    const relativePath = issue.slice(
      '删除未在扫描结果中的生成文件：'.length,
    );
    fs.rmSync(path.join(PACKAGE_ROOT, relativePath));
  }
}

function writePreviewsSync() {
  const sections = scanPreviews();
  const expected = buildExpectedFiles(sections);
  const staleIssues = collectStaleFiles(expected);

  removeStaleGeneratedFiles(staleIssues);

  let written = 0;

  for (const [filePath, content] of expected) {
    if (readFileIfExists(filePath) === content) {
      continue;
    }

    fs.mkdirSync(path.dirname(filePath), { recursive: true });
    fs.writeFileSync(filePath, content);
    written += 1;
  }

  return { written, removed: staleIssues.length };
}

function runCli(args) {
  const unknownArgs = args.filter(arg => arg !== '--check');

  if (unknownArgs.length > 0) {
    fail(`未知参数：${unknownArgs.join(' ')}`);
  }

  if (args.includes('--check')) {
    const issues = checkPreviewsSync();

    if (issues.length > 0) {
      process.stderr.write(
        `预览注册产物与 previewMeta 不同步：\n${issues
          .map(issue => `- ${issue}`)
          .join('\n')}\n运行 yarn workspace @pennyspring/ui previews:sync 后重试。\n`,
      );
      process.exitCode = 1;
      return;
    }

    process.stdout.write('预览注册产物与 previewMeta 已同步。\n');
    return;
  }

  const result = writePreviewsSync();

  process.stdout.write(
    `预览注册已同步：更新 ${result.written} 个文件，删除 ${result.removed} 个文件。\n`,
  );
}

if (require.main === module) {
  try {
    runCli(process.argv.slice(2));
  } catch (error) {
    process.stderr.write(
      `${error instanceof Error ? error.message : String(error)}\n`,
    );
    process.exitCode = 1;
  }
}

module.exports = {
  checkPreviewsSync,
  scanPreviews,
  writePreviewsSync,
};
