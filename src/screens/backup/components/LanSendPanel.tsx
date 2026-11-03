import React from 'react';
import {
  Button,
  Card,
  Checkbox,
  Column,
  Loading,
  Row,
  Switch,
  Text,
  createUseSheetStyle,
} from '@pennyspring/ui';
import type { BookRow } from '@pennyspring/api';

interface LanSendPanelProps {
  books: BookRow[];
  loading: boolean;
  selectedIds: number[];
  includeImages: boolean;
  includeAgent: boolean;
  busy: boolean;
  onToggleBook: (bookId: number) => void;
  onIncludeImagesChange: (value: boolean) => void;
  onIncludeAgentChange: (value: boolean) => void;
  onSend: () => void;
}

const useStyles = createUseSheetStyle(token => ({
  root: {
    gap: token.marginSM,
  },
  cardContent: {
    gap: token.marginXS,
  },
  bookRow: {
    paddingVertical: token.paddingXXS,
  },
  bookText: {
    gap: token.marginXXS,
  },
  switchRow: {
    alignItems: 'center' as const,
    gap: token.marginSM,
    paddingVertical: token.paddingXXS,
  },
  switchText: {
    flex: 1,
    gap: token.marginXXS,
  },
  summary: {
    paddingHorizontal: token.paddingXXS,
  },
  note: {
    gap: token.marginXXS,
  },
}));

export function LanSendPanel({
  books,
  loading,
  selectedIds,
  includeImages,
  includeAgent,
  busy,
  onToggleBook,
  onIncludeImagesChange,
  onIncludeAgentChange,
  onSend,
}: LanSendPanelProps) {
  const styles = useStyles();

  return (
    <Column style={styles.root}>
      <Card titleText="发送内容">
        {loading ? (
          <Loading text="正在读取本地账本" variant="inline" />
        ) : books.length === 0 ? (
          <Text color="tertiary" size="sm">
            当前没有可发送的本地账本。
          </Text>
        ) : (
          <Column style={styles.cardContent}>
            {books.map(book => (
              <Checkbox
                key={book.id}
                onChange={() => onToggleBook(book.id)}
                value={selectedIds.includes(book.id)}
              >
                <Column style={[styles.bookRow, styles.bookText]}>
                  <Text size="sm">{book.name}</Text>
                  <Text color="tertiary" size="xs">
                    {book.description || '本地账本'}
                  </Text>
                </Column>
              </Checkbox>
            ))}
          </Column>
        )}
      </Card>

      <Card titleText="包含内容">
        <Column style={styles.cardContent}>
          <Row justify="between" style={styles.switchRow}>
            <Column style={styles.switchText}>
              <Text size="sm">图片附件</Text>
              <Text color="tertiary" size="xs">
                账本封面与流水图片
              </Text>
            </Column>
            <Switch onChange={onIncludeImagesChange} value={includeImages} />
          </Row>
          <Row justify="between" style={styles.switchRow}>
            <Column style={styles.switchText}>
              <Text size="sm">AI 会话</Text>
              <Text color="tertiary" size="xs">
                默认关闭；不包含 API Key
              </Text>
            </Column>
            <Switch onChange={onIncludeAgentChange} value={includeAgent} />
          </Row>
        </Column>
      </Card>

      <Row justify="between" style={styles.summary}>
        <Text color="tertiary" size="sm">
          已选择
        </Text>
        <Text size="sm" weight="semibold">
          {selectedIds.length} 个账本
        </Text>
      </Row>

      <Button
        block
        disabled={busy || selectedIds.length === 0}
        loading={busy}
        onPress={onSend}
        type="primary"
      >
        发送账本
      </Button>
      <Column style={styles.note}>
        <Text color="tertiary" size="xs">
          对方确认账本范围和大小后才开始传输。
        </Text>
        <Text color="tertiary" size="xs">
          导入只新建账本，不覆盖现有数据。
        </Text>
      </Column>
    </Column>
  );
}
