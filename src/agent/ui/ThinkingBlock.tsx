import React, { useCallback, useEffect, useState } from 'react';
import { Pressable } from 'react-native';
import type { ReasoningMessagePartProps } from '@assistant-ui/react-native';
import { Column, Icon, Row, Text } from '@pennyspring/ui';
import { createUseSheetStyle, useTheme } from '@pennyspring/ui';

import { agentDebugLog } from '../core/debug';
import { THINKING_LABEL, THINKING_TEXT } from './copy';

const useStyles = createUseSheetStyle(token => ({
  header: {
    paddingVertical: token.paddingXXS,
  },
  body: {
    borderLeftColor: token.colorBorderSecondary,
    borderLeftWidth: token.lineWidthBold,
    paddingStart: token.paddingXS,
  },
}));

export type ThinkingBlockProps = Pick<
  ReasoningMessagePartProps,
  'status' | 'text'
>;

export function ThinkingBlock({
  status,
  text,
}: ThinkingBlockProps): React.ReactElement | null {
  const { token } = useTheme();
  const styles = useStyles();
  const [isExpanded, setIsExpanded] = useState(false);

  const handleToggle = useCallback((): void => {
    setIsExpanded(value => !value);
  }, []);

  useEffect(() => {
    agentDebugLog('ui', 'thinking-block', {
      status: status.type,
      length: text.length,
      expanded: isExpanded,
    });
  }, [isExpanded, status.type, text.length]);

  if (text.trim().length === 0) {
    return null;
  }

  const label = status.type === 'running' ? THINKING_TEXT : THINKING_LABEL;

  return (
    <Column gap="small">
      <Pressable
        hitSlop={token.paddingXXS}
        onPress={handleToggle}
        testID="agent-thinking-toggle"
      >
        <Row align="center" gap="small" style={styles.header}>
          <Icon
            color="tertiary"
            icon={isExpanded ? 'caret-down' : 'caret-right'}
            size="small"
          />
          <Text color="secondary" size="xs">
            {label}
          </Text>
        </Row>
      </Pressable>
      {isExpanded ? (
        <Column style={styles.body}>
          <Text color="secondary" selectable size="xs">
            {text}
          </Text>
        </Column>
      ) : null}
    </Column>
  );
}
