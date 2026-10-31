import React from 'react';
import { Pressable } from 'react-native';
import { Icon, Tooltip } from '@pennyspring/ui';
import { createUseSheetStyle, useTheme } from '@pennyspring/ui';

const useStyles = createUseSheetStyle(token => ({
  trigger: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: token.paddingXXS,
  },
}));

export interface InfoHintProps {
  content: string;
}

export function InfoHint({ content }: InfoHintProps): React.ReactElement {
  const styles = useStyles();
  const { token } = useTheme();

  return (
    <Tooltip content={content}>
      <Pressable hitSlop={token.paddingXS} style={styles.trigger}>
        <Icon color="tertiary" icon="info" size="small" />
      </Pressable>
    </Tooltip>
  );
}
