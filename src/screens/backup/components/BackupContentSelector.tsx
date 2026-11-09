import React, { useMemo } from 'react';
import {
  Button,
  Card,
  Checkbox,
  Column,
  Row,
  Switch,
  Text,
  createUseSheetStyle,
  type CheckboxGroupOption,
} from '@pennyspring/ui';
import type { BookRow } from '@pennyspring/api';

import type { BookContentOptions } from '../../../features/transfer/types';

interface BackupContentSelectorProps {
  books: BookRow[];
  error?: boolean;
  loading?: boolean;
  onRetry?: () => void;
  selectedBookIds: number[];
  bookOptions: Record<number, BookContentOptions>;
  defaultBookOptions: BookContentOptions;
  includeSettings: boolean;
  includeNetworkBooks: boolean;
  showSelectAll?: boolean;
  onSelectedBookIdsChange: (bookIds: number[]) => void;
  onBookOptionsChange: (bookId: number, options: BookContentOptions) => void;
  onIncludeSettingsChange: (value: boolean) => void;
  onIncludeNetworkBooksChange: (value: boolean) => void;
}

const BOOK_OPTIONS: CheckboxGroupOption[] = [
  { label: '图片', value: 'images' },
  { label: 'AI 会话', value: 'agent' },
  { label: 'AI 设置', value: 'aiConfig' },
];

const useStyles = createUseSheetStyle(token => ({
  content: {
    gap: token.marginSM,
  },
  books: {
    gap: token.marginSM,
  },
  book: {
    gap: token.marginXS,
  },
  bookText: {
    flex: 1,
    gap: token.marginXXS,
  },
  hint: {
    gap: token.marginXXS,
  },
  error: {
    gap: token.marginXXS,
  },
}));

function toOptionValues(options: BookContentOptions): string[] {
  const values: string[] = [];
  if (options.includeImages) values.push('images');
  if (options.includeAgent) values.push('agent');
  if (options.includeAiConfig) values.push('aiConfig');
  return values;
}

function fromOptionValues(values: string[]): BookContentOptions {
  return {
    includeImages: values.includes('images'),
    includeAgent: values.includes('agent'),
    includeAiConfig: values.includes('aiConfig'),
  };
}

export function BackupContentSelector({
  books,
  error = false,
  loading = false,
  onRetry,
  selectedBookIds,
  bookOptions,
  defaultBookOptions,
  includeSettings,
  includeNetworkBooks,
  showSelectAll = false,
  onSelectedBookIdsChange,
  onBookOptionsChange,
  onIncludeSettingsChange,
  onIncludeNetworkBooksChange,
}: BackupContentSelectorProps) {
  const styles = useStyles();
  const selectedIds = useMemo(
    () => new Set(selectedBookIds),
    [selectedBookIds],
  );
  const allSelected =
    books.length > 0 && selectedBookIds.length === books.length;

  const toggleBook = (bookId: number, selected: boolean): void => {
    onSelectedBookIdsChange(
      selected
        ? [...selectedBookIds, bookId]
        : selectedBookIds.filter(id => id !== bookId),
    );
  };

  return (
    <>
      <Card titleText="账本内容">
        <Column style={styles.content}>
          {showSelectAll ? (
            <Row align="center" justify="between" gap="small">
              <Column style={styles.bookText}>
                <Text>全部本地账本</Text>
                <Text color="secondary" size="sm">
                  关闭后可逐本选择。
                </Text>
              </Column>
              <Switch
                accessibilityLabel="全部本地账本"
                onChange={value =>
                  onSelectedBookIdsChange(
                    value ? books.map(book => book.id) : [],
                  )
                }
                value={allSelected}
              />
            </Row>
          ) : null}

          {loading ? (
            <Text color="secondary" size="sm">
              正在读取本地账本…
            </Text>
          ) : error ? (
            <Column style={styles.error}>
              <Text color="errorText" size="sm">
                本地账本加载失败。
              </Text>
              <Button
                onPress={onRetry}
                size="small"
                testID="backup-content-books-retry"
                type="text"
              >
                重试
              </Button>
            </Column>
          ) : books.length === 0 ? (
            <Text color="secondary" size="sm">
              没有本地账本。
            </Text>
          ) : (
            <Column style={styles.books}>
              {books.map(book => {
                const selected = selectedIds.has(book.id);
                const content = bookOptions[book.id] ?? defaultBookOptions;
                return (
                  <Column key={book.id} style={styles.book}>
                    <Checkbox
                      onChange={value => toggleBook(book.id, value)}
                      value={selected}
                    >
                      <Column style={styles.bookText}>
                        <Text size="sm">{book.name}</Text>
                        <Text color="tertiary" size="xs">
                          {book.description || '本地账本'}
                        </Text>
                      </Column>
                    </Checkbox>
                    {selected ? (
                      <Checkbox.Group
                        displayType="button"
                        options={BOOK_OPTIONS}
                        size="small"
                        value={toOptionValues(content)}
                        onChange={values =>
                          onBookOptionsChange(
                            book.id,
                            fromOptionValues(values.map(String)),
                          )
                        }
                      />
                    ) : null}
                  </Column>
                );
              })}
            </Column>
          )}

          <Column style={styles.hint}>
            <Text color="tertiary" size="xs">
              AI 设置包含提供商、模型选择与当前账本 API
              Key；导出的文件请妥善保管。
            </Text>
          </Column>
        </Column>
      </Card>

      <Card titleText="系统设置">
        <Column style={styles.content}>
          <Checkbox onChange={onIncludeSettingsChange} value={includeSettings}>
            设置包（快捷记账与主题）
          </Checkbox>
          <Checkbox
            onChange={onIncludeNetworkBooksChange}
            value={includeNetworkBooks}
          >
            网络账本列表（含访问令牌）
          </Checkbox>
          <Text color="tertiary" size="xs">
            网络账本列表包含服务器地址与访问令牌，导出后请妥善保管。
          </Text>
        </Column>
      </Card>
    </>
  );
}
