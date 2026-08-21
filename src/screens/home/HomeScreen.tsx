import React from 'react';
import { Pressable, TouchableOpacity, View } from 'react-native';
import {
  Column,
  Divider,
  Drawer,
  FloatingActionGroup,
  Row,
  Text,
} from '@pennyspring/ui';
import { createUseSheetStyle, useTheme } from '@pennyspring/theme';
import { useIsFocused } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ListIcon, Moon, Sun } from 'phosphor-react-native';

import {
  HomeTabsNavigator,
  ROOT_ROUTES,
  useNavigation,
} from '../../navigation';
import { RecordSyncProvider } from './recordSync';
import { QuickTemplatePanel } from '../quickTemplate/QuickTemplatePanel';
import { useThemeMode } from '../../contexts/ThemeModeContext';

const APP_NAME = 'PennySpring';
const APP_VERSION = '0.0.1';

const useStyles = createUseSheetStyle(token => ({
  screen: {
    backgroundColor: token.colorBgContainer,
    flex: 1,
  },
  drawerContent: {
    flex: 1,
  },
  appInfoSection: {
    paddingHorizontal: token.paddingLG,
    paddingTop: token.paddingLG,
    paddingBottom: token.paddingMD,
  },
  appName: {
    marginBottom: token.marginXXS,
  },
  navigationSection: {
    flex: 1,
  },
  navItem: {
    paddingHorizontal: token.paddingLG,
    paddingVertical: token.padding,
    borderBottomWidth: token.lineWidth,
    borderBottomColor: token.colorBorder,
  },
}));

interface HomeHeaderLeftProps {
  onMenuPress: () => void;
}

function HomeHeaderLeft({ onMenuPress }: HomeHeaderLeftProps) {
  return (
    <Row align="center" gap="normal">
      <Pressable onPress={onMenuPress}>
        <ListIcon size={32} />
      </Pressable>
      <Text numberOfLines={1} size="lg" weight="strong">
        {APP_NAME}
      </Text>
    </Row>
  );
}

function ThemeSwitchButton() {
  const { themeMode, setThemeMode } = useThemeMode();
  const isDark = themeMode === 'dark';
  const { token } = useTheme()

  const handleToggle = React.useCallback(() => {
    setThemeMode(isDark ? 'default' : 'dark');
  }, [isDark, setThemeMode]);

  const IconComp = isDark ? Sun : Moon;
  return (
    <Pressable onPress={handleToggle}>
      <IconComp size={28} color={token.colorText} />
    </Pressable>
  );
}

interface NavigationItem {
  label: string;
  route: string;
}

function DrawerContent() {
  const styles = useStyles();
  const navigation = useNavigation();

  const navigationItems: NavigationItem[] = [
    { label: '账本管理', route: ROOT_ROUTES.BookManage },
    { label: '资产管理', route: ROOT_ROUTES.AssetManage },
    { label: '类型管理', route: ROOT_ROUTES.TypeManage },
    { label: '标签管理', route: ROOT_ROUTES.TagManage },
    { label: '图标预览', route: ROOT_ROUTES.IconPreview },
    { label: '主题预览', route: ROOT_ROUTES.ThemePreview },
    { label: 'Test Screen', route: ROOT_ROUTES.Test },
  ];

  const handleNavigate = (route: string) => {
    navigation.navigate(route as any);
  };

  return (
    <Column style={styles.drawerContent}>
      <View style={styles.appInfoSection}>
        <Text size="h3" weight="strong" style={styles.appName}>
          {APP_NAME}
        </Text>
        <Text size="sm" color="secondary">
          版本 {APP_VERSION}
        </Text>
      </View>

      <Divider />

      <Column style={styles.navigationSection}>
        {navigationItems.map(item => (
          <TouchableOpacity
            key={item.route}
            onPress={() => handleNavigate(item.route)}
            style={styles.navItem}
          >
            <Text size="md">{item.label}</Text>
          </TouchableOpacity>
        ))}
      </Column>
    </Column>
  );
}

export function HomeScreen() {
  const styles = useStyles();
  const navigation = useNavigation();
  const isFocused = useIsFocused();
  const [isDrawerOpen, setIsDrawerOpen] = React.useState(false);
  const [isTemplatePanelOpen, setIsTemplatePanelOpen] = React.useState(false);

  const openDrawer = React.useCallback(() => {
    setIsDrawerOpen(true);
  }, []);

  const closeDrawer = React.useCallback(() => {
    setIsDrawerOpen(false);
  }, []);

  return (
    <RecordSyncProvider>
      <SafeAreaView edges={['top']} style={styles.screen}>
        <Drawer.Layout
          onCancel={closeDrawer}
          onOpenChange={setIsDrawerOpen}
          open={isDrawerOpen}
          renderDrawerContent={() => <DrawerContent />}
        >
          <HomeTabsNavigator
            leftActions={<HomeHeaderLeft onMenuPress={openDrawer} />}
            rightActions={<ThemeSwitchButton />}
          />
        </Drawer.Layout>
        {isFocused && (
          <FloatingActionGroup
            defaultVisibleCount={2}
            actions={[
              {
                key: 'quick-template',
                icon: 'list',
                onPress: () => setIsTemplatePanelOpen(true),
                buttonProps: { type: 'default' },
              },
              {
                key: 'add-record',
                icon: 'plus',
                onPress: () => navigation.navigate('AddRecord'),
              },
            ]}
          />
        )}
        <QuickTemplatePanel
          open={isTemplatePanelOpen}
          onOpenChange={setIsTemplatePanelOpen}
        />
      </SafeAreaView>
    </RecordSyncProvider>
  );
}
