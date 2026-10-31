import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import { ScrollView } from 'react-native'
import { useRequest } from 'ahooks'
import {
  Button,
  Card,
  Checkbox,
  Column,
  Result,
  Row,
  Switch,
  Text,
  createUseSheetStyle,
  useToast,
} from '@pennyspring/ui'
import type { BookRow } from '@pennyspring/api'
import { localApi } from '@pennyspring/api'
import { fromByteArray } from 'base64-js'

import { shareBackupBytes } from '../../features/backup/share'
import {
  createLanToken,
  getLanServerStatus,
  isLanTransferSupported,
  startLanServer,
  stopLanServer,
  type LanServerInfo,
  type LanServerStatus,
} from '../../features/backup/lan'
import { formatBytes, totalRecords } from '../../features/transfer'
import {
  buildExportPackage,
  type ExportPackageResult,
} from '../../features/transfer/operations'
import {
  deleteFileUri,
  writePackageToCache,
} from '../../features/transfer/nativeFileSystem'
import { useNavigation } from '../../navigation'
import {
  createBackupHistoryId,
  useBackupHistoryStore,
} from '../../stores/backupHistoryStore'

const RECEIVE_TIMEOUT_MS = 10 * 60 * 1000

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
  books: {
    gap: token.marginXS,
  },
  bookText: {
    gap: token.marginXXS,
  },
  options: {
    gap: token.marginSM,
  },
  optionText: {
    flex: 1,
    gap: token.marginXXS,
  },
  token: {
    letterSpacing: token.marginXS,
  },
  actions: {
    gap: token.marginXS,
  },
  hint: {
    gap: token.marginXXS,
  },
  error: {
    paddingHorizontal: token.paddingXXS,
  },
}))

interface LanSession {
  info: LanServerInfo
  token: string
  pkg: ExportPackageResult
  cacheUri: string
}

type Phase = 'config' | 'sharing' | 'done' | 'error'

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : '局域网发送失败'
}

