import {
  errorCodes,
  isErrorWithCode,
  keepLocalCopy,
  pick,
  saveDocuments,
  types,
} from '@react-native-documents/picker'
import { fromByteArray, toByteArray } from 'base64-js'

import { nativeTransferFileSystem, writePackageToCache } from './nativeFileSystem'

export interface PickedPackage {
  name: string
  bytes: Uint8Array
}

export async function pickPackageFile(): Promise<PickedPackage | null> {
  let picked
  try {
    const selection = await pick({
      allowMultiSelection: false,
      type: [types.allFiles],
    })
    picked = selection[0]
  } catch (error) {
    if (isErrorWithCode(error) && error.code === errorCodes.OPERATION_CANCELED) {
      return null
    }
    throw error
  }
  if (!picked) return null

  const name = picked.name ?? 'pennyspring-backup.psb'
  const copied = await keepLocalCopy({
    files: [{ uri: picked.uri, fileName: name }],
    destination: 'cachesDirectory',
  })
  const result = copied[0]
  if (!result) {
    throw new Error('读取备份文件失败')
  }
  if (result.status === 'error') {
    throw new Error(`读取备份文件失败：${result.copyError}`)
  }

  try {
    const base64 = await nativeTransferFileSystem.readBase64(result.localUri)
    return { name, bytes: toByteArray(base64) }
  } finally {
    try {
      await nativeTransferFileSystem.delete(result.localUri)
    } catch {
      // Temporary copy cleanup is best-effort.
    }
  }
}

export async function savePackageFile(
  bytes: Uint8Array,
  fileName: string,
): Promise<string> {
  const cacheUri = await writePackageToCache(fileName, fromByteArray(bytes))
  try {
    const saved = await saveDocuments({
      copy: true,
      fileName,
      mimeType: 'application/zip',
      sourceUris: [cacheUri],
    })
    const result = saved[0]
    if (!result) throw new Error('保存备份失败')
    if (result.error) throw new Error(`保存备份失败：${result.error}`)
    return result.uri
  } finally {
    try {
      await nativeTransferFileSystem.delete(cacheUri)
    } catch {
      // The native save dialog may have moved the file on some platforms.
    }
  }
}
