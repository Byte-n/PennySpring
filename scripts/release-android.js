#!/usr/bin/env node

const { spawn } = require('node:child_process')
const { readFile, writeFile } = require('node:fs/promises')
const { writeFileSync } = require('node:fs')
const path = require('node:path')
const inquirer = require('inquirer')

const PROJECT_ROOT = path.resolve(__dirname, '..')
const ANDROID_DIR = path.join(PROJECT_ROOT, 'android')
const VERSION_FILE = path.join(ANDROID_DIR, 'version.json')
const OUTPUT_FILE = path.join(
  ANDROID_DIR,
  'app',
  'build',
  'outputs',
  'bundle',
  'release',
  'app-release.aab'
)

/**
 * @param {unknown} error
 * @returns {string}
 */
function getErrorMessage(error) {
  return error instanceof Error ? error.message : '未知错误'
}

/**
 * @param {string} content
 * @returns {{ versionCode: number, versionName: string }}
 */
function parseVersion(content) {
  const version = JSON.parse(content)
  const isObject = typeof version === 'object' && version !== null
  const isValidVersionCode = isObject && Number.isInteger(version.versionCode) && version.versionCode > 0
  const isValidVersionName = isObject && /^\d+\.\d+\.\d+$/.test(version.versionName)

  if (!isValidVersionCode || !isValidVersionName) {
    throw new Error('android/version.json 必须包含正整数 versionCode 和 major.minor.patch 格式的 versionName')
  }

  return version
}

/**
 * @param {{ versionCode: number, versionName: string }} currentVersion
 * @param {'major' | 'minor' | 'patch'} releaseType
 * @returns {{ versionCode: number, versionName: string }}
 */
function getNextVersion(currentVersion, releaseType) {
  const [major, minor, patch] = currentVersion.versionName.split('.').map(Number)
  const versionParts = {
    major: [major + 1, 0, 0],
    minor: [major, minor + 1, 0],
    patch: [major, minor, patch + 1]
  }

  return {
    versionCode: currentVersion.versionCode + 1,
    versionName: versionParts[releaseType].join('.')
  }
}

/**
 * @returns {Promise<void>}
 */
function buildReleaseBundle() {
  return new Promise((resolve, reject) => {
    const gradle = spawn(path.join(ANDROID_DIR, 'gradlew'), ['bundleRelease'], {
      cwd: ANDROID_DIR,
      stdio: 'inherit'
    })

    gradle.once('error', reject)
    gradle.once('close', (exitCode) => {
      if (exitCode === 0) {
        resolve()
        return
      }

      reject(new Error(`Gradle 构建失败，退出码: ${exitCode ?? '未知'}`))
    })
  })
}

async function main() {
  const unsupportedArgument = process.argv.slice(2).find((argument) => argument !== '--dry-run')
  if (unsupportedArgument) {
    throw new Error(`不支持的参数: ${unsupportedArgument}\n用法: yarn release:android [--dry-run]`)
  }

  const isDryRun = process.argv.includes('--dry-run')
  const originalContent = await readFile(VERSION_FILE, 'utf8')
  const currentVersion = parseVersion(originalContent)
  const { releaseType } = await inquirer.prompt([
    {
      type: 'list',
      name: 'releaseType',
      message: `当前版本 ${currentVersion.versionName} (${currentVersion.versionCode})，请选择发布类型`,
      choices: [
        { name: 'Patch  缺陷修复', value: 'patch' },
        { name: 'Minor  功能更新', value: 'minor' },
        { name: 'Major  重大更新', value: 'major' },
        new inquirer.Separator(),
        { name: '取消', value: 'cancel' }
      ]
    }
  ])

  if (releaseType === 'cancel') {
    process.stdout.write('已取消发布。\n')
    return
  }

  const nextVersion = getNextVersion(currentVersion, releaseType)
  const { shouldRelease } = await inquirer.prompt([
    {
      type: 'confirm',
      name: 'shouldRelease',
      message: `确认发布 ${nextVersion.versionName} (${nextVersion.versionCode})？`,
      default: true
    }
  ])

  if (!shouldRelease) {
    process.stdout.write('已取消发布。\n')
    return
  }

  await writeFile(VERSION_FILE, `${JSON.stringify(nextVersion, null, 2)}\n`, 'utf8')

  const restoreOnSignal = () => {
    writeFileSync(VERSION_FILE, originalContent, 'utf8')
    process.exit(130)
  }

  process.once('SIGINT', restoreOnSignal)
  process.once('SIGTERM', restoreOnSignal)

  try {
    if (isDryRun) {
      process.stdout.write('Dry run 完成，未执行构建。\n')
      return
    }

    process.stdout.write('开始构建 Android Release AAB...\n')
    await buildReleaseBundle()
    process.stdout.write(`构建完成: ${OUTPUT_FILE}\n`)
  } catch (error) {
    await writeFile(VERSION_FILE, originalContent, 'utf8')
    throw error
  } finally {
    process.removeListener('SIGINT', restoreOnSignal)
    process.removeListener('SIGTERM', restoreOnSignal)

    if (isDryRun) {
      await writeFile(VERSION_FILE, originalContent, 'utf8')
    }
  }
}

main().catch((error) => {
  process.stderr.write(`发布失败: ${getErrorMessage(error)}\n`)
  process.exitCode = 1
})
