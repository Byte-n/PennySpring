import React from 'react';
import { Column, Loading, Text } from '@pennyspring/ui';
import { createUseSheetStyle } from '@pennyspring/ui';

import { AgentDrawerFrame } from './AgentDrawerFrame';

const useStyles = createUseSheetStyle(token => ({
  container: {
    flex: 1,
  },
  error: {
    backgroundColor: token.colorErrorBg,
    paddingHorizontal: token.padding,
    paddingVertical: token.paddingXS,
  },
}));

export interface AgentDrawerFallbackProps {
  open: boolean;
  errorText: string;
  onOpenChange: (open: boolean) => void;
  onOpenSessions: () => void;
  onOpenSettings: () => void;
}

export function AgentDrawerFallback({
  open,
  errorText,
  onOpenChange,
  onOpenSessions,
  onOpenSettings,
}: AgentDrawerFallbackProps): React.ReactElement {
  const styles = useStyles();

  return (
    <AgentDrawerFrame
      onOpenChange={onOpenChange}
      onOpenSessions={onOpenSessions}
      onOpenSettings={onOpenSettings}
      open={open}
    >
      <Column style={styles.container}>
        {errorText ? (
          <Column style={styles.error}>
            <Text color="errorText" size="xs">
              {errorText}
            </Text>
          </Column>
        ) : null}
        <Loading size="small" text="正在读取对话…" />
      </Column>
    </AgentDrawerFrame>
  );
}
