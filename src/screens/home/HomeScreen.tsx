import React from 'react';
import { Pressable, View } from 'react-native';
import { Drawer, Text } from '@pennyspring/component';
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
    backgroundColor: token.colorBgContainer,
    borderColor: token.colorBorderSecondary,
    borderRadius: token.borderRadius,
    borderWidth: token.lineWidth,
    paddingHorizontal: token.padding,
    paddingVertical: token.paddingSM,
  },
  optionButtonPressed: {
    backgroundColor: token.colorBgTextActive,
  },
  menuButton: {
    alignItems: 'center',
    borderRadius: token.borderRadius,
    height: token.controlHeight,
    justifyContent: 'center',
    width: token.controlHeight,
  },
  menuButtonPressed: {
    backgroundColor: token.colorBgTextActive,
  },
}));

interface MenuButtonProps {
  onPress: () => void;
}

function MenuButton({ onPress }: MenuButtonProps) {
  const styles = useStyles();
  const { token } = useTheme();

  return (
    <Pressable
      accessibilityLabel="打开菜单"
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [
        styles.menuButton,
        pressed && styles.menuButtonPressed,
      ]}
    >
      <ListIcon
        color={token.colorIconHover}
        size={token.fontSizeHeading3}
        weight="bold"
      />
    </Pressable>
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
      <Pressable
        accessibilityLabel="打开 Test Screen"
        accessibilityRole="button"
        onPress={onOpenTestScreen}
        style={({ pressed }) => [
          styles.optionButton,
          pressed && styles.optionButtonPressed,
        ]}
      >
        <Text size="md" weight="strong">
          Test Screen
        </Text>
      </Pressable>
      <Pressable
        accessibilityLabel="打开 Component Preview"
        accessibilityRole="button"
        onPress={onOpenComponentPreview}
        style={({ pressed }) => [
          styles.optionButton,
          pressed && styles.optionButtonPressed,
        ]}
      >
        <Text size="md" weight="strong">
          Component Preview
        </Text>
      </Pressable>
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
      onClose={closeDrawer}
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
