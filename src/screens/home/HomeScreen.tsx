import React from 'react';
import { View } from 'react-native';
import {
  Button,
  Drawer,
  FloatingActionGroup,
  Text,
} from '@pennyspring/ui';
import { createUseSheetStyle } from '@pennyspring/theme';
import { useIsFocused } from '@react-navigation/native';
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

function DrawerOptionList({
  onOpenAssetManage,
  onOpenBookManage,
  onOpenBusinessPreview,
  onOpenComponentPreview,
  onOpenTagManage,
  onOpenTestScreen,
  onOpenTypeManage,
}: {
  onOpenAssetManage: () => void;
  onOpenBookManage: () => void;
  onOpenBusinessPreview: () => void;
  onOpenComponentPreview: () => void;
  onOpenTagManage: () => void;
  onOpenTestScreen: () => void;
  onOpenTypeManage: () => void;
}) {
  const styles = useStyles();

  return (
    <View style={styles.drawerContent}>
      <Button
        block
        onPress={onOpenBookManage}
        style={styles.optionButton}
        type="default"
      >
        <Text size="md" weight="strong">
          账本管理
        </Text>
      </Button>
      <Button
        block
        onPress={onOpenAssetManage}
        style={styles.optionButton}
        type="default"
      >
        <Text size="md" weight="strong">
          资产管理
        </Text>
      </Button>
      <Button
        block
        onPress={onOpenTypeManage}
        style={styles.optionButton}
        type="default"
      >
        <Text size="md" weight="strong">
          类型管理
        </Text>
      </Button>
      <Button
        block
        onPress={onOpenTagManage}
        style={styles.optionButton}
        type="default"
      >
        <Text size="md" weight="strong">
          标签管理
        </Text>
      </Button>
      <Button
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
        block
        onPress={onOpenBusinessPreview}
        style={styles.optionButton}
        type="default"
      >
        <Text size="md" weight="strong">
          业务预览
        </Text>
      </Button>
      <Button
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
  const isFocused = useIsFocused();
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

  const openBusinessPreview = React.useCallback(() => {
    setIsDrawerOpen(false);
    navigation.navigate(ROOT_ROUTES.BusinessPreview);
  }, [navigation]);

  const openBookManage = React.useCallback(() => {
    setIsDrawerOpen(false);
    navigation.navigate(ROOT_ROUTES.BookManage);
  }, [navigation]);

  const openAssetManage = React.useCallback(() => {
    setIsDrawerOpen(false);
    navigation.navigate(ROOT_ROUTES.AssetManage);
  }, [navigation]);

  const openTypeManage = React.useCallback(() => {
    setIsDrawerOpen(false);
    navigation.navigate(ROOT_ROUTES.TypeManage);
  }, [navigation]);

  const openTagManage = React.useCallback(() => {
    setIsDrawerOpen(false);
    navigation.navigate(ROOT_ROUTES.TagManage);
  }, [navigation]);

  return (
    <>
      <Drawer.Layout
        onCancel={closeDrawer}
        onOpenChange={setIsDrawerOpen}
        open={isDrawerOpen}
        renderDrawerContent={() => (
          <DrawerOptionList
            onOpenAssetManage={openAssetManage}
            onOpenBookManage={openBookManage}
            onOpenBusinessPreview={openBusinessPreview}
            onOpenComponentPreview={openComponentPreview}
            onOpenTagManage={openTagManage}
            onOpenTestScreen={openTestScreen}
            onOpenTypeManage={openTypeManage}
          />
        )}
      >
        <HomeTabsNavigator leftActions={<MenuButton onPress={openDrawer} />} />
      </Drawer.Layout>
      {isFocused && (
        <FloatingActionGroup
          actions={[
            {
              key: 'add-record',
              icon: 'plus',
              onPress: () => navigation.navigate('AddRecord'),
            },
          ]}
        />
      )}
    </>
  );
}
