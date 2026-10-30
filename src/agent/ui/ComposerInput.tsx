import React, { useEffect, useState } from 'react';
import { TextInput } from 'react-native';
import type {
  NativeSyntheticEvent,
  TextInputContentSizeChangeEventData,
} from 'react-native';
import { createUseSheetStyle, useTheme } from '@pennyspring/theme';

const MIN_ROWS = 1;
const MAX_ROWS = 4;

interface ComposerInputStyleOptions {
  contentHeight: number;
}

const useStyles = createUseSheetStyle<ComposerInputStyleOptions>(
  (token, { contentHeight }) => {
    const minHeight = token.lineHeightSM * MIN_ROWS;
    const maxHeight = token.lineHeightSM * MAX_ROWS;
    const height = Math.min(Math.max(contentHeight, minHeight), maxHeight);

    return {
      input: {
        width: '100%',
        height,
        minHeight,
        maxHeight,
        margin: 0,
        padding: 0,
        color: token.colorText,
        fontFamily: token.fontFamily,
        fontSize: token.fontSize,
        lineHeight: token.lineHeightSM,
        includeFontPadding: false,
        textAlignVertical: 'top' as const,
      },
    };
  },
);

export interface ComposerInputProps {
  value: string;
  placeholder: string;
  testID?: string;
  onChangeText: (value: string) => void;
  onFocus?: () => void;
  onBlur?: () => void;
}

export function ComposerInput({
  value,
  placeholder,
  testID,
  onChangeText,
  onFocus,
  onBlur,
}: ComposerInputProps): React.ReactElement {
  const { token } = useTheme();
  const [contentHeight, setContentHeight] = useState(0);
  const styles = useStyles({ contentHeight });

  useEffect(() => {
    if (value.length === 0) {
      setContentHeight(0);
    }
  }, [value]);

  function handleContentSizeChange(
    event: NativeSyntheticEvent<TextInputContentSizeChangeEventData>,
  ): void {
    setContentHeight(event.nativeEvent.contentSize.height);
  }

  return (
    <TextInput
      multiline
      onBlur={onBlur}
      onChangeText={onChangeText}
      onContentSizeChange={handleContentSizeChange}
      onFocus={onFocus}
      placeholder={placeholder}
      placeholderTextColor={token.colorTextPlaceholder}
      selectionColor={token.colorPrimary}
      style={styles.input}
      testID={testID}
      textAlignVertical="top"
      value={value}
    />
  );
}
