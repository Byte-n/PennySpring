import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Keyboard, Pressable } from 'react-native';
import type { UIMessage } from 'ai';
import { useAISDKChat } from '@assistant-ui/ai-sdk';
import { useAui, useAuiState } from '@assistant-ui/react-native';
import {
  ActionSheet,
  Button,
  Column,
  Icon,
  ImagePicker,
  Popover,
  Row,
  Text,
  Textarea,
  useToast,
  type ActionSheetAction,
  type ImagePickerValue,
} from '@pennyspring/ui';
import { createUseSheetStyle } from '@pennyspring/theme';
import {
  GearSixIcon,
  PaperPlaneTiltIcon,
  StopIcon,
} from 'phosphor-react-native';

import { useAgentProviderStore } from '../providers/configStore';
import {
  formatContextWindow,
  formatReasoningEffort,
  isMultimodalModel,
  resolveProviderModel,
} from '../providers/models';
import {
  rememberThreadModel,
  useThreadModelStore,
} from '../providers/modelSelectionStore';
import { appendTranscript } from '../voice/transcript';
import { useVoiceInput } from '../voice/useVoiceInput';
import { hasPendingToolApproval } from './approval';
import { VoiceButton } from './VoiceButton';
import {
  AGENT_IMAGE_PICK_FAILED_MESSAGE,
  AGENT_IMAGE_UNAVAILABLE_MESSAGE,
  AGENT_IMAGE_UNREADABLE_MESSAGE,
  AGENT_MODEL_NO_IMAGE_MESSAGE,
} from './copy';
import { getErrorMessage } from './errorMessage';
import {
  AGENT_IMAGE_MAX_DIMENSION,
  AGENT_IMAGE_QUALITY,
  AGENT_MAX_IMAGE_ATTACHMENTS,
  toImageFileParts,
} from './imageAttachments';

const PLUS_MENU_MIN_WIDTH = 140;

export interface AgentComposerProps {
  threadId: number | null;
  onOpenModelSettings: () => void;
}

const useStyles = createUseSheetStyle(token => ({
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
  modelChip: {
    backgroundColor: token.colorFillContent,
    borderRadius: token.borderRadiusSM,
    flexShrink: 1,
    justifyContent: 'center',
    paddingHorizontal: token.paddingXS,
    paddingVertical: token.paddingXXS,
  },
  modelChipPressed: {
    backgroundColor: token.colorFillContentHover,
  },
  imageBar: {
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: token.colorFillContent,
    borderRadius: token.borderRadiusSM,
    flexDirection: 'row',
    gap: token.marginXXS,
    marginBottom: token.marginXXS,
    minHeight: token.controlHeightSM,
    paddingHorizontal: token.paddingXS,
  },
  imageBarPressed: {
    backgroundColor: token.colorFillContentHover,
  },
  plusMenu: {
    minWidth: PLUS_MENU_MIN_WIDTH,
  },
  plusMenuItem: {
    alignItems: 'center',
    borderRadius: token.borderRadius,
    flexDirection: 'row',
    gap: token.marginXS,
    minHeight: token.controlHeight,
    paddingHorizontal: token.paddingXS,
  },
  plusMenuItemPressed: {
    backgroundColor: token.colorFillContent,
  },
  plusMenuLabel: {
    flex: 1,
  },
}));

