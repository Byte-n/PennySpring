import React from 'react';
import { View } from 'react-native';
import { Progress } from '@pennyspring/ui';
import { createUseSheetStyle } from '@pennyspring/theme';

const useStyles = createUseSheetStyle(token => ({
  stack: {
    gap: token.marginSM,
  },
}));

export const progressBarDemoTitle = 'Bar';

export function ProgressBarDemo() {
  const styles = useStyles();

  return (
    <>
      <View style={styles.stack}>
        <Progress.Bar percent={24} />
        <Progress.Bar percent={56} size="small" />
        <Progress.Bar percent={72} size="large" />
        <Progress.Bar percent={100} status="success" />
        <Progress.Bar percent={38} status="exception" />
        <Progress.Bar showInfo={false} percent={64} />
      </View>
    </>
  );
}

export default ProgressBarDemo;
