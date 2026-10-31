import React from 'react';
import { View } from 'react-native';
import { Space, Icon, type IconName, Text } from '@pennyspring/ui';
import { createUseSheetStyle } from '@pennyspring/ui';

const SHOWCASE_ICONS: readonly IconName[] = [
  'home',
  'search',
  'notification',
  'settings',
  'user',
  'warning',
  'check-circle',
  'close-circle',
];

const useStyles = createUseSheetStyle(token => ({
  iconCell: {
    alignItems: 'center',
    gap: token.marginXXS,
    minWidth: token.controlHeightLG,
  },
  iconLabel: {
    textTransform: 'capitalize',
  },
}));

export function IconCommonIconsDemo() {
  const styles = useStyles();

  return (
    <>
      <Space align="center" gap="large" wrap>
        {SHOWCASE_ICONS.map(name => (
          <View key={name} style={styles.iconCell}>
            <Icon icon={name} />
            <Text color="description" size="sm" style={styles.iconLabel}>
              {name}
            </Text>
          </View>
        ))}
      </Space>
    </>
  );
}

export default IconCommonIconsDemo;
