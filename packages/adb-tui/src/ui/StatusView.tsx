import React from 'react';
import { Box, Text } from 'ink';
import { AdbError } from '../core';
import { UI_COLORS } from './theme';

interface StatusViewProps {
  loading?: boolean;
  loadingText?: string;
  error?: unknown;
}

export function StatusView({ loading, loadingText, error }: StatusViewProps) {
  if (loading) {
    return <Text color={UI_COLORS.warning}>{loadingText ?? '处理中…'}</Text>;
  }
  if (error) {
    return (
      <Box flexDirection="column">
        <Text color={UI_COLORS.error}>错误：{describe(error)}</Text>
        {error instanceof AdbError ? (
          <Text color={UI_COLORS.muted}>建议：{error.suggestion}</Text>
        ) : null}
      </Box>
    );
  }
  return null;
}

function describe(error: unknown): string {
  if (error instanceof AdbError) {
    return error.message === error.kind ? error.suggestion : error.message;
  }
  if (error instanceof Error) {
    return error.message;
  }
  return '未知错误';
}
