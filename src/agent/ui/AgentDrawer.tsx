import React, { useCallback, useEffect, useRef } from 'react';
import type { UIMessage } from 'ai';
import { useAISDKChat } from '@assistant-ui/ai-sdk';
import {
  MessagePrimitive,
  ThreadPrimitive,
  useAui,
  useAuiState,
  type MessageState,
  type PartState,
  type ToolCallMessagePartProps,
} from '@assistant-ui/react-native';
import {
  Button,
  Column,
  Empty,
  Icon,
  Image,
  Loading,
  Row,
  Text,
  useToast,
} from '@pennyspring/ui';
import { createUseSheetStyle, useTheme } from '@pennyspring/ui';
import { CheckCircleIcon, WarningCircleIcon } from 'phosphor-react-native';

import { MarkdownText } from '../../component/MarkdownText';
import type { PendingQuickBookMessage } from '../../features/quickBook/types';
import { useMediaStore } from '../../media';
import {
  buildAttachmentMessageParts,
  stripAttachmentCaptions,
} from '../core/attachments';
import { AgentComposer } from './AgentComposer';
import { AgentDrawerFrame } from './AgentDrawerFrame';
import {
  CREATE_RECORD_TOOL_NAME,
  THINKING_TEXT,
  toolErrorText,
  toolStatusText,
  UPDATE_RECORD_TOOL_NAME,
} from './copy';
import { getErrorMessage } from './errorMessage';
import { RecordCreationCard } from './RecordCreationCard';
import { RecordUpdateCard } from './RecordUpdateCard';
import { ThinkingBlock } from './ThinkingBlock';
import type { AgentSessionState } from './useAgentSession';

const SUGGESTIONS = [
  '帮我记一笔午饭 30 元',
  '上个月吃饭花了多少？',
  '这个月支出按类型统计',
  '最近有哪些转账记录？',
];

const useStyles = createUseSheetStyle(token => ({
  container: {
    flex: 1,
  },
  notice: {
    backgroundColor: token.colorWarningBg,
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
    paddingTop: token.paddingXS,
  },
  suggestion: {
    alignSelf: 'flex-start',
  },
  userBubble: {
    backgroundColor: token.colorPrimary,
    borderRadius: token.borderRadiusLG,
    maxWidth: '88%',
    paddingHorizontal: token.paddingSM,
    paddingVertical: token.paddingXS,
  },
  messageImage: {
    height: token.controlHeight,
    width: token.controlHeight,
  },
  assistantBubble: {
    backgroundColor: token.colorFillQuaternary,
    borderRadius: token.borderRadiusLG,
    maxWidth: '100%',
    paddingHorizontal: token.paddingSM,
    paddingVertical: token.paddingXS,
  },
  toolStatus: {
    paddingVertical: token.paddingXXS,
  },
  thinking: {
    paddingVertical: token.paddingXXS,
  },
}));

function hasVisibleMessagePart(part: PartState): boolean {
  if (part.type === 'text' || part.type === 'reasoning') {
    return part.text.trim().length > 0;
  }
  return part.type === 'tool-call';
}