export function BackupLanSendScreen() {
  const styles = useStyles()
  const toast = useToast()
  const navigation = useNavigation()
  const addHistory = useBackupHistoryStore(state => state.addEntry)
  const { data, loading } = useRequest(() => localApi.book.getAll())
  const books = data ?? []
  const supported = isLanTransferSupported()

  const [selectedIds, setSelectedIds] = useState<number[] | null>(null)
  const [includeImages, setIncludeImages] = useState(true)
  const [includeAgent, setIncludeAgent] = useState(false)
  const [phase, setPhase] = useState<Phase>('config')
  const [session, setSession] = useState<LanSession | null>(null)
  const [serverStatus, setServerStatus] = useState<LanServerStatus | null>(null)
  const [busy, setBusy] = useState(false)
  const [errorText, setErrorText] = useState('')
  const recordedRef = useRef(false)

  useEffect(() => {
    if (selectedIds !== null || books.length === 0) return
    setSelectedIds(books[0]?.id ? [books[0].id] : [])
  }, [books, selectedIds])

  useEffect(() => {
    return () => {
      stopLanServer().catch(() => undefined)
    }
  }, [])

  const selectedBooks = useMemo(
    () => books.filter(book => selectedIds?.includes(book.id) ?? false),
    [books, selectedIds],
  )

  const toggleBook = useCallback((book: BookRow): void => {
    setSelectedIds(current => {
      const values = current ?? []
      return values.includes(book.id)
        ? values.filter(id => id !== book.id)
        : [...values, book.id]
    })
  }, [])

  const recordSend = useCallback(
    (current: LanSession): void => {
      if (recordedRef.current) return
      recordedRef.current = true
      addHistory({
        id: createBackupHistoryId(),
        kind: 'lan-send',
        fileName: current.pkg.fileName,
        sizeBytes: current.pkg.sizeBytes,
        createdAt: Date.now(),
        bookNames: current.pkg.manifest.books.map(book => book.name),
        recordCount: totalRecords(current.pkg.manifest),
        uri: current.cacheUri,
        status: 'success',
        errorText: '',
      })
    },
    [addHistory],
  )

  useEffect(() => {
    if (phase !== 'sharing' || !session) return
    let cancelled = false
    const timer = setInterval(() => {
      getLanServerStatus()
        .then(status => {
          if (cancelled) return
          setServerStatus(status)
          if (status.state === 'served') {
            recordSend(session)
            setPhase('done')
          } else if (status.state === 'error') {
            setErrorText(status.error || '传输服务已停止')
            setPhase('error')
          }
        })
        .catch(error => {
          if (cancelled) return
          setErrorText(getErrorMessage(error))
          setPhase('error')
        })
    }, 1000)
    return () => {
      cancelled = true
      clearInterval(timer)
    }
  }, [phase, recordSend, session])

  const handleStart = useCallback(async (): Promise<void> => {
    if (busy || !selectedIds || selectedIds.length === 0) return
    setBusy(true)
    setErrorText('')
    try {
      const pkg = await buildExportPackage({
        bookIds: selectedIds,
        includeAgent,
        includeImages,
      })
      const cacheUri = await writePackageToCache(
        pkg.fileName,
        fromByteArray(pkg.zip),
      )
      try {
        const token = createLanToken()
        const info = await startLanServer(
          token,
          cacheUri,
          pkg.fileName,
          RECEIVE_TIMEOUT_MS,
        )
        recordedRef.current = false
        setSession({ info, token, pkg, cacheUri })
        setServerStatus({ state: 'waiting', error: '', servedAt: 0 })
        setPhase('sharing')
      } catch (error: unknown) {
        await deleteFileUri(cacheUri).catch(() => undefined)
        throw error
      }
    } catch (error: unknown) {
      setErrorText(getErrorMessage(error))
    } finally {
      setBusy(false)
    }
  }, [busy, includeAgent, includeImages, selectedIds])

  const handleStop = useCallback(async (): Promise<void> => {
    await stopLanServer().catch(() => undefined)
    setPhase('config')
    setSession(null)
    setServerStatus(null)
  }, [])

  const handleShareCache = useCallback(async (): Promise<void> => {
    if (!session) return
    try {
      await shareBackupBytes(session.pkg.zip, session.pkg.fileName)
    } catch (error: unknown) {
      toast.show({ messageText: getErrorMessage(error), status: 'error' })
    }
  }, [session, toast])

  if (phase === 'done' && session) {
    return (
      <ScrollView contentContainerStyle={styles.content} style={styles.container}>
        <Result
          status="success"
          titleText="发送完成"
          subtitleText={`${session.pkg.fileName} · ${formatBytes(session.pkg.sizeBytes)}`}
          extra={
            <Column style={styles.actions}>
              <Button block onPress={handleShareCache} type="dashed">
                分享文件
              </Button>
              <Button block onPress={() => navigation.goBack()} type="primary">
                完成
              </Button>
            </Column>
          }
        />
      </ScrollView>
    )
  }

  if (phase === 'sharing' && session) {
    return (
      <ScrollView contentContainerStyle={styles.content} style={styles.container}>
        <Card titleText="在另一台设备上接收">
          <Column style={styles.actions}>
            <Text color="secondary" size="sm">
              两台设备连接同一局域网。在接收端选择「局域网接收」，输入下面的地址和口令。
            </Text>
            {session.info.urls.map(url => (
              <Text key={url} selectable size="sm" weight="semibold">
                {url}
              </Text>
            ))}
            <Text color="secondary" size="sm">一次性口令</Text>
            <Text size="h2" style={styles.token}>{session.token}</Text>
            <Text color="tertiary" size="xs">
              口令只能成功使用一次；传输成功、手动停止或等待 10 分钟后服务关闭。
            </Text>
            <Text color="secondary" size="sm">
              正在等待接收 · {session.pkg.fileName} · {formatBytes(session.pkg.sizeBytes)}
            </Text>
            {serverStatus?.state === 'error' ? (
              <Text color="errorText" size="sm">{serverStatus.error}</Text>
            ) : null}
            <Button block onPress={handleStop} type="dashed">
              停止发送
            </Button>
          </Column>
        </Card>
      </ScrollView>
    )
  }

  if (phase === 'error') {
    return (
      <ScrollView contentContainerStyle={styles.content} style={styles.container}>
        <Result
          status="error"
          titleText="发送失败"
          subtitleText={errorText}
          extra={
            <Button
              block
              onPress={() => {
                setPhase('config')
                setSession(null)
                setErrorText('')
              }}
              type="primary"
            >
              返回重试
            </Button>
          }
        />
      </ScrollView>
    )
  }

  return (
    <ScrollView contentContainerStyle={styles.content} style={styles.container}>
      {!supported ? (
        <Card titleText="当前安装包不支持局域网传输">
          <Text color="secondary" size="sm">
            需要重新构建 Android 或 iOS 应用，原生模块才会生效。
          </Text>
        </Card>
      ) : null}

      <Card titleText="选择要发送的账本">
        {loading ? (
          <Text color="secondary" size="sm">正在读取本地账本…</Text>
        ) : books.length === 0 ? (
          <Text color="secondary" size="sm">没有可发送的本地账本。</Text>
        ) : (
          <Column style={styles.books}>
            {books.map(book => (
              <Checkbox
                key={book.id}
                onChange={() => toggleBook(book)}
                value={selectedIds?.includes(book.id) ?? false}
              >
                <Column style={styles.bookText}>
                  <Text>{book.name}</Text>
                  <Text color="secondary" size="sm">{book.description || '本地账本'}</Text>
                </Column>
              </Checkbox>
            ))}
          </Column>
        )}
      </Card>

      <Card titleText="包含内容">
        <Column style={styles.options}>
          <Row align="center" gap="small" justify="between">
            <Column style={styles.optionText}>
              <Text>图片附件</Text>
              <Text color="secondary" size="sm">账本封面与流水图片会打包发送。</Text>
            </Column>
            <Switch onChange={setIncludeImages} value={includeImages} />
          </Row>
          <Row align="center" gap="small" justify="between">
            <Column style={styles.optionText}>
              <Text>AI 会话</Text>
              <Text color="secondary" size="sm">默认关闭；开启后包含会话、消息和消息图片。</Text>
            </Column>
            <Switch onChange={setIncludeAgent} value={includeAgent} />
          </Row>
        </Column>
      </Card>

      <Card titleText="传输方式">
        <Column style={styles.hint}>
          <Text color="secondary" size="sm">
            发送端临时启动一个局域网 HTTP 服务，接收端下载后导入为新账本。服务只提供当前备份文件，使用一次性口令，10 分钟后自动关闭。
          </Text>
          <Text color="tertiary" size="xs">
            请只在可信局域网使用；传输不经过互联网，也不包含 API Key 或 AI 提供商配置。
          </Text>
        </Column>
      </Card>

      {errorText ? (
        <Text color="errorText" size="sm" style={styles.error}>{errorText}</Text>
      ) : null}

      <Button
        block
        disabled={!supported || busy || selectedBooks.length === 0}
        loading={busy}
        onPress={handleStart}
        type="primary"
      >
        开始发送
      </Button>
      <Text color="tertiary" size="xs" style={styles.error}>
        已选择 {selectedBooks.length} 个账本
      </Text>
    </ScrollView>
  )
}
