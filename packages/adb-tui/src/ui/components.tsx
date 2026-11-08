import { stdout as output } from 'node:process';
import React, { useEffect, useState } from 'react';
import { Box, Text, useInput, useStdin } from 'ink';
import { BRAND_GRADIENT, UI_COLORS } from './theme';
import { useSyncStatus } from './SyncStatusContext';

interface GradientTextProps {
  children?: React.ReactNode;
  bold?: boolean;
}

export interface PromptFrameProps {
  title: string;
  hint?: string;
  error?: string | null;
  errorSuggestion?: string | null;
  message?: string;
  syncStatus?: string;
  children?: React.ReactNode;
}

export interface TextFieldProps extends Omit<
  PromptFrameProps,
  'children' | 'message'
> {
  initialValue?: string;
  password?: boolean;
  validate?: (value: string) => string | void;
  onSubmit: (value: string) => void;
  onCancel?: () => void;
}

function getPromptFrameWidth(): number | undefined {
  if (!output.isTTY || !output.columns) {
    return undefined;
  }

  return Math.max(40, output.columns - 2);
}

function GradientText({
  children,
  bold = false,
}: GradientTextProps): React.ReactElement {
  let visibleIndex = 0;

  return (
    <Text>
      {String(children)
        .split('')
        .map((character, index) => {
          if (character === ' ') {
            return <Text key={index}>{character}</Text>;
          }

          const color = BRAND_GRADIENT[visibleIndex % BRAND_GRADIENT.length];
          visibleIndex += 1;

          return (
            <Text key={index} color={color} bold={bold}>
              {character}
            </Text>
          );
        })}
    </Text>
  );
}

function BrandHeader({
  syncStatus,
}: {
  syncStatus?: string;
}): React.ReactElement {
  return (
    <Box flexDirection="column">
      <Box gap={1}>
        <Text color={UI_COLORS.primaryStrong} bold>
          ⚙
        </Text>
        <GradientText bold>ADB-TUI</GradientText>
        <Text color="gray">· Android 调试工具</Text>
      </Box>
      {syncStatus ? <Text color={UI_COLORS.success}>{syncStatus}</Text> : null}
    </Box>
  );
}

export function PromptFrame({
  title,
  hint,
  error,
  errorSuggestion,
  message,
  syncStatus,
  children,
}: PromptFrameProps): React.ReactElement {
  const contextStatus = useSyncStatus();
  const status = syncStatus ?? contextStatus;
  return (
    <Box
      flexDirection="column"
      borderStyle="round"
      borderColor={error ? UI_COLORS.error : UI_COLORS.primary}
      paddingX={2}
      paddingY={1}
      width={getPromptFrameWidth()}
    >
      <BrandHeader syncStatus={status} />
      <Box height={1} />
      <Text bold color={UI_COLORS.primaryStrong}>
        {title}
      </Text>
      {hint ? <Text color={UI_COLORS.muted}>{hint}</Text> : null}
      {message ? (
        <Box marginTop={1}>
          <Text color={UI_COLORS.warning}>{message}</Text>
        </Box>
      ) : null}
      <Box flexDirection="column" marginTop={1}>
        {children}
      </Box>
      {error ? (
        <Box flexDirection="column" marginTop={1}>
          <Text color={UI_COLORS.error}>错误：{error}</Text>
          {errorSuggestion ? (
            <Text color={UI_COLORS.muted}>建议：{errorSuggestion}</Text>
          ) : null}
        </Box>
      ) : null}
    </Box>
  );
}

function TextInputFrame({
  value,
  password,
  hasError,
}: {
  value: string;
  password: boolean;
  hasError: boolean;
}): React.ReactElement {
  const displayValue = password ? '*'.repeat(value.length) : value;
  const placeholder = password ? '请输入密码' : '请输入内容';

  return (
    <Box
      borderStyle="round"
      borderColor={hasError ? UI_COLORS.error : UI_COLORS.selectedBorder}
      paddingX={1}
      minHeight={3}
    >
      <Text color={UI_COLORS.primaryStrong} bold>
        ›{' '}
      </Text>
      {displayValue ? (
        <Text color={UI_COLORS.text}>{displayValue}</Text>
      ) : (
        <Text color={UI_COLORS.muted}>{placeholder}</Text>
      )}
      <Text color={hasError ? UI_COLORS.error : UI_COLORS.primaryStrong}>
        _
      </Text>
    </Box>
  );
}

export function TextField({
  title,
  hint,
  initialValue = '',
  password = false,
  error: externalError = null,
  errorSuggestion,
  validate,
  onSubmit,
  onCancel,
}: TextFieldProps): React.ReactElement {
  const [value, setValue] = useState(initialValue);
  const [error, setError] = useState<string | null>(null);
  const displayError = error ?? externalError;
  const { stdin, setRawMode } = useStdin();

  useEffect(() => {
    setValue(initialValue);
    setError(null);
  }, [initialValue, title]);

  useEffect(() => {
    if (!stdin) {
      return undefined;
    }

    setRawMode(true);
    return () => {
      setRawMode(false);
    };
  }, [stdin, setRawMode]);

  useInput(
    (inputValue, key) => {
      if (key.escape) {
        onCancel?.();
        return;
      }

      if (key.return) {
        const nextError = validate?.(value);
        if (nextError) {
          setError(nextError);
          return;
        }

        onSubmit(value);
        return;
      }

      if (key.backspace || key.delete) {
        setValue(current => current.slice(0, -1));
        setError(null);
        return;
      }

      if (inputValue && !key.ctrl && !key.meta && inputValue.length === 1) {
        setValue(current => `${current}${inputValue}`);
        setError(null);
      }
    },
    { isActive: true },
  );

  return (
    <PromptFrame
      title={title}
      hint={hint}
      error={displayError}
      errorSuggestion={error === null ? errorSuggestion : undefined}
    >
      <TextInputFrame
        value={value}
        password={password}
        hasError={Boolean(displayError)}
      />
    </PromptFrame>
  );
}
