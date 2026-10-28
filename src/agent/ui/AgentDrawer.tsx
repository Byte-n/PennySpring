import React, { useCallback } from 'react';
import type { UIMessage } from 'ai';
import { useAISDKChat } from '@assistant-ui/ai-sdk';
import {
  MessagePrimitive,
  ThreadPrimitive,
  useAui,
  useAuiState,
  type MessageState,
  type ToolCallMessagePartProps,
} from '@assistant-ui/react-native';
import {
  Button,
  Column,
  Empty,
  Icon,
  Loading,
  Row,
  Text,
  Textarea,
  useToast,
} from '@pennyspring/ui';
import { createUseSheetStyle } from '@pennyspring/theme';
import {
  CheckCircleIcon,
  PaperPlaneTiltIcon,
  StopIcon,
  WarningCircleIcon,
} from 'phosphor-react-native';

import { MarkdownText } from '../../component/MarkdownText';
import { appendTranscript } from '../voice/transcript';
import { useVoiceInput } from '../voice/useVoiceInput';
import { AgentDrawerFrame } from './AgentDrawerFrame';
import { VoiceButton } from './VoiceButton';
import {
  THINKING_TEXT,
  toolErrorText,
  toolStatusText,
} from './copy';
import type { AgentSessionState } from './useAgentSession';

const SUGGESTIONS = [
  '上个月吃饭花了多少？',
  '这个月支出按类型统计',
  '最近有哪些转账记录？',
];

const useStyles = createUseSheetStyle(token => ({
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
    flexGrow: 1,
    gap: token.marginSM,
    padding: token.padding,
    paddingBottom: token.paddingSM,
  },
  empty: {
    gap: token.marginSM,
    paddingTop: token.paddingXS,
  },
  suggestion: {
    alignSelf: 'flex-start',
  },
  userRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  assistantRow: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
  },
  userBubble: {
    backgroundColor: token.colorPrimary,
    borderRadius: token.borderRadiusLG,
    gap: token.marginXXS,
    maxWidth: '88%',
    paddingHorizontal: token.paddingSM,
    paddingVertical: token.paddingXS,
  },
  assistantBubble: {
    backgroundColor: token.colorFillQuaternary,
    borderRadius: token.borderRadiusLG,
    gap: token.marginXXS,
    maxWidth: '100%',
    paddingHorizontal: token.paddingSM,
    paddingVertical: token.paddingXS,
  },
  toolStatus: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: token.marginXXS,
    paddingVertical: token.paddingXXS,
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
  composerRow: {
    alignItems: 'flex-end',
    flexDirection: 'row',
    gap: token.marginXS,
  },
  inputWrap: {
    flex: 1,
  },
}));

function ToolNote({
  status,
  isError,
  toolName,
}: ToolCallMessagePartProps): React.ReactElement {
  const styles = useStyles();

  if (isError || status.type === 'incomplete') {
    return (
      <Row style={styles.toolStatus}>
        <Icon color="errorText" icon={WarningCircleIcon} size="small" />
        <Text color="errorText" size="xs">
          {toolErrorText(toolName)}
        </Text>
      </Row>
    );
  }

  if (status.type === 'running') {
    return (
      <Row style={styles.toolStatus}>
        <Loading size="small" />
        <Text color="secondary" size="xs">
          {toolStatusText(toolName, false)}
        </Text>
      </Row>
    );
  }

  return (
    <Row style={styles.toolStatus}>
      <Icon color="tertiary" icon={CheckCircleIcon} size="small" />
      <Text color="tertiary" size="xs">
        {toolStatusText(toolName, true)}
      </Text>
    </Row>
  );
}

function MarkdownPart({ text }: { text: string }): React.ReactElement {
  return <MarkdownText content={text} selectable />;
}

const ASSISTANT_COMPONENTS = {
  Text: MarkdownPart,
  tools: { Fallback: ToolNote },
};

function AgentMessageRow({
  role,
}: {
  role: MessageState['role'];
}): React.ReactElement | null {
  const styles = useStyles();
  const hasVisiblePart = useAuiState(state =>
    state.message.parts.some(
      part =>
        (part.type === 'text' && part.text.trim().length > 0) ||
        part.type === 'tool-call',
    ),
  );

  if (!hasVisiblePart) {
    return null;
  }

  if (role === 'user') {
    return (
      <Row style={styles.userRow}>
        <Column style={styles.userBubble}>
          <MessagePrimitive.Content
            renderText={({ part }) => (
              <Text color="lightSolid" size="sm">
                {part.text}
              </Text>
            )}
          />
        </Column>
      </Row>
    );
  }

  if (role !== 'assistant') {
    return null;
  }

  return (
    <Row style={styles.assistantRow}>
      <Column style={styles.assistantBubble}>
        <MessagePrimitive.Parts components={ASSISTANT_COMPONENTS} />
      </Column>
    </Row>
  );
}

