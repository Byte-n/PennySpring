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
import { ComposerAttachments } from './ComposerAttachments';
import { ComposerInput } from './ComposerInput';
import { ComposerRunningProgress } from './ComposerRunningProgress';
import { VoiceButton } from './VoiceButton';
import {
  AGENT_IMAGE_PICK_FAILED_MESSAGE,
  AGENT_IMAGE_UNAVAILABLE_MESSAGE,
  AGENT_IMAGE_UNREADABLE_MESSAGE,
  AGENT_MODEL_NO_IMAGE_MESSAGE,
} from './copy';
import { buildAttachmentMessageParts } from '../core/attachments';
import { getErrorMessage } from './errorMessage';
import {
  AGENT_IMAGE_MAX_DIMENSION,
  AGENT_IMAGE_QUALITY,
  AGENT_MAX_IMAGE_ATTACHMENTS,
  toAgentAttachments,
  toImageFileParts,
} from './imageAttachments';

const PLUS_MENU_MIN_WIDTH = 140;
const MODEL_CHIP_MAX_WIDTH = 132;
const MODEL_CHIP_HEIGHT = 28;
const MODEL_CHIP_HIT_SLOP = 8;
const CONTROL_HIT_SLOP = 6;
const SEND_BUTTON_SIZE = 36;
const SEND_BUTTON_HIT_SLOP = 4;
const PILL_RADIUS = 999;
const PRESS_SCALE = 0.97;

interface ComposerStyleOptions {
  isFocused: boolean;
}

