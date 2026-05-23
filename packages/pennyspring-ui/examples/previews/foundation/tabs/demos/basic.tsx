import React from 'react';
import { View } from 'react-native';
import { Tabs, Text } from '@pennyspring/ui';
import { createUseSheetStyle } from '@pennyspring/theme';

const useStyles = createUseSheetStyle(token => ({
  stack: {
    gap: token.marginSM,
  },
  panel: {
    padding: token.paddingSM,
    borderWidth: token.lineWidth,
    borderColor: token.colorBorderSecondary,
    borderRadius: token.borderRadius,
    backgroundColor: token.colorBgContainer,
  },
}));

export const tabsBasicDemoTitle = 'Basic';

export function TabsBasicDemo() {
  const styles = useStyles();

  return (
    <>
      <View style={styles.stack}>
        <Tabs
          defaultValue="overview"
          items={[
            { value: 'overview', label: 'Overview' },
            { value: 'records', label: 'Records' },
            { value: 'trend', label: 'Trend' },
          ]}
          renderContent={item => (
            <View style={styles.panel}>
              <Text color="description" size="sm">
                Current tab: {String(item.value)}
              </Text>
            </View>
          )}
        />
      </View>
    </>
  );
}

export default TabsBasicDemo;
