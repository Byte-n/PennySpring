import React, { useCallback, useRef } from 'react';
import { ScrollView } from 'react-native';
import { Column, Text, createUseSheetStyle } from '@pennyspring/ui';

import { ThinkingBlock } from '../../../../agent/ui/ThinkingBlock';
import { ToolStatusNote } from '../../../../agent/ui/ToolStatusNote';
import { MarkdownText } from '../../../../component/MarkdownText';
import type { QuickBookDraftProgressPart } from '../../../../features/quickBookDraft/draftProgress';

const DRAFT_STREAM_MAX_HEIGHT = 140;

const useStyles = createUseSheetStyle(token => ({
  stream: {
    maxHeight: DRAFT_STREAM_MAX_HEIGHT,
    backgroundColor: token.colorFillQuaternary,
    borderRadius: token.borderRadiusLG,
  },
  content: {
    gap: token.marginXXS,
    paddingHorizontal: token.paddingSM,
    paddingVertical: token.paddingXS,
  },
  toolGroup: {
    gap: token.marginXXS,
  },
}));

interface DraftAgentStreamProps {
  parts: readonly QuickBookDraftProgressPart[];
}

export function DraftAgentStream({
  parts,
}: DraftAgentStreamProps): React.ReactElement | null {
  const styles = useStyles();
  const scrollRef = useRef<ScrollView>(null);
  const handleContentSizeChange = useCallback((): void => {
    scrollRef.current?.scrollToEnd({ animated: false });
  }, []);

  if (parts.length === 0) {
    return null;
  }

  return (
    <ScrollView
      contentContainerStyle={styles.content}
      nestedScrollEnabled
      onContentSizeChange={handleContentSizeChange}
      ref={scrollRef}
      showsVerticalScrollIndicator={false}
      style={styles.stream}
    >
      {parts.map((part, index) => {
        if (part.type === 'reasoning') {
          return (
            <ThinkingBlock
              key={`reasoning-${index}`}
              status={{ type: part.isDone ? 'complete' : 'running' }}
              text={part.text}
            />
          );
        }
        if (part.type === 'text') {
          return (
            <MarkdownText
              content={part.text}
              key={`text-${index}`}
              selectable
            />
          );
        }
        const summary = part.summary?.trim() ?? '';
        const itemCount = part.itemCount ?? 0;
        return (
          <Column key={`tool-${index}`} style={styles.toolGroup}>
            {summary ? <MarkdownText content={summary} selectable /> : null}
            {itemCount > 0 ? (
              <Text color="tertiary" size="xs">
                {`已识别 ${itemCount} 笔`}
              </Text>
            ) : null}
            <ToolStatusNote status={part.status} toolName={part.toolName} />
          </Column>
        );
      })}
    </ScrollView>
  );
}
