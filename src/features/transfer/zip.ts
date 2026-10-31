import { unzipSync, zipSync } from 'fflate'

export type PackageFiles = Record<string, Uint8Array>

/**
 * React Native 没有 Worker 和 worker_threads，fflate 的异步接口会失败；
 * 备份包在 JS 线程同步压缩/解压，调用方保持 Promise 形状以兼容现有流程。
 */
export async function zipFiles(files: PackageFiles): Promise<Uint8Array> {
  return zipSync(files, { level: 6 })
}

export async function unzipFiles(data: Uint8Array): Promise<PackageFiles> {
  return unzipSync(data)
}
