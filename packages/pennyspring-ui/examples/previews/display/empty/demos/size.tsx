import React from 'react';
import { View } from 'react-native';
import { Empty, Icon, Text } from '@pennyspring/ui';
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
  textCenter: {
    textAlign: 'center',
  },
}));

export const emptySizeDemoTitle = 'Size';

export function EmptySizeDemo() {
  const styles = useStyles();

  return (
    <>
      <View style={styles.stack}>
        <View style={styles.panel}>
          <Empty size="small" messageText="Small" />
        </View>
        <View style={styles.panel}>
          <Empty size="normal" messageText="Normal" />
        </View>
        <View style={styles.panel}>
          <Empty
            size="large"
            message={
              <Text size="h4" weight="strong">
                Large
              </Text>
            }
          />
        </View>
        <View style={styles.panel}>
          <Empty
            icon={
              <Icon icon="notification" size="large" color="primary" />
            }
            messageText="Custom icon with messageText"
          />
        </View>
      </View>
    </>
  );
}

export default EmptySizeDemo;
