#!/usr/bin/env node

const { spawn, spawnSync } = require('node:child_process')
const { access } = require('node:fs/promises')
const path = require('node:path')
const { readVersionState } = require('./android/version')

const PROJECT_ROOT = path.resolve(__dirname, '..')
const ANDROID_DIR = path.join(PROJECT_ROOT, 'android')
const APK_OUTPUT_FILE = path.join(
  ANDROID_DIR,
  'app',
  'build',
  'outputs',
  'apk',
  'release',
  'app-release.apk'
)
const APK_BUILD_TARGET = {
  gradleTask: 'assembleRelease',
  outputFile: APK_OUTPUT_FILE
}

/**
 * @param {unknown} error
 * @returns {string}
 */
function getErrorMessage(error) {
  return error instanceof Error ? error.message : '未知错误'
}

/** @returns {Promise<void>} */
async function checkBuildEnvironment() {
  const missing = []
  if (Number(process.versions.node.split('.')[0]) < 22) missing.push('Node.js 22 或更高版本')
  if (!process.env.ANDROID_HOME && !process.env.ANDROID_SDK_ROOT) missing.push('ANDROID_HOME 或 ANDROID_SDK_ROOT')
  const javaCheck = spawnSync('java', ['-version'], { encoding: 'utf8' })
  const javaVersion = `${javaCheck.stderr || ''}${javaCheck.stdout || ''}`
  if (javaCheck.error || !/version "17\./.test(javaVersion)) missing.push('Java 17（请安装并确保 java 可执行）')

  for (const [label, file] of [
    ['Android SDK', path.join(process.env.ANDROID_HOME || process.env.ANDROID_SDK_ROOT || '', 'platform-tools')],
    ['Gradle wrapper', path.join(ANDROID_DIR, 'gradlew')],
    ['项目依赖', path.join(PROJECT_ROOT, 'node_modules')]
  ]) {
    try {
      await access(file)
    } catch {
      missing.push(label)
    }
  }

  if (missing.length > 0) {
    throw new Error(`构建环境不完整，请先处理以下项目：\n- ${missing.join('\n- ')}`)
  }
}

/**
 * @param {{ gradleTask: string, outputFile: string }} buildTarget
 * @returns {Promise<void>}
 */
function buildRelease(buildTarget) {
  return new Promise((resolve, reject) => {
    const gradle = spawn(path.join(ANDROID_DIR, 'gradlew'), [buildTarget.gradleTask], {
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
  await checkBuildEnvironment()
  process.stdout.write('构建环境检查通过。\n')
  const currentVersion = await readVersionState()
  process.stdout.write(`当前版本 ${currentVersion.versionName} (${currentVersion.versionCode})。\n`)

  if (isDryRun) {
    process.stdout.write('Dry run 完成，未执行构建。\n')
    return
  }

  process.stdout.write('开始构建 Android Release APK...\n')
  await buildRelease(APK_BUILD_TARGET)
  process.stdout.write(`构建完成: ${APK_BUILD_TARGET.outputFile}\n`)
}

main().catch((error) => {
  process.stderr.write(`发布失败: ${getErrorMessage(error)}\n`)
  process.exitCode = 1
})
