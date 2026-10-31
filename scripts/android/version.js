#!/usr/bin/env node

const { execFileSync, spawnSync } = require('node:child_process')
const { readFile, writeFile } = require('node:fs/promises')
const path = require('node:path')

const PROJECT_ROOT = path.resolve(__dirname, '..', '..')
const VERSION_FILE = path.join(PROJECT_ROOT, 'version')
const ANDROID_VERSION_FILE = path.join(PROJECT_ROOT, 'android', 'version.json')
const VERSION_RELATIVE_PATHS = ['version', 'android/version.json']

const VERSION_NAME_PATTERN = /^\d+\.\d+\.\d+$/
const RELEASE_MARKER_PATTERN = /^update:\s*v?(\d+\.\d+\.\d+)\b/

/**
 * @param {unknown} error
 * @returns {string}
 */
function getErrorMessage(error) {
  return error instanceof Error ? error.message : '未知错误'
}

/**
 * 版本号 → versionCode：major * 10000 + minor * 100 + patch。
 * Android 只要求 versionCode 单调递增，用公式推导可保证同一个版本名
 * 在本地构建与 CI 构建中得到同一个 code，避免同版本出现两种产物。
 * @param {string} versionName
 * @returns {number}
 */
function toVersionCode(versionName) {
  assertVersionName(versionName)
  const [major, minor, patch] = versionName.split('.').map(Number)
  return major * 10000 + minor * 100 + patch
}

/**
 * @param {string} versionName
 * @returns {string}
 */
function assertVersionName(versionName) {
  if (!VERSION_NAME_PATTERN.test(versionName)) {
    throw new Error(`版本号必须使用 major.minor.patch 格式，收到: ${versionName || '(空)'}`)
  }
  return versionName
}

/**
 * @param {string} currentName
 * @param {'major' | 'minor' | 'patch'} releaseType
 * @returns {string}
 */
function getNextVersionName(currentName, releaseType) {
  const [major, minor, patch] = assertVersionName(currentName).split('.').map(Number)
  const nextParts = {
    major: [major + 1, 0, 0],
    minor: [major, minor + 1, 0],
    patch: [major, minor, patch + 1]
  }[releaseType]

  if (!nextParts) {
    throw new Error(`未知的发布类型: ${releaseType}`)
  }

  return nextParts.join('.')
}

/**
 * 从提交信息首行提取版本号，约定形如 `update: v1.0.3`。
 * @param {string} message
 * @returns {string | null}
 */
function parseReleaseMarker(message) {
  const firstLine = String(message).split(/\r?\n/, 1)[0].trim()
  const matched = RELEASE_MARKER_PATTERN.exec(firstLine)
  return matched ? matched[1] : null
}

/**
 * @param {{ allowMismatch?: boolean }} [options]
 * @returns {Promise<{ versionName: string, versionCode: number }>}
 */
async function readVersionState(options = {}) {
  const [versionContent, androidContent] = await Promise.all([
    readFile(VERSION_FILE, 'utf8'),
    readFile(ANDROID_VERSION_FILE, 'utf8')
  ])
  const versionName = assertVersionName(versionContent.trim())
  const androidVersion = JSON.parse(androidContent)

  if (!options.allowMismatch && androidVersion.versionName !== versionName) {
    throw new Error(
      `版本号不一致：version=${versionName}，android/version.json=${androidVersion.versionName}。` +
        '请运行 yarn release:version <版本号> 对齐'
    )
  }

  return { versionName, versionCode: toVersionCode(versionName) }
}

/**
 * 写入 `version` 与 `android/version.json`，versionCode 由版本号推导。
 * @param {string} versionName
 * @returns {Promise<{ versionName: string, versionCode: number }>}
 */