export function AgentComposer({
  threadId,
  onOpenModelSettings,
}: AgentComposerProps): React.ReactElement {
  const styles = useStyles();
  const toast = useToast();
  const aui = useAui();
  const aiChat = useAISDKChat<UIMessage>();
  const text = useAuiState(state => state.composer.text);
  const canSend = useAuiState(state => state.composer.canSend);
  const isRunning = useAuiState(state => state.thread.isRunning);
  const hasPendingApproval = useAuiState(state =>
    hasPendingToolApproval(state.thread.messages),
  );

  const providers = useAgentProviderStore(state => state.providers);
  const activeProviderId = useAgentProviderStore(
    state => state.activeProviderId,
  );
  const selection = useThreadModelStore(state =>
    threadId === null ? undefined : state.selections[String(threadId)],
  );
  const [modelSheetOpen, setModelSheetOpen] = useState(false);
  const [plusMenuOpen, setPlusMenuOpen] = useState(false);
  const [imagePickerOpen, setImagePickerOpen] = useState(false);
  const [pendingImages, setPendingImages] = useState<ImagePickerValue[]>([]);

  const provider = useMemo(
    () =>
      providers.find(item => item.id === activeProviderId) ??
      providers[0] ??
      null,
    [activeProviderId, providers],
  );

  const currentModel = useMemo(() => {
    if (provider === null) {
      return null;
    }
    const modelId =
      selection?.providerId === provider.id ? selection.modelId : null;
    return resolveProviderModel(provider, modelId);
  }, [provider, selection]);

  const canAttachImage = isMultimodalModel(currentModel);
  const hasStagedImages = pendingImages.length > 0;
  const hasDraftText = text.trim().length > 0;
  const canSubmit =
    !isRunning &&
    !hasPendingApproval &&
    (hasDraftText ? canSend : hasStagedImages);

  useEffect(() => {
    if (canAttachImage) {
      return;
    }
    setPendingImages(previous => (previous.length > 0 ? [] : previous));
  }, [canAttachImage]);

  const modelActions = useMemo<ActionSheetAction[]>(() => {
    if (provider === null) {
      return [];
    }
    const actions: ActionSheetAction[] = provider.models.map(model => {
      const isCurrent = model.modelId === currentModel?.modelId;
      return {
        text: model.modelId,
        description: `${isCurrent ? '当前 · ' : ''}上下文 ${formatContextWindow(
          model.contextWindow,
        )} · 思考${formatReasoningEffort(model.reasoningEffort)}${
          model.multimodal ? ' · 图片' : ''
        }`,
      };
    });
    actions.push({
      text: '模型设置',
      description: '编辑当前提供商的模型与参数',
      icon: GearSixIcon,
    });
    return actions;
  }, [currentModel, provider]);

  const handleModelAction = useCallback(
    (_action: ActionSheetAction, index: number): void => {
      if (provider === null) {
        return;
      }
      if (index === provider.models.length) {
        onOpenModelSettings();
        return;
      }
      const model = provider.models[index];
      if (model && threadId !== null) {
        if (!isMultimodalModel(model) && pendingImages.length > 0) {
          setPendingImages([]);
          toast.show({
            messageText: '已切换为不支持图片的模型，待发送图片已清空。',
          });
        }
        rememberThreadModel(threadId, provider.id, model.modelId);
      }
    },
    [onOpenModelSettings, pendingImages.length, provider, threadId, toast],
  );

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
    if (!canSubmit) {
      return;
    }

    if (pendingImages.length === 0) {
      aui.composer.send();
      return;
    }

    if (!isMultimodalModel(currentModel)) {
      toast.show({
        messageText: AGENT_MODEL_NO_IMAGE_MESSAGE,
        status: 'error',
      });
      return;
    }

    const files = toImageFileParts(pendingImages);
    if (files.length !== pendingImages.length) {
      toast.show({
        messageText: AGENT_IMAGE_UNREADABLE_MESSAGE,
        status: 'error',
      });
      return;
    }

    if (!aiChat) {
      toast.show({
        messageText: AGENT_IMAGE_UNAVAILABLE_MESSAGE,
        status: 'error',
      });
      return;
    }

    const nextText = text.trim();
    setPlusMenuOpen(false);
    setImagePickerOpen(false);
    setPendingImages([]);
    aui.composer.setText('', { origin: 'user' });
    aiChat.sendMessage({ text: nextText, files }).catch(error => {
      toast.show({ messageText: getErrorMessage(error), status: 'error' });
    });
  }, [aiChat, aui, canSubmit, currentModel, pendingImages, text, toast]);

  const handleOpenImagePicker = useCallback((): void => {
    setPlusMenuOpen(false);
    if (!canAttachImage) {
      toast.show({
        messageText: AGENT_MODEL_NO_IMAGE_MESSAGE,
        status: 'error',
      });
      return;
    }
    Keyboard.dismiss();
    setImagePickerOpen(true);
  }, [canAttachImage, toast]);

  const handleOpenStagedImages = useCallback((): void => {
    Keyboard.dismiss();
    setImagePickerOpen(true);
  }, []);

  const handleImagePickError = useCallback(
    (error: unknown): void => {
      toast.show({
        messageText:
          error instanceof Error && error.message.trim()
            ? error.message
            : AGENT_IMAGE_PICK_FAILED_MESSAGE,
        status: 'error',
      });
    },
    [toast],
  );

  const handleStop = useCallback((): void => {
    aui.composer.cancel();
  }, [aui]);

  return (
    <Column style={styles.composer}>
      {hasStagedImages ? (
        <Pressable
          onPress={handleOpenStagedImages}
          style={({ pressed }) => [
            styles.imageBar,
            pressed ? styles.imageBarPressed : undefined,
          ]}
          testID="agent-image-staging-bar"
        >
          <Icon color="primary" icon="image" size="small" weight="fill" />
          <Text color="secondary" size="xs">
            {`× ${pendingImages.length}`}
          </Text>
        </Pressable>
      ) : null}
      {hasPendingApproval ? (
        <Text color="warningText" size="xs" testID="agent-approval-pending">
          请先确认或取消待处理的记账
        </Text>
      ) : null}
      <Row gap="small" align="end">
        {provider ? (
          <Pressable
            onPress={() => setModelSheetOpen(true)}
            style={({ pressed }) => [
              styles.modelChip,
              pressed ? styles.modelChipPressed : undefined,
            ]}
            testID="agent-model-chip"
          >
            <Text color="secondary" numberOfLines={1} size="xs">
              {currentModel?.modelId ?? '未配置模型'}
            </Text>
          </Pressable>
        ) : null}
        <Column style={styles.inputWrap}>
          <Textarea
            maxRows={4}
            minRows={1}
            onChange={handleChange}
            placeholder="问问这个月的开销…"
            size="small"
            testID="agent-input"
            value={text}
          />
        </Column>
        <Popover
          align="end"
          content={
            <Column style={styles.plusMenu}>
              <Pressable
                disabled={!canAttachImage}
                onPress={handleOpenImagePicker}
                style={({ pressed }) => [
                  styles.plusMenuItem,
                  pressed ? styles.plusMenuItemPressed : undefined,
                ]}
                testID="agent-composer-image-option"
              >
                <Icon
                  color={canAttachImage ? 'primary' : 'tertiary'}
                  icon="image"
                  size="normal"
                />
                <Column style={styles.plusMenuLabel}>
                  <Text
                    color={canAttachImage ? 'default' : 'tertiary'}
                    size="sm"
                  >
                    图片
                  </Text>
                  {canAttachImage ? null : (
                    <Text color="tertiary" size="xs">
                      当前模型不支持
                    </Text>
                  )}
                </Column>
              </Pressable>
            </Column>
          }
          onOpenChange={setPlusMenuOpen}
          open={plusMenuOpen}
          placement="top"
          trigger="manual"
        >
          <Button
            icon="plus"
            onPress={() => setPlusMenuOpen(previous => !previous)}
            shape="circle"
            size="small"
            testID="agent-plus-button"
            type="text"
          />
        </Popover>
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
            disabled={!canSubmit}
            icon={PaperPlaneTiltIcon}
            onPress={handleSend}
            shape="circle"
            size="small"
            testID="agent-send-button"
            type="primary"
          />
        )}
      </Row>
      <ActionSheet
        actions={modelActions}
        onAction={handleModelAction}
        onOpenChange={setModelSheetOpen}
        open={modelSheetOpen}
        titleText="切换模型"
      />
      <ImagePicker.Popup
        includeBase64
        maxCount={AGENT_MAX_IMAGE_ATTACHMENTS}
        maxHeight={AGENT_IMAGE_MAX_DIMENSION}
        maxWidth={AGENT_IMAGE_MAX_DIMENSION}
        multiple
        onChange={setPendingImages}
        onError={handleImagePickError}
        onOpenChange={nextOpen => setImagePickerOpen(nextOpen)}
        open={imagePickerOpen}
        quality={AGENT_IMAGE_QUALITY}
        sources={['photo', 'camera']}
        titleText="发送图片"
        value={pendingImages}
      />
    </Column>
  );
}
