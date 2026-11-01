#!/usr/bin/env node

const { readFile, writeFile } = require('node:fs/promises');
const path = require('node:path');

const PROJECT_ROOT = path.resolve(__dirname, '..', '..');
const VERSION_FILE = path.join(PROJECT_ROOT, 'version.json');

const VERSION_NAME_PATTERN = /^\d+\.\d+\.\d+$/;
const RELEASE_MARKER_PATTERN = /^update:\s*v?(\d+\.\d+\.\d+)\b/;

/**
 * @param {unknown} error
 * @returns {string}
 */
function getErrorMessage(error) {
  return error instanceof Error ? error.message : '未知错误';
}

/**
 * 版本号 → versionCode：major * 10000 + minor * 100 + patch。
 * Android 只要求 versionCode 单调递增，用公式推导可保证同一个版本名
 * 在本地构建与 CI 构建中得到同一个 code，避免同版本出现两种产物。
 * @param {string} versionName
 * @returns {number}
 */
function toVersionCode(versionName) {
  assertVersionName(versionName);
  const [major, minor, patch] = versionName.split('.').map(Number);
  return major * 10000 + minor * 100 + patch;
}

/**
 * @param {string} versionName
 * @returns {string}
 */
function assertVersionName(versionName) {
  if (!VERSION_NAME_PATTERN.test(versionName)) {
    throw new Error(
      `版本号必须使用 major.minor.patch 格式，收到: ${versionName || '(空)'}`,
    );
  }
  if (versionName.includes('4')) {
    throw new Error(`版本号不能包含数字 4，收到: ${versionName}`);
  }
  return versionName;
}

/**
 * @param {string} currentName
 * @param {'major' | 'minor' | 'patch'} releaseType
 * @returns {string}
 */
function getNextVersionName(currentName, releaseType) {
  const [major, minor, patch] = assertVersionName(currentName)
    .split('.')
    .map(Number);
  const increment = {
    major: [major + 1, 0, 0],
    minor: [major, minor + 1, 0],
    patch: [major, minor, patch + 1],
  }[releaseType];

  if (!increment) {
    throw new Error(`未知的发布类型: ${releaseType}`);
  }

  let nextVersionName = increment.join('.');
  while (nextVersionName.includes('4')) {
    const [nextMajor, nextMinor, nextPatch] = nextVersionName
      .split('.')
      .map(Number);
    nextVersionName = {
      major: [nextMajor + 1, 0, 0],
      minor: [nextMajor, nextMinor + 1, 0],
      patch: [nextMajor, nextMinor, nextPatch + 1],
    }[releaseType].join('.');
  }

  return nextVersionName;
}

/**
 * 从提交信息首行提取版本号，约定形如 `update: v1.0.3`。
 * @param {string} message
 * @returns {string | null}
 */
function parseReleaseMarker(message) {
  const firstLine = String(message).split(/\r?\n/, 1)[0].trim();
  const matched = RELEASE_MARKER_PATTERN.exec(firstLine);
  return matched ? matched[1] : null;
}

/**
 * @param {string} content
 * @returns {{ versionName: string, versionCode: number }}
 */
function parseVersionState(content) {
  let versionState;
  try {
    versionState = JSON.parse(content);
  } catch {
    throw new Error('version.json 必须是有效的 JSON');
  }

  const versionName = assertVersionName(versionState?.versionName);
  const versionCode = versionState?.versionCode;
  const expectedVersionCode = toVersionCode(versionName);
  if (versionCode !== expectedVersionCode) {
    throw new Error(
      `version.json 的 versionCode 必须为 ${expectedVersionCode}，收到: ${versionCode ?? '(空)'}`,
    );
  }

  return { versionName, versionCode };
}

/** @returns {Promise<{ versionName: string, versionCode: number }>} */
async function readVersionState() {
  return parseVersionState(await readFile(VERSION_FILE, 'utf8'));
}

/** @param {string} versionName @returns {Promise<{ versionName: string, versionCode: number }>} */
async function writeVersionState(versionName) {
  const name = assertVersionName(String(versionName).trim());
  const versionCode = toVersionCode(name);
  const versionState = { versionCode, versionName: name };

  await writeFile(
    VERSION_FILE,
    `${JSON.stringify(versionState, null, 2)}\n`,
    'utf8',
  );

  return { versionName: name, versionCode };
}

/** @returns {Promise<string>} */
async function readStdin() {
  let content = '';
  process.stdin.setEncoding('utf8');
  for await (const chunk of process.stdin) {
    content += chunk;
  }
  return content;
}

async function main() {
  const [command = 'print', ...argumentsList] = process.argv.slice(2);

  if (command === 'print') {
    const state = await readVersionState();
    process.stdout.write(`${JSON.stringify(state)}\n`);
    return;
  }

  if (command === 'set') {
    const [versionName, ...extraArguments] = argumentsList;
    if (!versionName || extraArguments.length > 0) {
      throw new Error('用法: version.js set <x.y.z>');
    }
    const state = await writeVersionState(versionName);
    process.stdout.write(
      `版本已写入 ${state.versionName} (${state.versionCode})\n`,
    );
    return;
  }

  if (command === 'assert') {
    const state = await readVersionState();
    if (state.versionName !== argumentsList[0]) {
      throw new Error(
        `仓库版本 ${state.versionName} 与期望版本 ${argumentsList[0]} 不一致，请先提交版本变更`,
      );
    }
    process.stdout.write(`${JSON.stringify(state)}\n`);
    return;
  }

  if (command === 'from-commit') {
    const versionName = parseReleaseMarker(await readStdin());
    if (!versionName) {
      throw new Error('提交信息首行缺少发布标记，应形如: update: v1.0.3');
    }
    process.stdout.write(`${versionName}\n`);
    return;
  }

  throw new Error(
    `未知命令: ${command}\n用法: version.js [print|set <x.y.z>|assert <x.y.z>|from-commit]`,
  );
}

if (require.main === module) {
  main().catch(error => {
    process.stderr.write(`版本处理失败: ${getErrorMessage(error)}\n`);
    process.exitCode = 1;
  });
}

module.exports = {
  assertVersionName,
  getNextVersionName,
  parseReleaseMarker,
  readVersionState,
  toVersionCode,
  writeVersionState,
};