function ToolNote({
  status,
  isError,
  toolName,
}: ToolCallMessagePartProps): React.ReactElement {
  const { token } = useTheme();
  const styles = useStyles();

  if (isError || status.type === 'incomplete') {
    return (
      <Row style={styles.toolStatus} gap={token.marginXXS} align="center">
        <Icon color="errorText" icon={WarningCircleIcon} size="small" />
        <Text color="errorText" size="xs">
          {toolErrorText(toolName)}
        </Text>
      </Row>
    );
  }

  if (status.type === 'running') {
    return (
      <Row style={styles.toolStatus} gap={token.marginXXS} align="center">
        <Loading size="small" />
        <Text color="secondary" size="xs">
          {toolStatusText(toolName, false)}
        </Text>
      </Row>
    );
  }

  return (
    <Row style={styles.toolStatus} gap={token.marginXXS} align="center">
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
  Reasoning: ThinkingBlock,
  tools: {
    by_name: {
      [CREATE_RECORD_TOOL_NAME]: RecordCreationCard,
      [UPDATE_RECORD_TOOL_NAME]: RecordUpdateCard,
    },
    Fallback: ToolNote,
  },
};

function UserImageAttachments(): React.ReactElement | null {
  const styles = useStyles();
  const media = useMediaStore();

  return (
    <Image.PreviewGroup>
      <MessagePrimitive.Attachments>
        {({ attachment }) => {
          const imagePart = attachment.content?.find(
            part => part.type === 'image',
          );
          if (!imagePart) {
            return null;
          }
          return (
            <Image
              radius="small"
              src={
                media
                  ? media.resolveSource(imagePart.image)
                  : { uri: imagePart.image }
              }
              style={styles.messageImage}
            />
          );
        }}
      </MessagePrimitive.Attachments>
    </Image.PreviewGroup>
  );
}

function AgentMessageRow({
  role,
}: {
  role: MessageState['role'];
}): React.ReactElement | null {
  const { token } = useTheme();
  const styles = useStyles();
  const hasVisiblePart = useAuiState(state => {
    const hasAttachment =
      (state.message.attachments?.length ?? 0) > 0 ||
      (state.message.submission?.attachments?.length ?? 0) > 0;

    if (state.message.role === 'user' && hasAttachment) {
      return true;
    }

    return state.message.parts.some(hasVisibleMessagePart);
  });

  if (!hasVisiblePart) {
    return null;
  }

  if (role === 'user') {
    return (
      <Row justify="end">
        <Column style={styles.userBubble} gap={token.marginXXS}>
          <UserImageAttachments />
          <MessagePrimitive.Content
            renderText={({ part }) => {
              const text = stripAttachmentCaptions(part.text);
              if (!text) {
                return <></>;
              }
              return (
                <Text color="lightSolid" size="sm">
                  {text}
                </Text>
              );
            }}
          />
        </Column>
      </Row>
    );
  }

  if (role !== 'assistant') {
    return null;
  }

  return (
    <Row justify="start">
      <Column style={styles.assistantBubble} gap={token.marginXXS}>
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
    return !last.parts.some(hasVisibleMessagePart);
  });

  if (!showThinking) {
    return null;
  }

  return (
    <Row style={styles.thinking} gap="small" align="center">
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
    <Column style={styles.empty} gap="normal">
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

export interface AgentDrawerProps {
  open: boolean;
  configured: boolean;
  session: AgentSessionState;
  runtimeErrorText: string;
  pendingQuickBook: PendingQuickBookMessage | null;
  onPendingQuickBookSent: () => void;
  onOpenChange: (open: boolean) => void;
  onOpenSessions: () => void;
  onOpenSettings: () => void;
  onOpenModelSettings: (providerId?: number) => void;
}

export function AgentDrawer({
  open,
  configured,
  session,
  runtimeErrorText,
  pendingQuickBook,
  onPendingQuickBookSent,
  onOpenChange,
  onOpenSessions,
  onOpenSettings,
  onOpenModelSettings,
}: AgentDrawerProps): React.ReactElement {
  const styles = useStyles();
  const toast = useToast();
  const aui = useAui();
  const aiChat = useAISDKChat<UIMessage>();
  const sentQuickBookRef = useRef<string | null>(null);

  useEffect(() => {
    if (pendingQuickBook === null || !aiChat) {
      return;
    }
    if (session.currentThreadId !== pendingQuickBook.threadId) {
      return;
    }
    if (sentQuickBookRef.current === pendingQuickBook.id) {
      return;
    }
    sentQuickBookRef.current = pendingQuickBook.id;
    aiChat
      .sendMessage({
        parts: buildAttachmentMessageParts(
          pendingQuickBook.files,
          pendingQuickBook.attachments,
          pendingQuickBook.text,
        ),
        metadata: {
          attachments: pendingQuickBook.attachments,
          autoApproveCreate: pendingQuickBook.autoApproveCreate,
        },
      })
      .then(() => {
        onPendingQuickBookSent();
      })
      .catch(error => {
        onPendingQuickBookSent();
        toast.show({
          messageText: getErrorMessage(error),
          status: 'error',
        });
      });
  }, [
    aiChat,
    onPendingQuickBookSent,
    pendingQuickBook,
    session.currentThreadId,
    toast,
  ]);

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
          <Row style={styles.notice} gap="small" align="center">
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

        <AgentComposer
          onOpenModelSettings={onOpenModelSettings}
          threadId={session.currentThreadId}
        />
      </Column>
    </AgentDrawerFrame>
  );
}
