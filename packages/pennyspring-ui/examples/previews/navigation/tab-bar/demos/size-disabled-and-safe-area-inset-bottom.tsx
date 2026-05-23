import React from 'react';
import { View } from 'react-native';
import { TabBar, Text } from '@pennyspring/ui';
import {
  HouseIcon,
  ListIcon,
  UserIcon,
  WalletIcon,
} from 'phosphor-react-native';
import { useTheme } from '@pennyspring/theme';

export const tabBarSizeDisabledAndSafeAreaInsetBottomDemoTitle =
  'Size, disabled and safeAreaInsetBottom';

export function TabBarSizeDisabledAndSafeAreaInsetBottomDemo() {
  const { token } = useTheme();
  const items = [
    {
      key: 'home',
      titleText: 'Home',
      icon: <HouseIcon size={token.fontSizeLG} color={token.colorIcon} />,
      activeIcon: (
        <HouseIcon
          size={token.fontSizeLG}
          color={token.colorPrimary}
          weight="fill"
        />
      ),
    },
    {
      key: 'records',
      titleText: 'Records',
      icon: <ListIcon size={token.fontSizeLG} color={token.colorIcon} />,
      activeIcon: (
        <ListIcon
          size={token.fontSizeLG}
          color={token.colorPrimary}
          weight="fill"
        />
      ),
      badgeText: '9',
    },
    {
      key: 'budget',
      titleText: 'Budget',
      icon: <WalletIcon size={token.fontSizeLG} color={token.colorIcon} />,
      activeIcon: (
        <WalletIcon
          size={token.fontSizeLG}
          color={token.colorPrimary}
          weight="fill"
        />
      ),
    },
    {
      key: 'me',
      titleText: 'Me',
      icon: <UserIcon size={token.fontSizeLG} color={token.colorIcon} />,
      activeIcon: (
        <UserIcon
          size={token.fontSizeLG}
          color={token.colorPrimary}
          weight="fill"
        />
      ),
      disabled: true,
    },
  ] as const;

  return (
    <>
      <View>
        <TabBar
          items={[...items]}
          size="small"
          defaultValue="home"
          safeAreaInsetBottom={false}
        />
        <TabBar
          items={[...items]}
          size="large"
          defaultValue="budget"
          safeAreaInsetBottom={false}
        />
        <TabBar items={[...items]} defaultValue="home" safeAreaInsetBottom />
        <Text color="description" size="sm">
          The "Me" tab is disabled.
        </Text>
      </View>
    </>
  );
}

export default TabBarSizeDisabledAndSafeAreaInsetBottomDemo;
