import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ScrollView, View } from 'react-native';
import {
  Button,
  Column,
  Empty,
  Input,
  Loading,
  Popup,
  Row,
  Text,
  useToast,
} from '@pennyspring/ui';
import { createUseSheetStyle } from '@pennyspring/theme';
import {
  ClockCounterClockwiseIcon,
  GearSixIcon,
  PaperPlaneTiltIcon,
  StopIcon,
} from 'phosphor-react-native';

import type { AgentDisplayMessage } from '../core/types';
import type { AgentChatState } from './useAgentChat';
import { MarkdownText } from '../../component/MarkdownText';
import { appendTranscript } from '../voice/transcript';
import { useVoiceInput } from '../voice/useVoiceInput';
import { VoiceButton } from './VoiceButton';

const SUGGESTIONS = [
  '上个月吃饭花了多少？',
  '这个月支出按类型统计',
  '最近有哪些转账记录？',
];

const THINKING_TEXT = '思考中…';
const QUERIED_TEXT = '已查询账本数据';

const useStyles = createUseSheetStyle(token => ({
  panelBody: {
    padding: 0,
  },
  container: {
    flex: 1,
  },
  notice: {
    alignItems: 'center',
    backgroundColor: token.colorWarningBg,
    flexDirection: 'row',
    gap: token.marginXS,
    paddingHorizontal: token.padding,
    paddingVertical: token.paddingXS,
  },
  error: {
    backgroundColor: token.colorErrorBg,
    paddingHorizontal: token.padding,
    paddingVertical: token.paddingXS,
  },
  list: {
    flex: 1,
  },
  listContent: {
    gap: token.marginSM,
    padding: token.padding,
    paddingBottom: token.paddingSM,
  },
  messageRow: {
    flexDirection: 'row',
  },
  userRow: {
    justifyContent: 'flex-end',
  },
  bubble: {
    borderRadius: token.borderRadiusLG,
    gap: token.marginXXS,
    maxWidth: '92%',
    paddingHorizontal: token.paddingSM,
    paddingVertical: token.paddingXS,
  },
  userBubble: {
    backgroundColor: token.colorPrimary,
  },
  assistantBubble: {
    backgroundColor: token.colorFillTertiary,
  },
  toolNote: {
    color: token.colorTextTertiary,
  },
  suggestions: {
    gap: token.marginSM,
    paddingTop: token.paddingXS,
  },
  suggestion: {
    alignSelf: 'flex-start',
  },
  thinking: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: token.marginXS,
    paddingVertical: token.paddingXXS,
  },
  composer: {
    borderTopColor: token.colorBorderSecondary,
    borderTopWidth: token.lineWidth,
    paddingBottom: token.padding,
    paddingHorizontal: token.padding,
    paddingTop: token.paddingSM,
  },
  inputWrap: {
    flex: 1,
  },
}));

interface MessageItemProps {
  message: AgentDisplayMessage;
}

function AssistantBubble({
  content,
  selectable,
  note,
}: {
  content: string;
  selectable?: boolean;
  note?: React.ReactNode;
}): React.ReactElement {
  const styles = useStyles();

  return (
    <Row justify="start">
      <View style={[styles.bubble, styles.assistantBubble]}>
        <MarkdownText content={content} selectable={selectable} />
        {note}
      </View>
    </Row>
  );
}

function MessageItem({ message }: MessageItemProps): React.ReactElement | null {
  const styles = useStyles();

  if (message.role === 'user') {
    return (
      <Row justify="end">
        <View style={[styles.bubble, styles.userBubble]}>
          <Text color="lightSolid" size="sm">
            {message.content}
          </Text>
        </View>
      </Row>
    );
  }

  if (message.role !== 'assistant') {
    return null;
  }

  const hasText = message.content.trim().length > 0;
  const hasToolCalls = message.hasToolCalls;

  if (!hasText && !hasToolCalls) {
    return null;
  }

  return (
    <AssistantBubble
      content={message.content}
      selectable={hasText}
      note={
        hasToolCalls ? (
          <Text size="xs" style={styles.toolNote}>
            {QUERIED_TEXT}
          </Text>
        ) : null
      }
    />
  );
}

export interface AgentDrawerProps {
  open: boolean;
  configured: boolean;
  chat: AgentChatState;
  onOpenChange: (open: boolean) => void;
  onOpenSessions: () => void;
  onOpenSettings: () => void;
}

