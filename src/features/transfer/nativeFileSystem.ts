import { Dirs, FileSystem } from 'react-native-file-access'

import type { TransferFileSystem } from './types'

function toLocalPath(uri: string): string {
  if (uri.startsWith('file://')) {
    return decodeURIComponent(uri.slice('file://'.length))
  }
  if (uri.startsWith('/')) {
    return uri
  }
  throw new Error('暂不支持读取该文件，请重新选择备份文件')
}

function toFileUri(path: string): string {
  return path.startsWith('file://') ? path : `file://${encodeURI(path)}`
}

function sanitizeFileName(fileName: string): string {
  const safe = fileName.replace(/[^\w.-]/g, '_')
  return safe || `backup-${Date.now()}.psb`
}

async function writeBase64(path: string, base64: string): Promise<void> {
  await FileSystem.writeFile(path, base64, 'base64')
}

export const nativeTransferFileSystem: TransferFileSystem = {
  async readBase64(uri: string): Promise<string> {
    return FileSystem.readFile(toLocalPath(uri), 'base64')
  },

  async writeBase64ToDocuments(fileName: string, base64: string): Promise<string> {
    const path = `${Dirs.DocumentDir}/${sanitizeFileName(fileName)}`
    await writeBase64(path, base64)
    return toFileUri(path)
  },

  async delete(uri: string): Promise<void> {
    await FileSystem.unlink(toLocalPath(uri))
  },
}

export async function writePackageToCache(
  fileName: string,
  base64: string,
): Promise<string> {
  const path = `${Dirs.CacheDir}/${sanitizeFileName(fileName)}`
  await writeBase64(path, base64)
  return toFileUri(path)
}

export async function deleteFileUri(uri: string): Promise<void> {
  await FileSystem.unlink(toLocalPath(uri))
}
