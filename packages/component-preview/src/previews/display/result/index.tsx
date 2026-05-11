import React from 'react';
import { View } from 'react-native';
import { Button, Result } from '@pennyspring/component';
import { createUseSheetStyle } from '@pennyspring/theme';
import { PreviewScaffold, PreviewSection } from '../../PreviewScaffold';

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

export function ResultPreview() {
  const styles = useStyles();

  return (
    <PreviewScaffold>
      <PreviewSection title="Status">
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
      </PreviewSection>

      <PreviewSection title="With Extra">
        <View style={styles.stack}>
          <View style={styles.panel}>
            <Result
              status="success"
              titleText="Done"
              subtitleText="Operation completed successfully."
              extra={<Button size="small">Back Home</Button>}
            />
          </View>
        </View>
      </PreviewSection>

      <PreviewSection title="Size">
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
      </PreviewSection>
    </PreviewScaffold>
  );
}
