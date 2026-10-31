import React, { useCallback, useState } from 'react'
import { ScrollView } from 'react-native'
import {
  Button,
  Card,
  Column,
  Empty,
  Text,
  createUseSheetStyle,
  useToast,
} from '@pennyspring/ui'

import { useThemeMode } from '../../contexts/ThemeModeContext'
import {
  applySettingsPackage,
  exportSettingsToFile,
  pickSettingsPreview,
  type PickedSettingsPreview,
  type SettingsExportResult,
} from '../../features/transfer/settingsOperations'
import { formatBytes } from '../../features/transfer'
import { shareBackupBytes } from '../../features/backup/share'
import { useQuickBookSettingsStore } from '../../features/quickBook/settingsStore'
import {
  createBackupHistoryId,
  useBackupHistoryStore,
} from '../../stores/backupHistoryStore'

const useStyles = createUseSheetStyle(token => ({
  container: {
    backgroundColor: token.colorBgLayout,
    flex: 1,
  },
  content: {
    gap: token.marginSM,
    padding: token.padding,
    paddingBottom: token.paddingXL,
  },
  section: {
    gap: token.marginSM,
  },
  hint: {
    gap: token.marginXXS,
  },
}))

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : '操作失败'
}

export function BackupSettingsScreen() {
  const styles = useStyles()
  const toast = useToast()
  const quickBook = useQuickBookSettingsStore()
  const { themeMode, themePreset } = useThemeMode()
  const addHistory = useBackupHistoryStore(state => state.addEntry)

  const [busy, setBusy] = useState(false)
  const [exported, setExported] = useState<SettingsExportResult | null>(null)
  const [preview, setPreview] = useState<PickedSettingsPreview | null>(null)
  const [errorText, setErrorText] = useState('')

  const handleExport = useCallback(async (): Promise<void> => {
    if (busy) return
    setBusy(true)
    setErrorText('')
    try {
      const result = await exportSettingsToFile()
      setExported(result)
      addHistory({
        id: createBackupHistoryId(),
        kind: 'settings-export',
        fileName: result.fileName,
        sizeBytes: result.sizeBytes,
        createdAt: Date.now(),
        bookNames: [],
        recordCount: 0,
        uri: result.savedUri,
        status: 'success',
        errorText: '',
      })
      toast.show({ messageText: '设置包已保存', status: 'success' })
    } catch (error: unknown) {
      setErrorText(getErrorMessage(error))
    } finally {
      setBusy(false)
    }
  }, [addHistory, busy, toast])

  const handleShareExport = useCallback(async (): Promise<void> => {
    if (!exported) return
    try {
      await shareBackupBytes(exported.zip, exported.fileName)
    } catch (error: unknown) {
      toast.show({ messageText: getErrorMessage(error), status: 'error' })
    }
  }, [exported, toast])

  const handlePick = useCallback(async (): Promise<void> => {
    if (busy) return
    setBusy(true)
    setErrorText('')
    try {
      const picked = await pickSettingsPreview()
      if (picked) setPreview(picked)
    } catch (error: unknown) {
      setErrorText(getErrorMessage(error))
    } finally {
      setBusy(false)
    }
  }, [busy])

  const handleImport = useCallback((): void => {
    if (!preview || busy) return
    setBusy(true)
    setErrorText('')
    try {
      applySettingsPackage(preview.parsed.settings)
      addHistory({
        id: createBackupHistoryId(),
        kind: 'settings-import',
        fileName: preview.sourceName,
        sizeBytes: preview.sizeBytes,
        createdAt: Date.now(),
        bookNames: [],
        recordCount: 0,
        uri: '',
        status: 'success',
        errorText: '',
      })
      toast.show({ messageText: '设置已导入', status: 'success' })
      setPreview(null)
    } catch (error: unknown) {
      setErrorText(getErrorMessage(error))
    } finally {
      setBusy(false)
    }
  }, [addHistory, busy, preview, toast])

  return (
    <ScrollView contentContainerStyle={styles.content} style={styles.container}>
      <Card titleText="当前设置">
        <Column style={styles.section}>
          <Text size="sm">
            主题：{themeMode === 'dark' ? '深色' : '浅色'} · {themePreset}
          </Text>
          <Text size="sm">
            截图提醒：{quickBook.nudgeEnabled ? '开启' : '关闭'}
          </Text>
          <Text color="secondary" size="sm">
            最近判断时间：{quickBook.freshWindowSeconds} 秒
          </Text>
          <Text color="secondary" size="sm">
            预设提示词：{quickBook.presetPrompt.slice(0, 48)}
            {quickBook.presetPrompt.length > 48 ? '…' : ''}
          </Text>
          <Text color="tertiary" size="xs">
            设置包只包含快捷记账设置与主题；不包含网络账本、服务器地址和 API Key。
          </Text>
        </Column>
      </Card>

      <Card titleText="导出设置">
        <Column style={styles.section}>
          <Text color="secondary" size="sm">
            导出的 .pss 设置包可以在另一台设备导入，导入后立即生效。
          </Text>
          {exported ? (
            <Column style={styles.section}>
              <Text weight="semibold">{exported.fileName}</Text>
              <Text color="secondary" size="sm">
                {formatBytes(exported.sizeBytes)}
              </Text>
              <Button onPress={handleShareExport} size="small" type="dashed">
                分享
              </Button>
            </Column>
          ) : (
            <Button loading={busy} onPress={handleExport} type="primary">
              保存设置包
            </Button>
          )}
        </Column>
      </Card>

      <Card titleText="导入设置">
        {preview ? (
          <Column style={styles.section}>
            <Text weight="semibold">{preview.sourceName}</Text>
            <Text color="secondary" size="sm">
              {formatBytes(preview.sizeBytes)} · 快捷记账与主题设置
            </Text>
            <Column style={styles.hint}>
              <Text color="secondary" size="sm">
                导入会覆盖当前快捷记账设置和主题模式/主题色。
              </Text>
              <Text color="tertiary" size="xs">
                截图提醒需要当前设备具备相册权限，并已配置支持图片的 AI 模型。
              </Text>
            </Column>
            <Button block loading={busy} onPress={handleImport} type="primary">
              导入设置
            </Button>
            <Button block disabled={busy} onPress={handlePick} type="dashed">
              重新选择文件
            </Button>
          </Column>
        ) : (
          <Empty
            action={
              <Button loading={busy} onPress={handlePick} size="small" type="primary">
                选择 .pss 设置包
              </Button>
            }
            descriptionText="选择设置包，导入快捷记账与主题设置。"
            titleText="还没有选择设置包"
            variant="boxed"
          />
        )}
      </Card>

      {errorText ? (
        <Text color="errorText" size="sm">{errorText}</Text>
      ) : null}
    </ScrollView>
  )
}
