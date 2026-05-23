import React from 'react';
import { View } from 'react-native';
import { Button, Icon, Result } from '@pennyspring/ui';
import { createUseSheetStyle } from '@pennyspring/theme';

const useStyles = createUseSheetStyle(token => ({
  stack: {
    gap: token.marginLG,
  },
  panel: {
    backgroundColor: token.colorBgContainer,
    borderColor: token.colorBorderSecondary,
    borderRadius: token.borderRadius,
    borderWidth: token.lineWidth,
    paddingHorizontal: token.padding,
    paddingVertical: token.paddingSM,
  },
}));

export const resultWithExtraDemoTitle = 'With Extra';

export function ResultWithExtraDemo() {
  const styles = useStyles();

  return (
    <>
      <View style={styles.stack}>
        <View style={styles.panel}>
          <Result
            status="success"
            titleText="Done"
            subtitleText="Operation completed successfully."
            extra={<Button size="small">Back Home</Button>}
          />
        </View>
        <View style={styles.panel}>
          <Result
            status="info"
            icon={<Icon icon="settings" size="large" color="colorInfo" />}
            titleText="Custom icon"
            subtitleText="Custom icon node overrides status icon."
          />
        </View>
      </View>
    </>
  );
}

export default ResultWithExtraDemo;
