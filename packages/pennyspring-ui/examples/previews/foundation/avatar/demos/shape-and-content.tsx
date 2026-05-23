import React from 'react';
import { View } from 'react-native';
import { Space, Avatar, Icon } from '@pennyspring/ui';
import { createUseSheetStyle } from '@pennyspring/theme';

const useStyles = createUseSheetStyle(() => ({
  iconCircle: {
    alignItems: 'center',
    justifyContent: 'center',
  },
}));

export const avatarShapeAndContentDemoTitle = 'Shape and content';

export function AvatarShapeAndContentDemo() {
  const styles = useStyles();

  return (
    <>
      <Space align="center" size="large" wrap>
        <Avatar text="PS" />
        <Avatar shape="square" text="钱" />
        <Avatar
          icon={
            <View style={styles.iconCircle}>
              <Icon icon="user" color="colorIcon" size="large" />
            </View>
          }
        />
        <Avatar disabled text="禁用" />
      </Space>
    </>
  );
}

export default AvatarShapeAndContentDemo;