async function writeVersionState(versionName) {
  const name = assertVersionName(String(versionName).trim())
  const versionCode = toVersionCode(name)
  const androidVersion = { versionCode, versionName: name }

  await writeFile(VERSION_FILE, `${name}\n`, 'utf8')
  await writeFile(ANDROID_VERSION_FILE, `${JSON.stringify(androidVersion, null, 2)}\n`, 'utf8')

  return { versionName: name, versionCode }
}

/**
 * @param {string[]} argumentsList
 * @returns {{ versionName: string, shouldCommit: boolean }}
 */
function parseSetArguments(argumentsList) {
  const versionArguments = argumentsList.filter(argument => argument !== '--commit')
  const shouldCommit = argumentsList.includes('--commit')

  if (
    versionArguments.length !== 1 ||
    argumentsList.some(argument => argument.startsWith('-') && argument !== '--commit')
  ) {
    throw new Error('用法: version.js set [--commit] <x.y.z>')
  }

  return { versionName: versionArguments[0], shouldCommit }
}

/** @returns {boolean} */
function hasVersionChanges() {
  const result = spawnSync('git', ['diff', '--quiet', 'HEAD', '--', ...VERSION_RELATIVE_PATHS], {
    cwd: PROJECT_ROOT,
    stdio: 'ignore'
  })

  if (result.error) throw result.error
  if (result.status === null || result.status > 1) {
    throw new Error('无法检查版本文件的 Git 状态')
  }

  return result.status === 1
}

/**
 * @param {string} versionName
 * @returns {boolean}
 */
function commitVersionState(versionName) {
  if (!hasVersionChanges()) return false

  execFileSync('git', ['add', '--', ...VERSION_RELATIVE_PATHS], {
    cwd: PROJECT_ROOT,
    stdio: 'inherit'
  })
  execFileSync('git', ['commit', '-m', `update: v${versionName}`, '--', ...VERSION_RELATIVE_PATHS], {
    cwd: PROJECT_ROOT,
    stdio: 'inherit'
  })
  return true
}

/** @returns {Promise<string>} */
async function readStdin() {
  let content = ''
  process.stdin.setEncoding('utf8')
  for await (const chunk of process.stdin) {
    content += chunk
  }
  return content
}

async function main() {
  const [command = 'print', ...argumentsList] = process.argv.slice(2)

  if (command === 'print') {
    const state = await readVersionState()
    process.stdout.write(`${JSON.stringify(state)}\n`)
    return
  }

  if (command === 'set') {
    const { versionName, shouldCommit } = parseSetArguments(argumentsList)
    const state = await writeVersionState(versionName)
    const committed = shouldCommit && commitVersionState(state.versionName)
    const commitMessage = shouldCommit
      ? committed
        ? `，已创建提交 update: v${state.versionName}`
        : '，版本文件未变化，未创建提交'
      : ''
    process.stdout.write(`版本已写入 ${state.versionName} (${state.versionCode})${commitMessage}\n`)
    return
  }

  if (command === 'assert') {
    const state = await readVersionState()
    if (state.versionName !== argumentsList[0]) {
      throw new Error(
        `仓库版本 ${state.versionName} 与期望版本 ${argumentsList[0]} 不一致，请先提交版本变更`
      )
    }
    process.stdout.write(`${JSON.stringify(state)}\n`)
    return
  }

  if (command === 'from-commit') {
    const versionName = parseReleaseMarker(await readStdin())
    if (!versionName) {
      throw new Error('提交信息首行缺少发布标记，应形如: update: v1.0.3')
    }
    process.stdout.write(`${versionName}\n`)
    return
  }

  throw new Error(`未知命令: ${command}\n用法: version.js [print|set [--commit] <x.y.z>|assert <x.y.z>|from-commit]`)
}

if (require.main === module) {
  main().catch(error => {
    process.stderr.write(`版本处理失败: ${getErrorMessage(error)}\n`)
    process.exitCode = 1
  })
}

module.exports = {
  assertVersionName,
  getNextVersionName,
  parseReleaseMarker,
  parseSetArguments,
  readVersionState,
  toVersionCode,
  writeVersionState
}
