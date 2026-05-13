import React from 'react';
import { View } from 'react-native';
import { Button, Checkbox, Drawer, Text } from '@pennyspring/component';
import { createUseSheetStyle } from '@pennyspring/theme';
import {
  PreviewRow,
  PreviewScaffold,
  PreviewSection,
} from '../../PreviewScaffold';

type DrawerPosition = 'left' | 'right';
type DrawerType = 'front' | 'slide' | 'back';

interface DrawerContentProps {
  onClose: () => void;
  position: DrawerPosition;
  title: string;
}

const DRAWER_POSITIONS: DrawerPosition[] = ['left', 'right'];
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

export function DrawerPreview() {
  const styles = useStyles();
  const [open, setOpen] = React.useState(false);
  const [widthDemoOpen, setWidthDemoOpen] = React.useState(false);
  const [layoutWidthDemoOpen, setLayoutWidthDemoOpen] = React.useState(true);
  const [layoutOpenMap, setLayoutOpenMap] = React.useState<
    Record<DrawerType, boolean>
  >({
    front: true,
    slide: true,
    back: true,
  });
  const [position, setPosition] = React.useState<DrawerPosition>('left');

  const openDrawer = React.useCallback((nextPosition: DrawerPosition) => {
    setPosition(nextPosition);
    setOpen(true);
  }, []);

  const closeDrawer = React.useCallback(() => {
    setOpen(false);
  }, []);

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
    <PreviewScaffold>
      <PreviewSection title="Controlled">
        <PreviewRow>
          {DRAWER_POSITIONS.map(item => (
            <Button
              key={item}
              type={open && position === item ? 'primary' : 'default'}
              onPress={() => {
                openDrawer(item);
              }}
            >
              Open {item}
            </Button>
          ))}
        </PreviewRow>
      </PreviewSection>

      <PreviewSection title="Embedded layout">
        {DRAWER_TYPES.map(item => {
          const layoutOpen = layoutOpenMap[item];

          return (
            <View key={`layout-${item}`}>
              <PreviewRow>
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
              </PreviewRow>
              <View style={styles.frame}>
                <Drawer.Layout
                  drawerType={item}
                  open={layoutOpen}
                  onCancel={() => {
                    updateLayoutOpen(item, false);
                  }}
                  onOpen={() => {
                    updateLayoutOpen(item, true);
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
      </PreviewSection>

      <PreviewSection title="Width">
        <PreviewRow>
          <Button
            type={widthDemoOpen ? 'primary' : 'default'}
            onPress={() => {
              setWidthDemoOpen(current => !current);
            }}
          >
            {widthDemoOpen ? 'Close 50% Drawer' : 'Open 50% Drawer'}
          </Button>
        </PreviewRow>
        <PreviewRow>
          <Text color="secondary">
            Drawer width=&quot;50%&quot; (based on viewport width)
          </Text>
        </PreviewRow>
        <PreviewRow>
          <Checkbox
            displayType="button"
            value={layoutWidthDemoOpen}
            onChange={() => {
              setLayoutWidthDemoOpen(current => !current);
            }}
          >
            {layoutWidthDemoOpen
              ? 'Close 50% Layout Drawer'
              : 'Open 50% Layout Drawer'}
          </Checkbox>
        </PreviewRow>
        <PreviewRow>
          <Text color="secondary">
            Drawer.Layout width=&quot;50%&quot; (based on main content width)
          </Text>
        </PreviewRow>
        <View style={styles.frame}>
          <Drawer.Layout
            drawerType="slide"
            width="50%"
            open={layoutWidthDemoOpen}
            onCancel={() => {
              setLayoutWidthDemoOpen(false);
            }}
            onOpen={() => {
              setLayoutWidthDemoOpen(true);
            }}
            renderDrawerContent={() => (
              <DrawerContent
                position="left"
                title='layout width "50%"'
                onClose={() => {
                  setLayoutWidthDemoOpen(false);
                }}
              />
            )}
          >
            <View style={styles.frameMain}>
              <Text color="heading" weight="strong">
                Main content (width demo)
              </Text>
              <Text color="secondary">
                Slide mode with width=&quot;50%&quot;
              </Text>
            </View>
          </Drawer.Layout>
        </View>
      </PreviewSection>

      <Drawer
        drawerPosition={position}
        open={open}
        onCancel={closeDrawer}
        onOpen={() => {
          setOpen(true);
        }}
      >
        <DrawerContent
          position={position}
          title="drawer"
          onClose={closeDrawer}
        />
      </Drawer>
      <Drawer
        drawerPosition="left"
        open={widthDemoOpen}
        width="50%"
        onCancel={() => {
          setWidthDemoOpen(false);
        }}
        onOpen={() => {
          setWidthDemoOpen(true);
        }}
      >
        <DrawerContent
          position="left"
          title='drawer width "50%"'
          onClose={() => {
            setWidthDemoOpen(false);
          }}
        />
      </Drawer>
    </PreviewScaffold>
  );
}
