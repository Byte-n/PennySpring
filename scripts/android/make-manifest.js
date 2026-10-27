#!/usr/bin/env node

const { createHash } = require('node:crypto')
const { createReadStream } = require('node:fs')
const { mkdir, readFile, stat, writeFile } = require('node:fs/promises')
const path = require('node:path')

const MANIFEST_FORMAT_VERSION = 1

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

async function main() {
  const options = parseArguments(process.argv.slice(2))
  const apkPath = options.apk
  const versionName = options.version
  const versionCode = Number(options['version-code'])
  const downloadUrl = options.url
  const outputPath = options.out

  if (!apkPath || !versionName || !downloadUrl || !outputPath) {
    throw new Error(
      '用法: make-manifest.js --apk <path> --version <x.y.z> --version-code <n> --url <download-url> --out <path> [--notes-file <path>]'
    )
  }
  if (!Number.isInteger(versionCode) || versionCode < 1) {
    throw new Error(`--version-code 必须是正整数，收到: ${options['version-code']}`)
  }

  const [fileStat, sha256] = await Promise.all([stat(apkPath), sha256OfFile(apkPath)])
  const notes = options['notes-file'] ? (await readFile(options['notes-file'], 'utf8')).trim() : ''

  const manifest = {
    formatVersion: MANIFEST_FORMAT_VERSION,
    versionName,
    versionCode,
    publishedAt: new Date().toISOString(),
    notes,
    apk: {
      url: downloadUrl,
      size: fileStat.size,
      sha256
    }
  }

  await mkdir(path.dirname(outputPath), { recursive: true })
  await writeFile(outputPath, `${JSON.stringify(manifest, null, 2)}\n`, 'utf8')
  process.stdout.write(`更新清单已生成: ${outputPath}\n`)
}

main().catch(error => {
  process.stderr.write(`生成更新清单失败: ${getErrorMessage(error)}\n`)
  process.exitCode = 1
})
