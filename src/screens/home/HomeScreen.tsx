import React from 'react';
import { Pressable } from 'react-native';
import { Drawer, FloatingActionGroup, Row, Text } from '@pennyspring/ui';
import type { DrawerLayoutStyles } from '@pennyspring/ui';
import { createUseSheetStyle, useTheme } from '@pennyspring/theme';
import { useIsFocused } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ListIcon } from 'phosphor-react-native';

import { APP_NAME } from '../../constants/app';
import {
  BOOK_SELECT_ROUTES,
  HomeTabsNavigator,
  ROOT_ROUTES,
  useNavigation,
} from '../../navigation';
import type { RootStackParamList } from '../../navigation/types';
import { RecordSyncProvider } from './recordSync';
import { QuickTemplatePanel } from '../quickTemplate/QuickTemplatePanel';
import { DrawerContent } from './DrawerContent';
import { ThemeSwitchButton } from './ThemeSwitchButton';

const useStyles = createUseSheetStyle(token => ({
  screen: {
    backgroundColor: token.colorBgContainer,
    flex: 1,
  },
}));

interface HomeHeaderLeftProps {
  onMenuPress: () => void;
}

function HomeHeaderLeft({ onMenuPress }: HomeHeaderLeftProps) {
  const { token } = useTheme();
  return (
    <Row align="center" gap="normal">
      <Pressable onPress={onMenuPress}>
        <ListIcon size={28} color={token.colorText} />
      </Pressable>
      <Text numberOfLines={1} size="lg" weight="strong">
        {APP_NAME}
      </Text>
    </Row>
  );
}

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

  const handleOpenBookSelect = React.useCallback(() => {
    navigation.navigate(BOOK_SELECT_ROUTES.BookSelect);
  }, [navigation]);

  const openTemplatePanel = React.useCallback(() => {
    setIsTemplatePanelOpen(true);
  }, []);

  return (
    <RecordSyncProvider>
      <SafeAreaView edges={['top']} style={styles.screen}>
        <Drawer.Layout
          onCancel={closeDrawer}
          onOpenChange={setIsDrawerOpen}
          open={isDrawerOpen}
          renderDrawerContent={() => (
            <DrawerContent
              onClose={closeDrawer}
              onNavigate={handleNavigate}
              onOpenBookSelect={handleOpenBookSelect}
              onOpenTemplate={openTemplatePanel}
            />
          )}
          styles={drawerStyles}
          width="82%"
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
                onPress: () => navigation.navigate(ROOT_ROUTES.AddRecord),
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