#!/usr/bin/env node

const { spawn, spawnSync } = require('node:child_process')
const { access, readFile, writeFile } = require('node:fs/promises')
const { writeFileSync } = require('node:fs')
const path = require('node:path')
const inquirer = require('inquirer')

const PROJECT_ROOT = path.resolve(__dirname, '..')
const ANDROID_DIR = path.join(PROJECT_ROOT, 'android')
const VERSION_FILE = path.join(PROJECT_ROOT, 'version')
const ANDROID_VERSION_FILE = path.join(ANDROID_DIR, 'version.json')
const BUILD_TARGETS = {
  aab: {
    gradleTask: 'bundleRelease',
    outputFile: path.join(
      ANDROID_DIR,
      'app',
      'build',
      'outputs',
      'bundle',
      'release',
      'app-release.aab'
    )
  },
  apk: {
    gradleTask: 'assembleRelease',
    outputFile: path.join(
      ANDROID_DIR,
      'app',
      'build',
      'outputs',
      'apk',
      'release',
      'app-release.apk'
    )
  }
}

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
  const versionName = content.trim()
  if (!/^\d+\.\d+\.\d+$/.test(versionName)) {
    throw new Error('根目录 version 文件必须使用 major.minor.patch 格式')
  }
  return versionName
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
  const originalContent = await readFile(VERSION_FILE, 'utf8')
  const originalAndroidVersion = await readFile(ANDROID_VERSION_FILE, 'utf8')
  const currentVersionName = parseVersion(originalContent)
  const androidVersion = JSON.parse(originalAndroidVersion)
  const currentVersion = { versionCode: androidVersion.versionCode, versionName: currentVersionName }
  const { releaseType } = await inquirer.prompt([
    {
      type: 'list',
      name: 'releaseType',
      message: `当前版本 ${currentVersion.versionName} (${currentVersion.versionCode})，请选择发布类型`,
      choices: [
        { name: '不递增  使用当前版本', value: 'none' },
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

  const nextVersion = releaseType === 'none' ? currentVersion : getNextVersion(currentVersion, releaseType)
  const { artifactType, shouldRelease } = await inquirer.prompt([
    {
      type: 'list',
      name: 'artifactType',
      message: '请选择构建产物',
      choices: [
        { name: 'APK  直接安装或分发', value: 'apk' },
        { name: 'AAB  应用商店发布', value: 'aab' }
      ]
    },
    {
      type: 'confirm',
      name: 'shouldRelease',
      message: (answers) =>
        `确认发布 ${nextVersion.versionName} (${nextVersion.versionCode}) ${answers.artifactType.toUpperCase()}？`,
      default: true
    }
  ])

  if (!shouldRelease) {
    process.stdout.write('已取消发布。\n')
    return
  }

  await writeFile(VERSION_FILE, `${nextVersion.versionName}\n`, 'utf8')
  await writeFile(ANDROID_VERSION_FILE, `${JSON.stringify(nextVersion, null, 2)}\n`, 'utf8')

  const restoreOnSignal = () => {
    writeFileSync(VERSION_FILE, originalContent, 'utf8')
    writeFileSync(ANDROID_VERSION_FILE, originalAndroidVersion, 'utf8')
    process.exit(130)
  }

  process.once('SIGINT', restoreOnSignal)
  process.once('SIGTERM', restoreOnSignal)

  try {
    if (isDryRun) {
      process.stdout.write('Dry run 完成，未执行构建。\n')
      return
    }

    const buildTarget = BUILD_TARGETS[artifactType]
    process.stdout.write(`开始构建 Android Release ${artifactType.toUpperCase()}...\n`)
    await buildRelease(buildTarget)
    process.stdout.write(`构建完成: ${buildTarget.outputFile}\n`)
  } catch (error) {
    await writeFile(VERSION_FILE, originalContent, 'utf8')
    await writeFile(ANDROID_VERSION_FILE, originalAndroidVersion, 'utf8')
    throw error
  } finally {
    process.removeListener('SIGINT', restoreOnSignal)
    process.removeListener('SIGTERM', restoreOnSignal)

    if (isDryRun) {
      await writeFile(VERSION_FILE, originalContent, 'utf8')
      await writeFile(ANDROID_VERSION_FILE, originalAndroidVersion, 'utf8')
    }
  }
}

main().catch((error) => {
  process.stderr.write(`发布失败: ${getErrorMessage(error)}\n`)
  process.exitCode = 1
})
