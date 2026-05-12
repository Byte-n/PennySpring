import React from 'react';
import { View } from 'react-native';
import { TabBar, Text } from '@pennyspring/component';
import { HouseIcon, ListIcon, UserIcon, WalletIcon } from 'phosphor-react-native';
import { useTheme } from '@pennyspring/theme';
import { PreviewScaffold, PreviewSection } from '../../PreviewScaffold';

export function TabBarPreview() {
  const { token } = useTheme();

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
      <PreviewSection title="Default">
        <TabBar items={[...items]} defaultValue="records" safeAreaInsetBottom={false} />
      </PreviewSection>

      <PreviewSection title="Size and disabled">
        <View>
          <TabBar items={[...items]} size="small" defaultValue="home" safeAreaInsetBottom={false} />
          <TabBar items={[...items]} size="large" defaultValue="budget" safeAreaInsetBottom={false} />
          <Text color="description" size="sm">
            The "Me" tab is disabled.
          </Text>
        </View>
      </PreviewSection>
    </PreviewScaffold>
  );
}
