import React, { useCallback, useMemo, useState } from 'react'
import { ScrollView } from 'react-native'
import {
  Button,
  Card,
  Column,
  Input,
  Result,
  Row,
  Text,
  createUseSheetStyle,
} from '@pennyspring/ui'
import {
  BOOK_TYPE,
  localApi,
  type ApplyLibrarySnapshotResult,
} from '@pennyspring/api'

import {
  downloadLanPackage,
  type LanDownloadProgress,
} from '../../features/backup/lanDownload'
import { formatBytes, totalRecords } from '../../features/transfer'
import { parseSnapshotPackage } from '../../features/transfer'
import {
  importPackage,
  type PickedPackagePreview,
} from '../../features/transfer/operations'
import { ROOT_ROUTES, useNavigation } from '../../navigation'
import {
  createBackupHistoryId,
  useBackupHistoryStore,
} from '../../stores/backupHistoryStore'
import { useBookStore } from '../../stores/bookStore'

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
  note: {
    gap: token.marginXXS,
  },
  bookRow: {
    gap: token.marginXXS,
    paddingVertical: token.paddingXXS,
  },
  error: {
    paddingHorizontal: token.paddingXXS,
  },
  actions: {
    gap: token.marginXS,
    width: '100%',
  },
}))

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : '局域网接收失败'
}

function formatProgress(progress: LanDownloadProgress | null): string {
  if (!progress) return '等待连接发送端…'
  if (progress.contentLength > 0) {
    const percent = Math.min(
      100,
      Math.round((progress.bytesRead / progress.contentLength) * 100),
    )
    return `已接收 ${formatBytes(progress.bytesRead)} / ${formatBytes(progress.contentLength)}（${percent}%）`
  }
  return `已接收 ${formatBytes(progress.bytesRead)}`
}

