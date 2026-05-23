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

export const resultStatusDemoTitle = 'Status';

export function ResultStatusDemo() {
  const styles = useStyles();

  return (
    <>
      <View style={styles.stack}>
        <View style={styles.panel}>
          <Result
            status="success"
            titleText="Payment Successful"
            subtitleText="Your transaction has been completed."
          />
        </View>
        <View style={styles.panel}>
          <Result
            status="warning"
            titleText="Low Balance"
            subtitleText="Your account balance is below the minimum."
          />
        </View>
        <View style={styles.panel}>
          <Result
            status="error"
            titleText="Transfer Failed"
            subtitleText="Please check your network and try again."
          />
        </View>
        <View style={styles.panel}>
          <Result
            status="info"
            titleText="Processing"
            subtitleText="Your request is being processed."
          />
        </View>
      </View>
    </>
  );
}

export default ResultStatusDemo;
