import React from 'react';
import { TouchableOpacity, View } from 'react-native';
import {
  Column,
  Divider,
  Drawer,
  FloatingActionGroup,
  Text,
  Button,
} from '@pennyspring/ui';
import { createUseSheetStyle } from '@pennyspring/theme';
import { useIsFocused } from '@react-navigation/native';
import { ListIcon } from 'phosphor-react-native';

import {
  HomeTabsNavigator,
  ROOT_ROUTES,
  useNavigation,
} from '../../navigation';
import { RecordSyncProvider } from './recordSync';
import { QuickTemplatePanel } from '../quickTemplate/QuickTemplatePanel';

const APP_NAME = 'PennySpring';
const APP_VERSION = '0.0.1';

const useStyles = createUseSheetStyle(token => ({
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
  menuButton: {
    width: token.controlHeight,
  },
}));

interface MenuButtonProps {
  onPress: () => void;
}

function MenuButton({ onPress }: MenuButtonProps) {
  const styles = useStyles();

  return (
    <Button
      icon={ListIcon}
      iconProps={{ weight: 'bold' }}
      onPress={onPress}
      shape="circle"
      style={styles.menuButton}
      type="text"
    />
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
      <Drawer.Layout
        onCancel={closeDrawer}
        onOpenChange={setIsDrawerOpen}
        open={isDrawerOpen}
        renderDrawerContent={() => <DrawerContent />}
      >
        <HomeTabsNavigator leftActions={<MenuButton onPress={openDrawer} />} />
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
    </RecordSyncProvider>
  );
}