export function BackupLanReceiveScreen() {
  const styles = useStyles()
  const navigation = useNavigation()
  const addHistory = useBackupHistoryStore(state => state.addEntry)
  const [address, setAddress] = useState('')
  const [token, setToken] = useState('')
  const [busy, setBusy] = useState(false)
  const [progress, setProgress] = useState<LanDownloadProgress | null>(null)
  const [preview, setPreview] = useState<PickedPackagePreview | null>(null)
  const [result, setResult] = useState<ApplyLibrarySnapshotResult | null>(null)
  const [errorText, setErrorText] = useState('')

  const handleDownload = useCallback(async (): Promise<void> => {
    if (busy) return
    setBusy(true)
    setErrorText('')
    setProgress(null)
    try {
      const downloaded = await downloadLanPackage(address, token, setProgress)
      try {
        const parsed = await parseSnapshotPackage(downloaded.bytes)
        setPreview({
          sourceName: '局域网传输',
          sizeBytes: downloaded.sizeBytes,
          parsed,
        })
      } finally {
        await downloaded.cleanup()
      }
    } catch (error: unknown) {
      setErrorText(getErrorMessage(error))
    } finally {
      setBusy(false)
    }
  }, [address, busy, token])

  const handleImport = useCallback(async (): Promise<void> => {
    if (!preview || busy) return
    setBusy(true)
    setErrorText('')
    try {
      const imported = await importPackage(preview.parsed)
      addHistory({
        id: createBackupHistoryId(),
        kind: 'lan-receive',
        fileName: preview.parsed.manifest.books[0]?.name
          ? `局域网接收_${preview.parsed.manifest.books[0].name}.psb`
          : '局域网接收.psb',
        sizeBytes: preview.sizeBytes,
        createdAt: Date.now(),
        bookNames: preview.parsed.manifest.books.map(book => book.name),
        recordCount: totalRecords(preview.parsed.manifest),
        uri: '',
        status: 'success',
        errorText: '',
      })
      setResult(imported.result)
    } catch (error: unknown) {
      setErrorText(getErrorMessage(error))
    } finally {
      setBusy(false)
    }
  }, [addHistory, busy, preview])

  const openImportedBook = useCallback(async (): Promise<void> => {
    if (!result?.books[0]) {
      navigation.navigate(ROOT_ROUTES.Home)
      return
    }
    try {
      const book = await localApi.book.getById(result.books[0].bookId)
      useBookStore.getState().setCurrentBook(
        { kind: 'local', id: book.id },
        { kind: BOOK_TYPE.local, ...book },
      )
      navigation.navigate(ROOT_ROUTES.Home)
    } catch (error: unknown) {
      setErrorText(getErrorMessage(error))
    }
  }, [navigation, result])

  const manifest = preview?.parsed.manifest
  const previewBooks = useMemo(() => manifest?.books ?? [], [manifest])

  if (result) {
    const records = result.books.reduce((sum, book) => sum + book.counts.records, 0)
    return (
      <ScrollView contentContainerStyle={styles.content} style={styles.container}>
        <Result
          status="success"
          titleText="接收完成"
          subtitleText={`${result.books.length} 个账本已创建 · ${records.toLocaleString('zh-CN')} 条流水`}
          extra={
            <Column style={styles.actions}>
              <Button block onPress={openImportedBook} type="primary">
                打开导入的账本
              </Button>
              <Button
                block
                onPress={() => navigation.navigate(ROOT_ROUTES.Home)}
                type="dashed"
              >
                完成
              </Button>
            </Column>
          }
        />
      </ScrollView>
    )
  }

  if (preview && manifest) {
    return (
      <ScrollView contentContainerStyle={styles.content} style={styles.container}>
        <Card
          extra={<Text color="tertiary" size="xs">格式 v{manifest.formatVersion}</Text>}
          titleText="接收到的备份"
        >
          <Column style={styles.section}>
            <Text weight="semibold">{preview.sourceName}</Text>
            <Text color="secondary" size="sm">
              {formatBytes(preview.sizeBytes)} · {manifest.books.length} 个账本 · {totalRecords(manifest).toLocaleString('zh-CN')} 条流水
            </Text>
          </Column>
        </Card>

        <Card titleText="将创建的账本">
          <Column style={styles.section}>
            {previewBooks.map(book => (
              <Column key={book.key} style={styles.bookRow}>
                <Text>{book.name}</Text>
                <Text color="secondary" size="sm">
                  {book.counts.records.toLocaleString('zh-CN')} 条流水 · {book.counts.assets} 个资产 · {book.counts.images} 张图片
                </Text>
              </Column>
            ))}
          </Column>
        </Card>

        <Card titleText="导入规则">
          <Column style={styles.note}>
            <Row justify="between" gap="small">
              <Text size="sm" color="secondary">图片附件</Text>
              <Text size="sm">{manifest.options.includeImages ? '包含' : '不包含'}</Text>
            </Row>
            <Row justify="between" gap="small">
              <Text size="sm" color="secondary">AI 会话</Text>
              <Text size="sm">{manifest.options.includeAgent ? '包含' : '不包含'}</Text>
            </Row>
            <Text size="sm" color="secondary">
              会新建账本，不会覆盖现有数据；不包含 API Key、AI 提供商配置或服务器连接。
            </Text>
          </Column>
        </Card>

        {errorText ? (
          <Text color="errorText" size="sm" style={styles.error}>{errorText}</Text>
        ) : null}

        <Button block loading={busy} onPress={handleImport} type="primary">
          导入为新账本
        </Button>
        <Button
          block
          disabled={busy}
          onPress={() => {
            setPreview(null)
            setErrorText('')
          }}
          type="dashed"
        >
          重新接收
        </Button>
      </ScrollView>
    )
  }

  return (
    <ScrollView contentContainerStyle={styles.content} style={styles.container}>
      <Card titleText="连接发送端">
        <Column style={styles.section}>
          <Text color="secondary" size="sm">
            在发送端选择「局域网发送」，把显示的地址和 6 位口令填到这里。两台设备需要在同一局域网。
          </Text>
          <Input
            autoCapitalize="none"
            autoCorrect={false}
            labelText="接收地址"
            onChange={setAddress}
            placeholder="http://192.168.1.10:8080"
            value={address}
          />
          <Input
            keyboardType="number-pad"
            labelText="一次性口令"
            maxLength={6}
            onChange={setToken}
            placeholder="6 位数字"
            value={token}
          />
          {busy || progress ? (
            <Text color="secondary" size="sm">{formatProgress(progress)}</Text>
          ) : null}
        </Column>
      </Card>

      <Card titleText="传输说明">
        <Column style={styles.note}>
          <Text color="secondary" size="sm">
            接收端只下载发送端当前提供的备份文件；发送成功、超时或发送端手动停止后服务关闭。
          </Text>
          <Text color="tertiary" size="xs">
            传输使用局域网 http，不经过互联网；请只在可信网络使用。
          </Text>
        </Column>
      </Card>

      {errorText ? (
        <Text color="errorText" size="sm" style={styles.error}>{errorText}</Text>
      ) : null}

      <Button
        block
        disabled={busy || !address.trim() || token.length !== 6}
        loading={busy}
        onPress={handleDownload}
        type="primary"
      >
        连接并下载
      </Button>
    </ScrollView>
  )
}
