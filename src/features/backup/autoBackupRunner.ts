import { fromByteArray } from 'base64-js'
import { Dirs, FileSystem } from 'react-native-file-access'
import { localApi } from '@pennyspring/api'

import {
  createBackupHistoryId,
  useBackupHistoryStore,
} from '../../stores/backupHistoryStore'
import { buildExportPackage } from '../transfer/operations'
import { totalRecords } from '../transfer/summary'
import {
  getAutoBackupSettings,
  useAutoBackupStore,
  type AutoBackupSettings,
} from './autoBackupStore'
import {
  deleteBackupDirectoryFile,
  listBackupDirectoryFiles,
  writeBackupFileToDirectory,
} from './directory'

const AUTO_BACKUP_DIR_NAME = 'backups'
const AUTO_BACKUP_PREFIX = 'auto-'
const BACKUP_EXTENSION = '.psb'

export interface AutoBackupRunResult {
  status: 'success' | 'skipped' | 'failed'
  fileName: string
  sizeBytes: number
  errorText: string
}

let activeRun: Promise<AutoBackupRunResult> | null = null

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : '自动备份失败'
}

function getDefaultBackupDir(): string {
  return `${Dirs.DocumentDir}/${AUTO_BACKUP_DIR_NAME}`
}

function toFileUri(path: string): string {
  return path.startsWith('file://') ? path : `file://${encodeURI(path)}`
}

function toTimestampText(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hour = String(date.getHours()).padStart(2, '0')
  const minute = String(date.getMinutes()).padStart(2, '0')
  const second = String(date.getSeconds()).padStart(2, '0')
  return `${year}${month}${day}-${hour}${minute}${second}`
}

export function createAutoBackupFileName(now: Date = new Date()): string {
  return `${AUTO_BACKUP_PREFIX}${toTimestampText(now)}${BACKUP_EXTENSION}`
}

function isAutoBackupFile(fileName: string): boolean {
  return (
    fileName.startsWith(AUTO_BACKUP_PREFIX) &&
    fileName.endsWith(BACKUP_EXTENSION)
  )
}

async function writeToDefaultDirectory(
  fileName: string,
  base64: string,
): Promise<string> {
  const directory = getDefaultBackupDir()
  if (!(await FileSystem.exists(directory))) {
    await FileSystem.mkdir(directory)
  }
  const path = `${directory}/${fileName}`
  await FileSystem.writeFile(path, base64, 'base64')
  return toFileUri(path)
}

async function pruneDefaultDirectory(retention: number | null): Promise<void> {
  if (retention === null) return
  const directory = getDefaultBackupDir()
  if (!(await FileSystem.exists(directory))) return
  const files = (await FileSystem.statDir(directory))
    .filter(file => file.type === 'file' && isAutoBackupFile(file.filename))
    .sort((a, b) => b.lastModified - a.lastModified)
  for (const file of files.slice(retention)) {
    await FileSystem.unlink(file.path)
  }
}

async function pruneCustomDirectory(
  settings: AutoBackupSettings,
  retention: number | null,
): Promise<void> {
  if (retention === null || settings.directory === null) return
  const files = (await listBackupDirectoryFiles(settings.directory))
    .filter(file => isAutoBackupFile(file.name))
    .sort((a, b) => b.lastModified - a.lastModified)
  for (const file of files.slice(retention)) {
    await deleteBackupDirectoryFile(settings.directory, file.name)
  }
}

async function pruneOldBackups(
  settings: AutoBackupSettings,
  retention: number | null,
): Promise<void> {
  if (settings.directory === null) {
    await pruneDefaultDirectory(retention)
    return
  }
  await pruneCustomDirectory(settings, retention)
}

async function executeAutoBackup(): Promise<AutoBackupRunResult> {
  const now = new Date()
  const settings = getAutoBackupSettings()
  const history = useBackupHistoryStore.getState()
  const markRun = useAutoBackupStore.getState().markRun

  try {
    const books = await localApi.book.getAll()
    const selected = settings.bookIds === null
      ? books
      : books.filter(book => settings.bookIds?.includes(book.id) ?? false)

    if (selected.length === 0) {
      const errorText = '没有可备份的本地账本'
      markRun({ status: 'skipped', at: now.getTime(), error: errorText })
      return { status: 'skipped', fileName: '', sizeBytes: 0, errorText }
    }

    const pkg = await buildExportPackage({
      bookIds: selected.map(book => book.id),
      includeAgent: settings.includeAgent,
      includeImages: settings.includeImages,
    })
    const fileName = createAutoBackupFileName(now)
    const base64 = fromByteArray(pkg.zip)
    const uri = settings.directory === null
      ? await writeToDefaultDirectory(fileName, base64)
      : await writeBackupFileToDirectory(settings.directory, fileName, base64)

    let warningText = ''
    try {
      await pruneOldBackups(settings, settings.retention)
    } catch (error: unknown) {
      warningText = `清理旧备份失败：${getErrorMessage(error)}`
    }

    history.addEntry({
      id: createBackupHistoryId(),
      kind: 'auto',
      fileName,
      sizeBytes: pkg.sizeBytes,
      createdAt: now.getTime(),
      bookNames: pkg.manifest.books.map(book => book.name),
      recordCount: totalRecords(pkg.manifest),
      uri,
      status: 'success',
      errorText: warningText,
    })
    markRun({
      status: 'success',
      at: now.getTime(),
      fileName,
      error: warningText,
    })

    return {
      status: 'success',
      fileName,
      sizeBytes: pkg.sizeBytes,
      errorText: warningText,
    }
  } catch (error: unknown) {
    const errorText = getErrorMessage(error)
    markRun({ status: 'failed', at: now.getTime(), error: errorText })
    history.addEntry({
      id: createBackupHistoryId(),
      kind: 'auto',
      fileName: '',
      sizeBytes: 0,
      createdAt: now.getTime(),
      bookNames: [],
      recordCount: 0,
      uri: '',
      status: 'failed',
      errorText,
    })
    return {
      status: 'failed',
      fileName: '',
      sizeBytes: 0,
      errorText,
    }
  }
}

export function runAutoBackup(): Promise<AutoBackupRunResult> {
  if (activeRun) return activeRun
  const run = executeAutoBackup().finally(() => {
    if (activeRun === run) {
      activeRun = null
    }
  })
  activeRun = run
  return run
}
