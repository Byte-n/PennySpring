import React from 'react'
import { ScrollView } from 'react-native'
import { Button, Card, Column, Text } from '@pennyspring/ui'
import { createUseSheetStyle } from '@pennyspring/ui'

import { formatBytes } from '../../features/transfer'
import { ROOT_ROUTES, useNavigation } from '../../navigation'
import { useBackupSessionStore } from '../../stores/backupSessionStore'

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
  cardContent: {
    gap: token.marginSM,
  },
  meta: {
    gap: token.marginXXS,
  },
  actions: {
    gap: token.marginXS,
    paddingTop: token.paddingXXS,
  },
  note: {
    gap: token.marginXXS,
  },
}))

export function BackupHomeScreen() {
  const styles = useStyles()
  const navigation = useNavigation()
  const lastExport = useBackupSessionStore(state => state.lastExport)

  return (
    <ScrollView
      scrollEnabled
      contentContainerStyle={styles.content}
      style={styles.container}
    >
      <Card titleText="最近备份" extra={<Text color="tertiary" size="xs">本次会话</Text>}>
        {lastExport ? (
          <Column gap="small">
            <Text weight="semibold">{lastExport.fileName}</Text>
            <Text color="secondary" size="sm">
              {lastExport.bookNames.join('、')} · {lastExport.recordCount.toLocaleString('zh-CN')} 条记录 · {formatBytes(lastExport.sizeBytes)}
            </Text>
            <Text color="tertiary" size="xs">
              {new Date(lastExport.createdAt).toLocaleString('zh-CN')}
            </Text>
          </Column>
        ) : (
          <Text color="secondary" size="sm">
            还没有导出记录。先选择一个本地账本生成快照。
          </Text>
        )}
      </Card>

      <Card titleText="账本快照" variant="elevated">
        <Column gap="small">
          <Text color="secondary" size="sm">
            完整导出本地账本的账本信息、资产、分类、标签、快捷模板和流水；图片可选，AI 会话默认关闭。导入时只新建账本，不覆盖现有数据。
          </Text>
          <Column style={styles.actions}>
            <Button
              block
              onPress={() => navigation.navigate(ROOT_ROUTES.BackupExport)}
              type="primary"
            >
              导出账本
            </Button>
            <Button
              block
              onPress={() => navigation.navigate(ROOT_ROUTES.BackupImport)}
              type="dashed"
            >
              导入备份
            </Button>
          </Column>
        </Column>
      </Card>

      <Card titleText="边界说明">
        <Column style={styles.note}>
          <Text size="sm" color="secondary">包含：账本信息、资产、分类、标签、快捷模板、流水、可选图片、可选 AI 会话。</Text>
          <Text size="sm" color="secondary">不包含：API Key、AI 提供商配置、服务器连接信息。</Text>
          <Text size="sm" color="tertiary">网络账本不在一期导出范围内。</Text>
        </Column>
      </Card>
    </ScrollView>
  )
}
