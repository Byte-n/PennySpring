import React from 'react';
import { View } from 'react-native';
import { Button, Drawer, Text } from '@pennyspring/component';
import { createUseSheetStyle, useTheme } from '@pennyspring/theme';
import { ListIcon } from 'phosphor-react-native';

import {
  HomeTabsNavigator,
  ROOT_ROUTES,
  useNavigation,
} from '../../navigation';

const useStyles = createUseSheetStyle(token => ({
  drawerContent: {
    flex: 1,
    gap: token.paddingSM,
  },
  optionButton: {
    justifyContent: 'flex-start',
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
  const { token } = useTheme();

  return (
    <Button
      accessibilityLabel="打开菜单"
      icon={(
        <ListIcon
          color={token.colorIconHover}
          size={token.fontSizeHeading3}
          weight="bold"
        />
      )}
      onPress={onPress}
      shape="circle"
      style={styles.menuButton}
      type="text"
    />
  );
}

function DrawerOptionList({
  onOpenComponentPreview,
  onOpenTestScreen,
}: {
  onOpenComponentPreview: () => void;
  onOpenTestScreen: () => void;
}) {
  const styles = useStyles();

  return (
    <View style={styles.drawerContent}>
      <Button
        accessibilityLabel="打开 Test Screen"
        block
        onPress={onOpenTestScreen}
        style={styles.optionButton}
        type="default"
      >
        <Text size="md" weight="strong">
          Test Screen
        </Text>
      </Button>
      <Button
        accessibilityLabel="打开 Component Preview"
        block
        onPress={onOpenComponentPreview}
        style={styles.optionButton}
        type="default"
      >
        <Text size="md" weight="strong">
          Component Preview
        </Text>
      </Button>
    </View>
  );
}

export function HomeScreen() {
  const navigation = useNavigation();
  const [isDrawerOpen, setIsDrawerOpen] = React.useState(false);

  const openDrawer = React.useCallback(() => {
    setIsDrawerOpen(true);
  }, []);

  const closeDrawer = React.useCallback(() => {
    setIsDrawerOpen(false);
  }, []);

  const openTestScreen = React.useCallback(() => {
    setIsDrawerOpen(false);
    navigation.navigate(ROOT_ROUTES.Test);
  }, [navigation]);

  const openComponentPreview = React.useCallback(() => {
    setIsDrawerOpen(false);
    navigation.navigate(ROOT_ROUTES.ComponentPreview);
  }, [navigation]);

  return (
    <Drawer.Layout
      onCancel={closeDrawer}
      onOpen={openDrawer}
      open={isDrawerOpen}
      renderDrawerContent={() => (
        <DrawerOptionList
          onOpenComponentPreview={openComponentPreview}
          onOpenTestScreen={openTestScreen}
        />
      )}
    >
      <HomeTabsNavigator leftActions={<MenuButton onPress={openDrawer} />} />
    </Drawer.Layout>
  );
}
