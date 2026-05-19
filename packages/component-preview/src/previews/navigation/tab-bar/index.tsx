import React from 'react';
import { View } from 'react-native';
import { TabBar, Text } from '@pennyspring/component';
import { HouseIcon, ListIcon, UserIcon, WalletIcon } from 'phosphor-react-native';
import { createUseSheetStyle, useTheme } from '@pennyspring/theme';
import { PreviewScaffold, PreviewSection } from '../../PreviewScaffold';
import type { TabBarValue } from '@pennyspring/component';

const useStyles = createUseSheetStyle(token => ({
  status: {
    paddingVertical: token.paddingXXS,
  },
}));

export function TabBarPreview() {
  const styles = useStyles();
  const { token } = useTheme();
  const [value, setValue] = React.useState<TabBarValue>('records');
  const [lastPress, setLastPress] = React.useState('No tab pressed');

  const items = [
    {
      key: 'home',
      titleText: 'Home',
      icon: <HouseIcon size={token.fontSizeLG} color={token.colorIcon} />,
      activeIcon: <HouseIcon size={token.fontSizeLG} color={token.colorPrimary} weight="fill" />,
    },
    {
      key: 'records',
      titleText: 'Records',
      icon: <ListIcon size={token.fontSizeLG} color={token.colorIcon} />,
      activeIcon: <ListIcon size={token.fontSizeLG} color={token.colorPrimary} weight="fill" />,
      badgeText: '9',
    },
    {
      key: 'budget',
      titleText: 'Budget',
      icon: <WalletIcon size={token.fontSizeLG} color={token.colorIcon} />,
      activeIcon: <WalletIcon size={token.fontSizeLG} color={token.colorPrimary} weight="fill" />,
    },
    {
      key: 'me',
      titleText: 'Me',
      icon: <UserIcon size={token.fontSizeLG} color={token.colorIcon} />,
      activeIcon: <UserIcon size={token.fontSizeLG} color={token.colorPrimary} weight="fill" />,
      disabled: true,
    },
  ] as const;

  return (
    <PreviewScaffold>
      <PreviewSection title="Controlled and onPress">
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
      </PreviewSection>

      <PreviewSection title="Size, disabled and safeAreaInsetBottom">
        <View>
          <TabBar items={[...items]} size="small" defaultValue="home" safeAreaInsetBottom={false} />
          <TabBar items={[...items]} size="large" defaultValue="budget" safeAreaInsetBottom={false} />
          <TabBar items={[...items]} defaultValue="home" safeAreaInsetBottom />
          <Text color="description" size="sm">
            The "Me" tab is disabled.
          </Text>
        </View>
      </PreviewSection>
    </PreviewScaffold>
  );
}
