import React from 'react';
import {
  Icon,
  Loading,
  Row,
  Text,
  createUseSheetStyle,
  useTheme,
} from '@pennyspring/ui';
import { CheckCircleIcon, WarningCircleIcon } from 'phosphor-react-native';

import { toolErrorText, toolPreparingText, toolStatusText } from './copy';

const useStyles = createUseSheetStyle(token => ({
  row: {
    paddingVertical: token.paddingXXS,
  },
}));

export type ToolStatusNoteStatus = 'preparing' | 'running' | 'done' | 'error';

interface ToolStatusNoteProps {
  toolName: string;
  status: ToolStatusNoteStatus;
}

export function ToolStatusNote({
  toolName,
  status,
}: ToolStatusNoteProps): React.ReactElement {
  const { token } = useTheme();
  const styles = useStyles();

  if (status === 'error') {
    return (
      <Row align="center" gap={token.marginXXS} style={styles.row}>
        <Icon color="errorText" icon={WarningCircleIcon} size="small" />
        <Text color="errorText" size="xs">
          {toolErrorText(toolName)}
        </Text>
      </Row>
    );
  }

  if (status === 'preparing') {
    return (
      <Row align="center" gap={token.marginXXS} style={styles.row}>
        <Loading size="small" />
        <Text color="secondary" size="xs">
          {toolPreparingText(toolName)}
        </Text>
      </Row>
    );
  }

  if (status === 'running') {
    return (
      <Row align="center" gap={token.marginXXS} style={styles.row}>
        <Loading size="small" />
        <Text color="secondary" size="xs">
          {toolStatusText(toolName, false)}
        </Text>
      </Row>
    );
  }

  return (
    <Row align="center" gap={token.marginXXS} style={styles.row}>
      <Icon color="tertiary" icon={CheckCircleIcon} size="small" />
      <Text color="tertiary" size="xs">
        {toolStatusText(toolName, true)}
      </Text>
    </Row>
  );
}
