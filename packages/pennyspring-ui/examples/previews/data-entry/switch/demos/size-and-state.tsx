import React from 'react';
import { View } from 'react-native';
import { Space, Switch } from '@pennyspring/ui';
import { createUseSheetStyle } from '@pennyspring/theme';

const useStyles = createUseSheetStyle(token => ({
  stack: {
    gap: token.marginSM,
  },
}));

export const switchSizeAndStateDemoTitle = 'Size and state';

export function SwitchSizeAndStateDemo() {
  const styles = useStyles();

  return (
    <>
      <View style={styles.stack}>
        <Space align="center" size="large" wrap>
          <Switch size="small" defaultValue />
          <Switch size="normal" defaultValue />
          <Switch size="large" defaultValue />
        </Space>
        <Space align="center" size="large" wrap>
          <Switch size="small" disabled defaultValue />
          <Switch size="normal" readonly defaultValue />
          <Switch size="large" disabled />
        </Space>
      </View>
    </>
  );
}

export default SwitchSizeAndStateDemo;
