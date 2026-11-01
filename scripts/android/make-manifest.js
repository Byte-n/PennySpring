#!/usr/bin/env node

const { createHash } = require('node:crypto')
const { createReadStream } = require('node:fs')
const { mkdir, readFile, stat, writeFile } = require('node:fs/promises')
const path = require('node:path')

const MANIFEST_FORMAT_VERSION = 1
const APK_ABIS = ['arm64-v8a', 'armeabi-v7a']

/**
 * @param {unknown} error
 * @returns {string}
 */
function getErrorMessage(error) {
  return error instanceof Error ? error.message : '未知错误'
}

/**
 * @param {string[]} argv
 * @returns {Record<string, string>}
 */
function parseArguments(argv) {
  const options = {}
  for (let index = 0; index < argv.length; index += 1) {
    const key = argv[index]
    if (!key.startsWith('--')) {
      throw new Error(`无法识别的参数: ${key}`)
    }
    const value = argv[index + 1]
    if (value === undefined || value.startsWith('--')) {
      throw new Error(`参数 ${key} 缺少取值`)
    }
    options[key.slice(2)] = value
    index += 1
  }
  return options
}

/**
 * @param {string} filePath
 * @returns {Promise<string>}
 */
function sha256OfFile(filePath) {
  return new Promise((resolve, reject) => {
    const hash = createHash('sha256')
    const stream = createReadStream(filePath)
    stream.on('error', reject)
    stream.on('data', chunk => hash.update(chunk))
    stream.on('end', () => resolve(hash.digest('hex')))
  })
}

/**
 * @param {string} filePath
 * @param {string} downloadUrl
 * @returns {Promise<{url: string, size: number, sha256: string}>}
 */
async function createApkMetadata(filePath, downloadUrl) {
  const [fileStat, sha256] = await Promise.all([stat(filePath), sha256OfFile(filePath)])
  return { url: downloadUrl, size: fileStat.size, sha256 }
}

async function main() {
  const options = parseArguments(process.argv.slice(2))
  const apkPath = options.apk
  const versionName = options.version
  const versionCode = Number(options['version-code'])
  const downloadUrl = options.url
  const outputPath = options.out

  if (!apkPath || !versionName || !downloadUrl || !outputPath) {
    throw new Error(
      '用法: make-manifest.js --apk <path> --version <x.y.z> --version-code <n> --url <download-url> --out <path> [--apk-<abi> <path> --url-<abi> <download-url>] [--notes-file <path>]'
    )
  }
  if (!Number.isInteger(versionCode) || versionCode < 1) {
    throw new Error(`--version-code 必须是正整数，收到: ${options['version-code']}`)
  }

  const notes = options['notes-file'] ? (await readFile(options['notes-file'], 'utf8')).trim() : ''
  const publishedAt = new Date().toISOString()
  const apk = await createApkMetadata(apkPath, downloadUrl)
  const variantEntries = await Promise.all(
    APK_ABIS.map(async abi => {
      const variantPath = options[`apk-${abi}`]
      const variantUrl = options[`url-${abi}`]
      if ((variantPath && !variantUrl) || (!variantPath && variantUrl)) {
        throw new Error(`ABI ${abi} 的 APK 路径和下载地址必须同时提供`)
      }
      if (!variantPath) return null
      return [abi, await createApkMetadata(variantPath, variantUrl)]
    }),
  )
  const apks = Object.fromEntries(variantEntries.filter(entry => entry !== null))
  const manifest = {
    formatVersion: MANIFEST_FORMAT_VERSION,
    versionName,
    versionCode,
    publishedAt,
    notes,
    apk,
    ...(Object.keys(apks).length > 0 ? { apks } : {})
  }

  await mkdir(path.dirname(outputPath), { recursive: true })
  await writeFile(outputPath, `${JSON.stringify(manifest, null, 2)}\n`, 'utf8')
  process.stdout.write(`更新清单已生成: ${outputPath}\n`)
}

main().catch(error => {
  process.stderr.write(`生成更新清单失败: ${getErrorMessage(error)}\n`)
  process.exitCode = 1
})
