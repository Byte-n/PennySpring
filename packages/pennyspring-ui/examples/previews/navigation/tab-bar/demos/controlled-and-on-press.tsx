import React from 'react';
import { TabBar, Text } from '@pennyspring/ui';
import {
  HouseIcon,
  ListIcon,
  UserIcon,
  WalletIcon,
} from 'phosphor-react-native';
import { createUseSheetStyle, useTheme } from '@pennyspring/theme';
import type { TabBarValue } from '@pennyspring/ui';

const useStyles = createUseSheetStyle(token => ({
  status: {
    paddingVertical: token.paddingXXS,
  },
}));

export const tabBarControlledAndOnPressDemoTitle = 'Controlled and onPress';

export function TabBarControlledAndOnPressDemo() {
  const styles = useStyles();
  const { token } = useTheme();
  const [value, setValue] = React.useState<TabBarValue>('records');
  const [lastPress, setLastPress] = React.useState('No tab pressed');
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
      <TabBar
        items={[...items]}
        value={value}
        onChange={setValue}
        onPress={(_event, nextValue) => {
          setLastPress(`Pressed: ${String(nextValue)}`);
        }}
        safeAreaInsetBottom={false}
      />
      <Text color="description" size="sm" style={styles.status}>
        Current value: {String(value)} · {lastPress}
      </Text>
    </>
  );
}

export default TabBarControlledAndOnPressDemo;
