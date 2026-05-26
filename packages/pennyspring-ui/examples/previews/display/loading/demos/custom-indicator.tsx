import React from 'react';
import { View } from 'react-native';
import { Icon, Loading } from '@pennyspring/ui';
import { createUseSheetStyle } from '@pennyspring/theme';

const useStyles = createUseSheetStyle(token => ({
  stack: {
    gap: token.marginSM,
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

export const loadingCustomIndicatorDemoTitle = 'Custom indicator';

export function LoadingCustomIndicatorDemo() {
  const styles = useStyles();

  return (
    <>
      <View style={styles.stack}>
        <View style={styles.panel}>
          <Loading
            indicator={
              <Icon icon="notification" size="large" color="primary" />
            }
            text="Icon indicator"
          />
        </View>
        <View style={styles.panel}>
          <Loading
            indicator={
              <Icon icon="settings" size="large" color="textDescription" />
            }
            text="Static indicator"
            vertical
          />
        </View>
      </View>
    </>
  );
}

export default LoadingCustomIndicatorDemo;
