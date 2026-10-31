import { Share, NativeModules, Platform } from 'react-native'
import { fromByteArray } from 'base64-js'

import { writePackageToCache } from '../transfer/nativeFileSystem'

interface NativeBackupShare {
  shareFile: (uri: string, fileName: string) => Promise<void>
}

function getNativeShare(): NativeBackupShare | null {
  const module = NativeModules.BackupNative as
    | Partial<NativeBackupShare>
    | undefined
  return typeof module?.shareFile === 'function'
    ? (module as NativeBackupShare)
    : null
}

export async function shareBackupFile(
  uri: string,
  fileName: string,
): Promise<void> {
  if (Platform.OS === 'ios') {
    const result = await Share.share({ title: fileName, url: uri })
    if (result.action === Share.dismissedAction) {
      return
    }
    return
  }

  const native = getNativeShare()
  if (!native) {
    throw new Error('当前安装包不支持系统分享，请重新构建应用')
  }
  await native.shareFile(uri, fileName)
}

export async function shareBackupBytes(
  bytes: Uint8Array,
  fileName: string,
): Promise<void> {
  const uri = await writePackageToCache(fileName, fromByteArray(bytes))
  await shareBackupFile(uri, fileName)
}
