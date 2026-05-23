import React from 'react';
import { View } from 'react-native';
import { Result } from '@pennyspring/ui';
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

export const resultSizeDemoTitle = 'Size';

export function ResultSizeDemo() {
  const styles = useStyles();

  return (
    <>
      <View style={styles.stack}>
        <View style={styles.panel}>
          <Result
            size="small"
            status="info"
            titleText="Small"
            subtitleText="Compact result."
          />
        </View>
        <View style={styles.panel}>
          <Result
            size="normal"
            status="info"
            titleText="Normal"
            subtitleText="Default result."
          />
        </View>
        <View style={styles.panel}>
          <Result
            size="large"
            status="info"
            titleText="Large"
            subtitleText="Expanded result with larger rhythm."
          />
        </View>
      </View>
    </>
  );
}

export default ResultSizeDemo;