function ThinkingFooter(): React.ReactElement | null {
  const styles = useStyles();
  const showThinking = useAuiState(state => {
    if (!state.thread.isRunning) {
      return false;
    }
    const messages = state.thread.messages;
    const last = messages[messages.length - 1];
    if (!last || last.role !== 'assistant') {
      return true;
    }
    return !last.parts.some(
      part =>
        (part.type === 'text' && part.text.trim().length > 0) ||
        part.type === 'tool-call',
    );
  });

  if (!showThinking) {
    return null;
  }

  return (
    <Row style={styles.thinking}>
      <Loading size="small" />
      <Text color="secondary" size="xs">
        {THINKING_TEXT}
      </Text>
    </Row>
  );
}

interface EmptyConversationProps {
  onSuggestion: (text: string) => void;
}

function EmptyConversation({
  onSuggestion,
}: EmptyConversationProps): React.ReactElement {
  const styles = useStyles();

  return (
    <Column style={styles.empty}>
      <Empty descriptionText="记账遇到问题，可以直接问我。" size="normal" />
      {SUGGESTIONS.map((text, index) => (
        <Button
          key={text}
          onPress={() => onSuggestion(text)}
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
  );
}

function AgentComposer(): React.ReactElement {
  const styles = useStyles();
  const toast = useToast();
  const aui = useAui();
  const text = useAuiState(state => state.composer.text);
  const canSend = useAuiState(state => state.composer.canSend);
  const isRunning = useAuiState(state => state.thread.isRunning);

  const voice = useVoiceInput({
    onComplete: transcript => {
      aui.composer.setText(appendTranscript(text, transcript), {
        origin: 'user',
      });
    },
    onError: message => {
      toast.show({ messageText: message, status: 'error' });
    },
  });

  const handleChange = useCallback(
    (value: string): void => {
      aui.composer.setText(value, { origin: 'user' });
    },
    [aui],
  );

  const handleSend = useCallback((): void => {
    if (!canSend || !text.trim()) {
      return;
    }
    aui.composer.send();
  }, [aui, canSend, text]);

  const handleStop = useCallback((): void => {
    aui.composer.cancel();
  }, [aui]);

  return (
    <Column style={styles.composer}>
      <Row style={styles.composerRow}>
        <Column style={styles.inputWrap}>
          <Textarea
            maxRows={4}
            minRows={1}
            onChangeText={handleChange}
            placeholder="问问这个月的开销…"
            size="small"
            testID="agent-input"
            value={text}
          />
        </Column>
        <VoiceButton
          disabled={isRunning}
          onStart={voice.start}
          onStop={voice.stop}
          partialText={voice.partialText}
          status={voice.status}
        />
        {isRunning ? (
          <Button
            icon={StopIcon}
            onPress={handleStop}
            shape="circle"
            size="small"
            testID="agent-stop-button"
            type="default"
          />
        ) : (
          <Button
            disabled={!canSend || !text.trim()}
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
  );
}

export interface AgentDrawerProps {
  open: boolean;
  configured: boolean;
  session: AgentSessionState;
  runtimeErrorText: string;
  onOpenChange: (open: boolean) => void;
  onOpenSessions: () => void;
  onOpenSettings: () => void;
}

export function AgentDrawer({
  open,
  configured,
  session,
  runtimeErrorText,
  onOpenChange,
  onOpenSessions,
  onOpenSettings,
}: AgentDrawerProps): React.ReactElement {
  const styles = useStyles();
  const aui = useAui();
  const aiChat = useAISDKChat<UIMessage>();

  const handleSuggestion = useCallback(
    (text: string): void => {
      if (!configured) {
        onOpenSettings();
        return;
      }
      if (aiChat) {
        aiChat.sendMessage({ text }).catch(() => undefined);
        return;
      }
      aui.composer.setText(text, { origin: 'user' });
      aui.composer.send();
    },
    [aiChat, aui, configured, onOpenSettings],
  );

  const renderMessage = useCallback(
    ({ message }: { message: MessageState }) => (
      <AgentMessageRow role={message.role} />
    ),
    [],
  );

  const errorText = session.errorText || runtimeErrorText;

  return (
    <AgentDrawerFrame
      onOpenChange={onOpenChange}
      onOpenSessions={onOpenSessions}
      onOpenSettings={onOpenSettings}
      open={open}
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

        {errorText ? (
          <Column style={styles.error}>
            <Text color="errorText" size="xs">
              {errorText}
            </Text>
          </Column>
        ) : null}

        <ThreadPrimitive.MessagesFlatList
          ListEmptyComponent={
            <EmptyConversation onSuggestion={handleSuggestion} />
          }
          ListFooterComponent={<ThinkingFooter />}
          autoScroll
          contentContainerStyle={styles.listContent}
          keyboardDismissMode="interactive"
          keyboardShouldPersistTaps="handled"
          scrollToBottomOnRunStart
          style={styles.list}
        >
          {renderMessage}
        </ThreadPrimitive.MessagesFlatList>

        <AgentComposer />
      </Column>
    </AgentDrawerFrame>
  );
}
