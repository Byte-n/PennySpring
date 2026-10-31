import React, { useCallback, useEffect, useMemo, useState } from 'react'
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
} from '@pennyspring/ui'
import type { BookRow } from '@pennyspring/api'
import { localApi } from '@pennyspring/api'
import { createUseSheetStyle } from '@pennyspring/ui'

import { formatBytes, totalRecords } from '../../features/transfer'
import {
  exportBooksToFile,
  type SavedExportResult,
} from '../../features/transfer/operations'
import { useNavigation } from '../../navigation'
import { useBackupSessionStore } from '../../stores/backupSessionStore'
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
  note: {
    gap: token.marginXXS,
  },
  error: {
    paddingHorizontal: token.paddingXXS,
  },
  resultActions: {
    gap: token.marginXS,
    width: '100%',
  },
}))

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : '导出失败'
}

function toSessionSummary(result: SavedExportResult) {
  return {
    bookNames: result.manifest.books.map(book => book.name),
    createdAt: Date.now(),
    fileName: result.fileName,
    recordCount: totalRecords(result.manifest),
    sizeBytes: result.sizeBytes,
  }
}

export function BackupExportScreen() {
  const styles = useStyles()
  const navigation = useNavigation()
  const currentBookRef = useBookStore(state => state.currentBookRef)
  const setLastExport = useBackupSessionStore(state => state.setLastExport)
  const { data, loading } = useRequest(() => localApi.book.getAll())
  const books = data ?? []

  const [selectedIds, setSelectedIds] = useState<number[] | null>(null)
  const [includeImages, setIncludeImages] = useState(true)
  const [includeAgent, setIncludeAgent] = useState(false)
  const [busy, setBusy] = useState(false)
  const [errorText, setErrorText] = useState('')
  const [saved, setSaved] = useState<SavedExportResult | null>(null)

  useEffect(() => {
    if (selectedIds !== null || books.length === 0) return
    const currentId = currentBookRef?.kind === 'local' ? currentBookRef.id : books[0]?.id
    setSelectedIds(currentId ? [currentId] : [])
  }, [books, currentBookRef, selectedIds])

  const selectedBooks = useMemo(
    () => books.filter(book => selectedIds?.includes(book.id) ?? false),
    [books, selectedIds],
  )

  const toggleBook = useCallback((book: BookRow) => {
    setSelectedIds(current => {
      const values = current ?? []
      return values.includes(book.id)
        ? values.filter(id => id !== book.id)
        : [...values, book.id]
    })
  }, [])

  const handleExport = useCallback(async () => {
    if (!selectedIds || selectedIds.length === 0 || busy) return
    setBusy(true)
    setErrorText('')
    try {
      const result = await exportBooksToFile({
        bookIds: selectedIds,
        includeAgent,
        includeImages,
      })
      setLastExport(toSessionSummary(result))
      setSaved(result)
    } catch (error: unknown) {
      setErrorText(getErrorMessage(error))
    } finally {
      setBusy(false)
    }
  }, [busy, includeAgent, includeImages, selectedIds, setLastExport])

  if (saved) {
    return (
      <ScrollView contentContainerStyle={styles.content} scrollEnabled style={styles.container}>
        <Result
          status="success"
          titleText="备份已保存"
          subtitleText={`${saved.fileName} · ${formatBytes(saved.sizeBytes)}`}
          extra={
            <Column style={styles.resultActions}>
              <Button block onPress={() => navigation.goBack()} type="primary">
                完成
              </Button>
            </Column>
          }
        />
      </ScrollView>
    )
  }

  const canExport = (selectedIds?.length ?? 0) > 0 && !busy

  return (
    <ScrollView contentContainerStyle={styles.content} scrollEnabled style={styles.container}>
      <Card titleText="选择账本">
        {loading ? (
          <Text color="secondary" size="sm">正在读取本地账本…</Text>
        ) : books.length === 0 ? (
          <Text color="secondary" size="sm">没有可导出的本地账本。</Text>
        ) : (
          <Column style={styles.books}>
            {books.map(book => (
              <Checkbox
                key={book.id}
                value={selectedIds?.includes(book.id) ?? false}
                onChange={() => toggleBook(book)}
              >
                <Column style={styles.bookText}>
                  <Text>{book.name}</Text>
                  <Text color="secondary" size="sm">
                    {book.description || '本地账本'}
                  </Text>
                </Column>
              </Checkbox>
            ))}
          </Column>
        )}
      </Card>

      <Card titleText="包含内容">
        <Column style={styles.options}>
          <Row align="center" justify="between" gap="small">
            <Column style={styles.optionText}>
              <Text>图片附件</Text>
              <Text color="secondary" size="sm">账本封面与流水图片会打入备份包。</Text>
            </Column>
            <Switch
              accessibilityLabel="图片附件"
              onChange={setIncludeImages}
              value={includeImages}
            />
          </Row>
          <Row align="center" justify="between" gap="small">
            <Column style={styles.optionText}>
              <Text>AI 会话</Text>
              <Text color="secondary" size="sm">默认关闭；开启后包含会话、消息和消息中的图片。</Text>
            </Column>
            <Switch
              accessibilityLabel="AI 会话"
              onChange={setIncludeAgent}
              value={includeAgent}
            />
          </Row>
        </Column>
      </Card>

      <Card titleText="安全边界">
        <Column style={styles.note}>
          <Text color="secondary" size="sm">API Key、AI 提供商配置、服务器连接信息永不写入备份。</Text>
          <Text color="tertiary" size="xs">导入时只新建账本，不覆盖、不合并现有数据。</Text>
        </Column>
      </Card>

      {errorText ? (
        <Text color="errorText" size="sm" style={styles.error}>{errorText}</Text>
      ) : null}

      <Button
        block
        disabled={!canExport}
        loading={busy}
        onPress={handleExport}
        type="primary"
      >
        保存到文件
      </Button>
      <Text color="tertiary" size="xs" style={styles.error}>
        已选择 {selectedBooks.length} 个账本
      </Text>
    </ScrollView>
  )
}
