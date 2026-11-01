#!/usr/bin/env node

const {
  cp,
  mkdir,
  readdir,
  readFile,
  rm,
  writeFile,
} = require('node:fs/promises');
const path = require('node:path');

const PROJECT_ROOT = path.resolve(__dirname, '..');
const CLAUDE_DIR = path.join(PROJECT_ROOT, '.claude');
const CODEX_DIR = path.join(PROJECT_ROOT, '.codex');
const CLAUDE_SKILLS_DIR = path.join(CLAUDE_DIR, 'skills');
const CLAUDE_AGENTS_DIR = path.join(CLAUDE_DIR, 'agents');
const CODEX_SKILLS_DIR = path.join(CODEX_DIR, 'skills');
const CODEX_AGENTS_DIR = path.join(CODEX_DIR, 'agents');

/**
 * @param {unknown} error
 * @returns {string}
 */
function getErrorMessage(error) {
  if (error instanceof Error) {
    return error.message;
  }

  return 'Unexpected error';
}

/**
 * @param {string} value
 * @returns {string}
 */
function escapeTomlString(value) {
  return value.replaceAll('\\', '\\\\').replaceAll('"', '\\"');
}

/**
 * @param {string} value
 * @returns {string}
 */
function normalizeNewlines(value) {
  return value.replaceAll('\r\n', '\n');
}

/**
 * @param {string} fileContent
 * @returns {{ frontmatter: Record<string, string>, body: string }}
 */
function parseMarkdownAgent(fileContent) {
  const normalizedContent = normalizeNewlines(fileContent);

  if (!normalizedContent.startsWith('---\n')) {
    throw new Error('Agent file is missing frontmatter');
  }

  const closingFenceIndex = normalizedContent.indexOf('\n---\n', 4);

  if (closingFenceIndex === -1) {
    throw new Error('Agent file frontmatter is not closed');
  }

  const rawFrontmatter = normalizedContent.slice(4, closingFenceIndex);
  const body = normalizedContent
    .slice(closingFenceIndex + '\n---\n'.length)
    .trim();
  const frontmatterEntries = rawFrontmatter
    .split('\n')
    .map(line => line.trim())
    .filter(Boolean);

  /** @type {Record<string, string>} */
  const frontmatter = {};

  for (const entry of frontmatterEntries) {
    const separatorIndex = entry.indexOf(':');

    if (separatorIndex === -1) {
      continue;
    }

    const key = entry.slice(0, separatorIndex).trim();
    const value = entry.slice(separatorIndex + 1).trim();
    frontmatter[key] = value;
  }

  return {
    frontmatter,
    body,
  };
}

/**
 * @param {string} rawValue
 * @returns {string}
 */
function stripYamlQuotes(rawValue) {
  if (
    (rawValue.startsWith('"') && rawValue.endsWith('"')) ||
    (rawValue.startsWith("'") && rawValue.endsWith("'"))
  ) {
    return rawValue.slice(1, -1);
  }

  return rawValue;
}

/**
 * @param {string} fileName
 * @param {string} fileContent
 * @returns {{ outputFileName: string, tomlContent: string }}
 */
function convertMarkdownAgentToToml(fileName, fileContent) {
  const { frontmatter, body } = parseMarkdownAgent(fileContent);
  const name = stripYamlQuotes(
    frontmatter.name || path.basename(fileName, '.md'),
  );
  const description = stripYamlQuotes(frontmatter.description || '');

  if (!name) {
    throw new Error(`Agent file ${fileName} is missing a name`);
  }

  const tomlContent = [
    `name = "${escapeTomlString(name)}"`,
    `description = "${escapeTomlString(description)}"`,
    'developer_instructions = """',
    body,
    '"""',
    '',
  ].join('\n');

  return {
    outputFileName: `${path.basename(fileName, '.md')}.toml`,
    tomlContent,
  };
}

/**
 * @param {string} sourcePath
 * @param {string} destinationPath
 * @returns {Promise<void>}
 */
async function replaceDirectory(sourcePath, destinationPath) {
  await rm(destinationPath, { recursive: true, force: true });
  await cp(sourcePath, destinationPath, {
    recursive: true,
    dereference: true,
    force: true,
  });
}

async function syncSkills() {
  await replaceDirectory(CLAUDE_SKILLS_DIR, CODEX_SKILLS_DIR);
  console.log('Copied .claude/skills -> .codex/skills');
}

async function syncAgents() {
  await rm(CODEX_AGENTS_DIR, { recursive: true, force: true });
  await mkdir(CODEX_AGENTS_DIR, { recursive: true });

  const entries = await readdir(CLAUDE_AGENTS_DIR, { withFileTypes: true });
  const markdownFiles = entries
    .filter(entry => entry.isFile() && entry.name.endsWith('.md'))
    .map(entry => entry.name)
    .sort();

  for (const fileName of markdownFiles) {
    const sourcePath = path.join(CLAUDE_AGENTS_DIR, fileName);
    const fileContent = await readFile(sourcePath, 'utf8');
    const { outputFileName, tomlContent } = convertMarkdownAgentToToml(
      fileName,
      fileContent,
    );
    const destinationPath = path.join(CODEX_AGENTS_DIR, outputFileName);

    await writeFile(destinationPath, tomlContent, 'utf8');
    console.log(
      `Converted .claude/agents/${fileName} -> .codex/agents/${outputFileName}`,
    );
  }
}

async function main() {
  await mkdir(CODEX_DIR, { recursive: true });
  await syncSkills();
  await syncAgents();
  console.log('Codex initialization complete.');
}

main().catch(error => {
  console.error(getErrorMessage(error));
  process.exitCode = 1;
});
