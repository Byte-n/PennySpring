import React from 'react';
import { View } from 'react-native';
import { Space, Avatar, Badge } from '@pennyspring/ui';
import { createUseSheetStyle } from '@pennyspring/theme';

const BADGE_COLORS = [
  'default',
  'primary',
  'success',
  'warning',
  'danger',
  'info',
] as const;

const useStyles = createUseSheetStyle(token => ({
  stack: {
    gap: token.marginSM,
  },
  sampleWrap: {
    marginRight: token.marginSM,
    marginBottom: token.marginSM,
  },
}));

export const badgeColorAndSizeDemoTitle = 'Color and size';

export function BadgeColorAndSizeDemo() {
  const styles = useStyles();

  return (
    <>
      <View style={styles.stack}>
        <Space align="center" size="large" wrap>
          {BADGE_COLORS.map(color => (
            <View key={color} style={styles.sampleWrap}>
              <Badge count={9} color={color} size="small">
                <Avatar size="small" text="S" />
              </Badge>
            </View>
          ))}
        </Space>
        <Space align="center" size="large" wrap>
          {BADGE_COLORS.map(color => (
            <View key={`${color}-dot`} style={styles.sampleWrap}>
              <Badge dot color={color}>
                <Avatar size="small" text="D" />
              </Badge>
            </View>
          ))}
        </Space>
        <Space align="center" size="large" wrap>
          <Badge count={9} color="geekblue" size="small">
            <Avatar size="small" text="S" />
          </Badge>
          <Badge count={9} color="geekblue" size="normal">
            <Avatar size="normal" text="N" />
          </Badge>
          <Badge count={9} color="geekblue" size="large">
            <Avatar size="large" text="L" />
          </Badge>
        </Space>
      </View>
    </>
  );
}

export default BadgeColorAndSizeDemo;