export function AgentDrawer({
  open,
  configured,
  chat,
  onOpenChange,
  onOpenSessions,
  onOpenSettings,
}: AgentDrawerProps) {
  const styles = useStyles();
  const scrollRef = useRef<ScrollView>(null);
  const [draft, setDraft] = useState('');
  const toast = useToast();

  const voice = useVoiceInput({
    onComplete: text => {
      setDraft(previous => appendTranscript(previous, text));
    },
    onError: message => {
      toast.show({ messageText: message, status: 'error' });
    },
  });

  const scrollToEnd = useCallback((): void => {
    scrollRef.current?.scrollToEnd({ animated: true });
  }, []);

  useEffect(() => {
    if (open) {
      scrollToEnd();
    }
  }, [
    chat.activeTool,
    chat.loading,
    chat.messages,
    chat.streamingText,
    open,
    scrollToEnd,
  ]);

  const handleSend = useCallback((): void => {
    const text = draft.trim();
    if (!text) {
      return;
    }
    setDraft('');
    chat.send(text).catch(() => undefined);
  }, [chat, draft]);

  const handleSuggestion = useCallback(
    (text: string): void => {
      if (!configured) {
        onOpenSettings();
        return;
      }
      chat.send(text).catch(() => undefined);
    },
    [chat, configured, onOpenSettings],
  );

  const isStreaming = chat.sending;
  const showThinking =
    isStreaming && chat.streamingText.length === 0 && chat.activeTool === null;
  const hasConversation = chat.messages.some(
    message =>
      message.role === 'user' ||
      (message.role === 'assistant' &&
        (message.content.trim().length > 0 || message.hasToolCalls)),
  );

  return (
    <Popup.FloatingPanel
      bodyScrollable={false}
      height="82%"
      keyboardAvoiding
      maxHeight="95%"
      minHeight="45%"
      onOpenChange={onOpenChange}
      open={open}
      position="bottom"
      renderFooter={null}
      renderHeaderRight={() => (
        <Row align="center" gap="normal">
          <Button
            icon={ClockCounterClockwiseIcon}
            onPress={onOpenSessions}
            shape="circle"
            size="small"
            testID="agent-sessions-button"
            type="text"
          />
          <Button
            icon={GearSixIcon}
            onPress={onOpenSettings}
            shape="circle"
            size="small"
            testID="agent-settings-button"
            type="text"
          />
        </Row>
      )}
      styles={{ panelBody: styles.panelBody }}
      titleText="记账助手"
    >
      <Column style={styles.container}>
        {configured ? null : (
          <Row style={styles.notice}>
            <Text color="warningText" size="xs">
              尚未配置助手，请先添加一个 AI 提供商。
            </Text>
            <Button
              onPress={onOpenSettings}
              size="small"
              testID="agent-notice-settings-button"
              type="text"
            >
              去设置
            </Button>
          </Row>
        )}

        {chat.errorText ? (
          <View style={styles.error}>
            <Text color="errorText" size="xs">
              {chat.errorText}
            </Text>
          </View>
        ) : null}

        <ScrollView
          contentContainerStyle={styles.listContent}
          keyboardDismissMode="interactive"
          keyboardShouldPersistTaps="handled"
          onContentSizeChange={scrollToEnd}
          ref={scrollRef}
          style={styles.list}
        >
          {chat.loading ? <Loading size="small" text="正在读取对话…" /> : null}

          {!chat.loading && !hasConversation ? (
            <Column style={styles.suggestions}>
              <Empty descriptionText="记账遇到问题，可以直接问我。" size="normal" />
              {SUGGESTIONS.map((text, index) => (
                <Button
                  key={text}
                  onPress={() => handleSuggestion(text)}
                  size="small"
                  style={styles.suggestion}
                  testID={`agent-suggestion-${index}`}
                  type="default"
                  variant="filled"
                >
                  {text}
                </Button>
              ))}
            </Column>
          ) : null}

          {chat.messages.map((message, index) => (
            <MessageItem key={`${index}-${message.role}`} message={message} />
          ))}

          {isStreaming && chat.streamingText ? (
            <AssistantBubble content={chat.streamingText} />
          ) : null}

          {showThinking ? (
            <Loading size="small" text={THINKING_TEXT} />
          ) : null}

          {chat.activeTool ? (
            <Row style={styles.thinking}>
              <Loading size="small" />
              <Text color="secondary" size="xs">
                {chat.activeTool}
              </Text>
            </Row>
          ) : null}
        </ScrollView>

        <Row align="center" gap="small" style={styles.composer}>
          <Column style={styles.inputWrap}>
            <Input
              blurOnSubmit={false}
              onChange={setDraft}
              onSubmitEditing={handleSend}
              placeholder="问问这个月的开销…"
              returnKeyType="send"
              size="small"
              testID="agent-input"
              value={draft}
            />
          </Column>
          <VoiceButton
            disabled={isStreaming}
            onStart={voice.start}
            onStop={voice.stop}
            partialText={voice.partialText}
            status={voice.status}
          />
          {isStreaming ? (
            <Button
              icon={StopIcon}
              onPress={chat.stop}
              shape="circle"
              size="small"
              testID="agent-stop-button"
              type="default"
            />
          ) : (
            <Button
              disabled={!draft.trim()}
              icon={PaperPlaneTiltIcon}
              onPress={handleSend}
              shape="circle"
              size="small"
              testID="agent-send-button"
              type="primary"
            />
          )}
        </Row>
      </Column>
    </Popup.FloatingPanel>
  );
}
