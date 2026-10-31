import { NativeModules, Platform } from 'react-native'

export interface BackupDirectoryTarget {
  id: string
  label: string
}

export interface BackupDirectoryFile {
  name: string
  size: number
  lastModified: number
}

interface NativeBackupDirectory {
  pickDirectory: () => Promise<BackupDirectoryTarget | null>
  writeFile: (directoryId: string, fileName: string, base64: string) => Promise<string>
  listFiles: (directoryId: string) => Promise<BackupDirectoryFile[]>
  deleteFile: (directoryId: string, fileName: string) => Promise<void>
}

function getNativeDirectory(): NativeBackupDirectory | null {
  const module = NativeModules.BackupNative as
    | Partial<NativeBackupDirectory>
    | undefined
  return typeof module?.pickDirectory === 'function' &&
    typeof module?.writeFile === 'function' &&
    typeof module?.listFiles === 'function' &&
    typeof module?.deleteFile === 'function'
    ? (module as NativeBackupDirectory)
    : null
}

export function isCustomDirectorySupported(): boolean {
  return getNativeDirectory() !== null
}

export async function pickBackupDirectory(): Promise<BackupDirectoryTarget | null> {
  const native = getNativeDirectory()
  if (!native) {
    throw new Error('当前安装包不支持选择备份目录，请重新构建应用')
  }
  return native.pickDirectory()
}

export async function writeBackupFileToDirectory(
  target: BackupDirectoryTarget,
  fileName: string,
  base64: string,
): Promise<string> {
  const native = getNativeDirectory()
  if (!native) {
    throw new Error('当前安装包不支持写入自定义备份目录')
  }
  return native.writeFile(target.id, fileName, base64)
}

export async function listBackupDirectoryFiles(
  target: BackupDirectoryTarget,
): Promise<BackupDirectoryFile[]> {
  const native = getNativeDirectory()
  if (!native) {
    throw new Error('当前安装包不支持读取自定义备份目录')
  }
  return native.listFiles(target.id)
}

export async function deleteBackupDirectoryFile(
  target: BackupDirectoryTarget,
  fileName: string,
): Promise<void> {
  const native = getNativeDirectory()
  if (!native) {
    throw new Error('当前安装包不支持删除自定义备份目录中的文件')
  }
  await native.deleteFile(target.id, fileName)
}

export function describeDirectoryTarget(target: BackupDirectoryTarget): string {
  return target.label || (Platform.OS === 'ios' ? '已选择目录' : target.id)
}
