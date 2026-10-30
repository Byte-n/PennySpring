import React, { useCallback } from 'react';
import { ScrollView } from 'react-native';
import type { StyleProp, ViewStyle } from 'react-native';
import {
  Empty,
  Icon,
  Loading,
  Row,
  SwipeAction,
  Text,
} from '@pennyspring/ui';
import type { AgentThreadRow } from '@pennyspring/api';
import { createUseSheetStyle, useTheme } from '@pennyspring/theme';
import { ChatsCircleIcon, CaretRightIcon } from 'phosphor-react-native';

import { ManageCard, ManageRow } from '../../components/ManageRow';
import { formatThreadTime, getThreadTitle } from './chatModel';

const CURRENT_LABEL = '当前';

const useStyles = createUseSheetStyle(token => ({
  container: {
    flex: 1,
  },
  content: {
    gap: token.marginSM,
    paddingBottom: token.paddingXL,
  },
  metaLine: {
    paddingHorizontal: token.paddingXXS,
  },
  hint: {
    paddingHorizontal: token.paddingXXS,
  },
  currentLabel: {
    paddingHorizontal: token.paddingXXS,
  },
}));

export interface AgentSessionListProps {
  threads: AgentThreadRow[];
  currentThreadId: number | null;
  loading?: boolean;
  disabled?: boolean;
  contentStyle?: StyleProp<ViewStyle>;
  onSelect: (thread: AgentThreadRow) => void;
  onDelete: (thread: AgentThreadRow) => void;
}

export function AgentSessionList({
  threads,
  currentThreadId,
  loading = false,
  disabled = false,
  contentStyle,
  onSelect,
  onDelete,
}: AgentSessionListProps) {
  const { token } = useTheme();
  const styles = useStyles();

  const renderRow = useCallback(
    (thread: AgentThreadRow, index: number) => {
      const isCurrent = thread.id === currentThreadId;
      const row = (
        <ManageRow
          hasDivider={index > 0}
          icon={<Icon color="secondary" icon={ChatsCircleIcon} size="large" />}
          isCurrent={isCurrent}
          onPress={disabled ? undefined : () => onSelect(thread)}
          subtitle={formatThreadTime(thread.updatedTime)}
          title={getThreadTitle(thread)}
          trailing={
            isCurrent ? (
              <Text
                color="primaryText"
                size="xs"
                style={styles.currentLabel}
                weight="semibold"
              >
                {CURRENT_LABEL}
              </Text>
            ) : (
              <Icon color="quaternary" icon={CaretRightIcon} size="normal" />
            )
          }
        />
      );

      return (
        <SwipeAction
          key={thread.id}
          rightActions={[
            {
              key: 'delete',
              actionText: '删除',
              color: 'danger',
              disabled,
              onPress: () => onDelete(thread),
            },
          ]}
        >
          {row}
        </SwipeAction>
      );
    },
    [currentThreadId, disabled, onDelete, onSelect, styles.currentLabel],
  );

  if (loading && threads.length === 0) {
    return <Loading size="small" text="正在读取会话…" />;
  }

  if (threads.length === 0) {
    return (
      <Empty
        descriptionText="发一条消息后，会话会自动出现在这里。"
        titleText="还没有会话"
      />
    );
  }

  return (
    <ScrollView
      contentContainerStyle={[styles.content, contentStyle]}
      showsVerticalScrollIndicator={false}
      style={styles.container}
    >
      <Row style={styles.metaLine} gap={token.marginXXS} align="center">
        <Text color="tertiary" size="xs">
          共
        </Text>
        <Text color="secondary" size="xs" weight="semibold">
          {threads.length}
        </Text>
        <Text color="tertiary" size="xs">
          个会话
        </Text>
      </Row>

      <ManageCard>{threads.map(renderRow)}</ManageCard>

      <Text size="xs" style={styles.hint} color="tertiary" textAlign="center">
        轻点会话恢复对话 · 左滑删除
      </Text>
    </ScrollView>
  );
}
