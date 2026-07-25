import React from 'react';
import { View } from 'react-native';
import { Text } from '@pennyspring/ui';
import { useTheme } from '@pennyspring/theme';

export function TestScreen() {
  const { token } = useTheme();
  return (
    <View style={{ backgroundColor: token.colorBgLayout, flex: 1 }}>
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
