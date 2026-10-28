import React, { useCallback, useRef } from 'react';
import { Button, Column, Popover, Row, Text } from '@pennyspring/ui';
import { MicrophoneIcon } from 'phosphor-react-native';

import type { VoiceInputStatus } from '../voice/useVoiceInput';

const ACTIVE_STATUS_TEXT: Record<Exclude<VoiceInputStatus, 'idle'>, string> = {
  preparing: '正在准备语音识别…',
  listening: '正在聆听，松开完成输入',
  finalizing: '正在整理文字…',
};

const ACTIVE_PLACEHOLDER_TEXT: Record<Exclude<VoiceInputStatus, 'idle'>, string> =
  {
    preparing: '首次使用需要加载内置模型',
    listening: '请说话',
    finalizing: '请稍候',
  };

export interface VoiceButtonProps {
  status: VoiceInputStatus;
  partialText: string;
  disabled?: boolean;
  onStart: () => void;
  onStop: () => void;
}

export function VoiceButton({
  status,
  partialText,
  disabled = false,
  onStart,
  onStop,
}: VoiceButtonProps): React.ReactElement {
  const isHoldingRef = useRef(false);
  const isActive = status !== 'idle';

  const handleLongPress = useCallback((): void => {
    if (disabled) {
      return;
    }
    isHoldingRef.current = true;
    onStart();
  }, [disabled, onStart]);

  const handlePressOut = useCallback((): void => {
    if (!isHoldingRef.current) {
      return;
    }
    isHoldingRef.current = false;
    onStop();
  }, [onStop]);

  const statusText = status === 'idle' ? '' : ACTIVE_STATUS_TEXT[status];
  const hintText =
    status === 'idle'
      ? ''
      : partialText || ACTIVE_PLACEHOLDER_TEXT[status];

  return (
    <Popover
      align="end"
      closeOnMaskClick={false}
      content={
        <Column gap="small">
          <Row align="center" gap="small">
            <Text color="primaryText" size="xs">
              ●
            </Text>
            <Text color="secondary" size="xs">
              {statusText}
            </Text>
          </Row>
          <Text numberOfLines={3} size="sm">
            {hintText}
          </Text>
        </Column>
      }
      open={isActive}
      placement="top"
      trigger="manual"
    >
      <Button
        delayLongPress={250}
        disabled={disabled}
        icon={MicrophoneIcon}
        onLongPress={handleLongPress}
        onPressOut={handlePressOut}
        shape="circle"
        size="small"
        testID="agent-voice-button"
        type={isActive ? 'primary' : 'default'}
      />
    </Popover>
  );
}
