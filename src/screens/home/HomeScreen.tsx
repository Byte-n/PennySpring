import React from 'react';
import { Drawer, FloatingActionGroup } from '@pennyspring/ui';
import type { DrawerLayoutStyles } from '@pennyspring/ui';
import { createUseSheetStyle, useTheme } from '@pennyspring/ui';
import { useIsFocused } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AgentFloatingEntry } from '../../agent/ui/AgentFloatingEntry';
import {
  HomeTabsNavigator,
  ROOT_ROUTES,
  useNavigation,
} from '../../navigation';
import type { RootStackParamList } from '../../navigation/types';
import { QuickTemplatePanel } from '../quickTemplate/QuickTemplatePanel';
import { DrawerContent } from './DrawerContent';

const useStyles = createUseSheetStyle(token => ({
  screen: {
    backgroundColor: token.colorBgContainer,
    flex: 1,
  },
}));

export function HomeScreen() {
  const styles = useStyles();
  const { token } = useTheme();
  const navigation = useNavigation();
  const isFocused = useIsFocused();
  const [isDrawerOpen, setIsDrawerOpen] = React.useState(false);
  const [isTemplatePanelOpen, setIsTemplatePanelOpen] = React.useState(false);

  const drawerStyles = React.useMemo<DrawerLayoutStyles>(
    () => ({
      drawer: { padding: 0 },
      overlay: { backgroundColor: token.colorBgMask },
    }),
    [token.colorBgMask],
  );

  const openDrawer = React.useCallback(() => {
    setIsDrawerOpen(true);
  }, []);

  const closeDrawer = React.useCallback(() => {
    setIsDrawerOpen(false);
  }, []);

  const handleNavigate = React.useCallback(
    (route: keyof RootStackParamList) => {
      navigation.navigate(route as never);
    },
    [navigation],
  );

  return (
    <SafeAreaView edges={['top']} style={styles.screen}>
      <Drawer.Layout
        onCancel={closeDrawer}
        onOpenChange={setIsDrawerOpen}
        open={isDrawerOpen}
        renderDrawerContent={() => (
          <DrawerContent onClose={closeDrawer} onNavigate={handleNavigate} />
        )}
        styles={drawerStyles}
        width="82%"
      >
        <HomeTabsNavigator openDrawer={openDrawer} />
      </Drawer.Layout>
      {isFocused && (
        <>
          <AgentFloatingEntry />
          <FloatingActionGroup
            actions={[
              {
                key: 'add-record',
                label: '记一笔',
                icon: 'plus',
                onPress: () => navigation.navigate(ROOT_ROUTES.AddRecord),
              },
              {
                key: 'quick-template',
                label: '快捷模板',
                icon: 'list',
                onPress: () => setIsTemplatePanelOpen(true),
              },
            ]}
            draggable
            snapToEdge
          />
        </>
      )}
      <QuickTemplatePanel
        open={isTemplatePanelOpen}
        onOpenChange={setIsTemplatePanelOpen}
      />
    </SafeAreaView>
  );
}