const useStyles = createUseSheetStyle<ComposerStyleOptions>(
  (token, { isFocused }) => ({
    composer: {
      borderTopColor: token.colorSplit,
      borderTopWidth: token.lineWidth,
      paddingBottom: token.padding,
      paddingHorizontal: token.padding,
      paddingTop: token.paddingSM,
    },
    card: {
      position: 'relative' as const,
      backgroundColor: isFocused
        ? token.colorBgElevated
        : token.colorFillTertiary,
      borderColor: isFocused ? token.colorPrimary : 'transparent',
      borderRadius: token.borderRadiusLG,
      borderWidth: token.lineWidth,
      paddingHorizontal: token.paddingSM,
      paddingVertical: token.paddingXS,
    },
    toolbar: {
      marginTop: token.marginXS,
      minHeight: SEND_BUTTON_SIZE,
    },
    toolLeft: {
      flexShrink: 1,
    },
    toolRight: {
      flexShrink: 0,
    },
    modelChip: {
      alignItems: 'center' as const,
      backgroundColor: 'transparent',
      borderRadius: PILL_RADIUS,
      flexDirection: 'row' as const,
      flexShrink: 1,
      gap: token.marginXXS,
      height: MODEL_CHIP_HEIGHT,
      maxWidth: MODEL_CHIP_MAX_WIDTH,
      paddingHorizontal: token.paddingXS,
    },
    modelChipPressed: {
      backgroundColor: token.colorFillContent,
    },
    modelChipLabel: {
      flexShrink: 1,
    },
    sendButton: {
      width: SEND_BUTTON_SIZE,
      height: SEND_BUTTON_SIZE,
    },
    sendDisabled: {
      backgroundColor: token.colorFillContent,
    },
    stopButton: {
      alignItems: 'center' as const,
      justifyContent: 'center' as const,
      width: SEND_BUTTON_SIZE,
      height: SEND_BUTTON_SIZE,
      backgroundColor: token.colorFillContent,
      borderRadius: PILL_RADIUS,
    },
    stopButtonPressed: {
      backgroundColor: token.colorFillContentHover,
      transform: [{ scale: PRESS_SCALE }],
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
  }),
);

export interface AgentComposerProps {
  threadId: number | null;
  onOpenModelSettings: (providerId?: string) => void;
}

export function AgentComposer({
  threadId,
  onOpenModelSettings,
}: AgentComposerProps): React.ReactElement {
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
  const [isInputFocused, setIsInputFocused] = useState(false);
  const [modelSheetOpen, setModelSheetOpen] = useState(false);
  const [plusMenuOpen, setPlusMenuOpen] = useState(false);
  const [imagePickerOpen, setImagePickerOpen] = useState(false);
  const [pendingImages, setPendingImages] = useState<ImagePickerValue[]>([]);
  const styles = useStyles({ isFocused: isInputFocused });

  const provider = useMemo(() => {
    if (selection) {
      const selected = providers.find(item => item.id === selection.providerId);
      if (selected) {
        return selected;
      }
    }
    return (
      providers.find(item => item.id === activeProviderId) ??
      providers[0] ??
      null
    );
  }, [activeProviderId, providers, selection]);

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
        onOpenModelSettings(provider.id);
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

  const isVoiceActive = voice.status !== 'idle';
  const canSubmit =
    !isRunning &&
    !hasPendingApproval &&
    !isVoiceActive &&
    (hasDraftText ? canSend : hasStagedImages);

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
    const attachments = toAgentAttachments(pendingImages);
    setPlusMenuOpen(false);
    setImagePickerOpen(false);
    setPendingImages([]);
    aui.composer.setText('', { origin: 'user' });
    aiChat
      .sendMessage({
        parts: buildAttachmentMessageParts(files, attachments, nextText),
        metadata: { attachments },
      })
      .catch(error => {
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

  const handleRemoveImage = useCallback((index: number): void => {
    setPendingImages(previous =>
      previous.filter((_image, currentIndex) => currentIndex !== index),
    );
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
      <Column style={styles.card}>
        {isRunning ? <ComposerRunningProgress /> : null}
        {hasStagedImages ? (
          <ComposerAttachments
            canAdd={
              canAttachImage &&
              pendingImages.length < AGENT_MAX_IMAGE_ATTACHMENTS
            }
            images={pendingImages}
            maxCount={AGENT_MAX_IMAGE_ATTACHMENTS}
            onAdd={handleOpenImagePicker}
            onRemove={handleRemoveImage}
          />
        ) : null}
        <ComposerInput
          onBlur={() => setIsInputFocused(false)}
          onChangeText={handleChange}
          onFocus={() => setIsInputFocused(true)}
          placeholder="记一笔，或问这个月的开销"
          testID="agent-input"
          value={text}
        />
        <Row align="center" justify="between" style={styles.toolbar}>
          <Row align="center" gap="small" style={styles.toolLeft}>
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
                    <Column gap={0} style={styles.plusMenuLabel}>
                      <Text
                        color={canAttachImage ? 'default' : 'tertiary'}
                        size="sm"
                      >
                        图片
                      </Text>
                      <Text color="tertiary" size="xs">
                        {canAttachImage ? '从相册或相机选择' : '当前模型不支持'}
                      </Text>
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
                hitSlop={CONTROL_HIT_SLOP}
                icon="plus"
                iconProps={{ color: 'secondary', size: 18 }}
                onPress={() => setPlusMenuOpen(previous => !previous)}
                shape="circle"
                size="small"
                testID="agent-plus-button"
                type="text"
              />
            </Popover>
            {provider ? (
              <Pressable
                hitSlop={{
                  top: MODEL_CHIP_HIT_SLOP,
                  bottom: MODEL_CHIP_HIT_SLOP,
                }}
                onPress={() => setModelSheetOpen(true)}
                style={({ pressed }) => [
                  styles.modelChip,
                  pressed ? styles.modelChipPressed : undefined,
                ]}
                testID="agent-model-chip"
              >
                <Text
                  color="tertiary"
                  numberOfLines={1}
                  size="xs"
                  style={styles.modelChipLabel}
                >
                  {currentModel?.modelId ?? '未配置模型'}
                </Text>
                <Icon color="tertiary" icon="caret-down" size={12} />
              </Pressable>
            ) : null}
          </Row>
          <Row align="center" gap="small" style={styles.toolRight}>
            <VoiceButton
              disabled={isRunning}
              onStart={voice.start}
              onStop={voice.stop}
              partialText={voice.partialText}
              status={voice.status}
            />
            {isRunning ? (
              <Pressable
                hitSlop={SEND_BUTTON_HIT_SLOP}
                onPress={handleStop}
                style={({ pressed }) => [
                  styles.stopButton,
                  pressed ? styles.stopButtonPressed : undefined,
                ]}
                testID="agent-stop-button"
              >
                <Icon color="default" icon={StopIcon} size={16} />
              </Pressable>
            ) : (
              <Button
                disabled={!canSubmit}
                hitSlop={SEND_BUTTON_HIT_SLOP}
                icon={PaperPlaneTiltIcon}
                onPress={handleSend}
                shape="circle"
                size="small"
                style={[
                  styles.sendButton,
                  canSubmit ? undefined : styles.sendDisabled,
                ]}
                testID="agent-send-button"
                type="primary"
              />
            )}
          </Row>
        </Row>
      </Column>
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
