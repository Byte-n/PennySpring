import React from 'react';
import { View } from 'react-native';
import { Space, Button, Checkbox, Drawer, Text } from '@pennyspring/ui';
import { createUseSheetStyle } from '@pennyspring/theme';

type DrawerPosition = 'left' | 'right';

type DrawerType = 'front' | 'slide' | 'back';

interface DrawerContentProps {
  onClose: () => void;
  position: DrawerPosition;
  title: string;
}

const DRAWER_TYPES: DrawerType[] = ['front', 'slide', 'back'];

const useStyles = createUseSheetStyle(token => ({
  frame: {
    minHeight:
      token.controlHeightLG + token.controlHeightLG + token.controlHeightLG,
    borderWidth: token.lineWidth,
    borderColor: token.colorBorderSecondary,
    borderRadius: token.borderRadius,
    overflow: 'hidden',
    backgroundColor: token.colorBgLayout,
  },
  frameMain: {
    flex: 1,
    justifyContent: 'center',
    gap: token.marginSM,
    padding: token.paddingLG,
  },
  drawerContent: {
    flex: 1,
    gap: token.marginMD,
  },
  drawerHeader: {
    gap: token.marginXXS,
  },
  navigationList: {
    gap: token.marginXS,
  },
  navigationItem: {
    borderWidth: token.lineWidth,
    borderColor: token.colorBorderSecondary,
    borderRadius: token.borderRadiusSM,
    paddingHorizontal: token.paddingMD,
    paddingVertical: token.paddingSM,
    backgroundColor: token.colorBgContainer,
  },
  navigationItemActive: {
    borderColor: token.colorPrimaryBorder,
    backgroundColor: token.colorPrimaryBg,
  },
  footer: {
    marginTop: 'auto',
    gap: token.marginXS,
  },
}));

function DrawerContent({ onClose, position, title }: DrawerContentProps) {
  const styles = useStyles();

  return (
    <View style={styles.drawerContent}>
      <View style={styles.drawerHeader}>
        <Text color="heading" weight="strong">
          {title}
        </Text>
        <Text color="secondary">Position: {position}</Text>
      </View>
      <View style={styles.navigationList}>
        <View style={[styles.navigationItem, styles.navigationItemActive]}>
          <Text color="heading" weight="medium">
            Overview
          </Text>
          <Text color="description" size="sm">
            Current section
          </Text>
        </View>
        <View style={styles.navigationItem}>
          <Text color="heading" weight="medium">
            Activity
          </Text>
          <Text color="description" size="sm">
            Recent updates
          </Text>
        </View>
        <View style={styles.navigationItem}>
          <Text color="heading" weight="medium">
            Settings
          </Text>
          <Text color="description" size="sm">
            Drawer actions
          </Text>
        </View>
      </View>
      <View style={styles.footer}>
        <Button block onPress={onClose}>
          Close drawer
        </Button>
      </View>
    </View>
  );
}

export function DrawerEmbeddedLayoutDemo() {
  const styles = useStyles();
  const [layoutOpenMap, setLayoutOpenMap] = React.useState<
    Record<DrawerType, boolean>
  >({
    front: true,
    slide: true,
    back: true,
  });
  const updateLayoutOpen = React.useCallback(
    (type: DrawerType, nextOpen: boolean) => {
      setLayoutOpenMap(current => ({
        ...current,
        [type]: nextOpen,
      }));
    },
    [],
  );
  const toggleLayoutDrawer = React.useCallback((type: DrawerType) => {
    setLayoutOpenMap(current => ({
      ...current,
      [type]: !current[type],
    }));
  }, []);

  return (
    <>
      {DRAWER_TYPES.map(item => {
        const layoutOpen = layoutOpenMap[item];

        return (
          <View key={`layout-${item}`}>
            <Space align="center" size="large" wrap>
              <Checkbox
                displayType="button"
                value={layoutOpen}
                onChange={() => {
                  toggleLayoutDrawer(item);
                }}
              >
                {layoutOpen
                  ? `Close ${item} layout drawer`
                  : `Open ${item} layout drawer`}
              </Checkbox>
            </Space>
            <View style={styles.frame}>
              <Drawer.Layout
                drawerType={item}
                open={layoutOpen}
                onCancel={() => {
                  updateLayoutOpen(item, false);
                }}
                onOpenChange={nextOpen => {
                  updateLayoutOpen(item, nextOpen);
                }}
                renderDrawerContent={() => (
                  <DrawerContent
                    position="left"
                    title={`${item} pinned preview`}
                    onClose={() => {
                      updateLayoutOpen(item, false);
                    }}
                  />
                )}
              >
                <View style={styles.frameMain}>
                  <Text color="heading" weight="strong">
                    Main content ({item})
                  </Text>
                  <Text color="secondary">content</Text>
                </View>
              </Drawer.Layout>
            </View>
          </View>
        );
      })}
    </>
  );
}

export default DrawerEmbeddedLayoutDemo;
