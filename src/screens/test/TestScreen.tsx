import React from 'react';
import { View } from 'react-native';
import { Text } from '@pennyspring/ui';
import { createUseSheetStyle } from '@pennyspring/theme';

const useStyles = createUseSheetStyle(token => ({
  container: {
    backgroundColor: token.colorBgLayout,
    flex: 1,
  },
}));

export function TestScreen() {
  const styles = useStyles();
  return (
    <View style={styles.container}>
      <Text>Test</Text>
      <Text>Test</Text>
      <Text>Test</Text>
      <Text>Test</Text>
      <Text>Test</Text>
      <Text>Test</Text>
      <Text>Test</Text>
      <Text>Test</Text>
    </View>
  );
}
