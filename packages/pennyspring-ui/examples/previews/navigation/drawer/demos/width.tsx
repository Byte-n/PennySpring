import React from 'react';
import { View } from 'react-native';
import { Space, Button, Checkbox, Drawer, Text } from '@pennyspring/ui';
import { createUseSheetStyle } from '@pennyspring/theme';

type DrawerPosition = 'left' | 'right';

interface DrawerContentProps {
  onClose: () => void;
  position: DrawerPosition;
  title: string;
}

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

export function DrawerWidthDemo() {
  const styles = useStyles();
  const [widthDemoOpen, setWidthDemoOpen] = React.useState(false);
  const [layoutWidthDemoOpen, setLayoutWidthDemoOpen] = React.useState(true);

  return (
    <>
      <Space align="center" gap="large" wrap>
        <Button
          type={widthDemoOpen ? 'primary' : 'default'}
          onPress={() => {
            setWidthDemoOpen(current => !current);
          }}
        >
          {widthDemoOpen ? 'Close 50% Drawer' : 'Open 50% Drawer'}
        </Button>
      </Space>
      <Space align="center" gap="large" wrap>
        <Text color="secondary">
          Drawer width=&quot;50%&quot; (based on viewport width)
        </Text>
      </Space>
      <Space align="center" gap="large" wrap>
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
      </Space>
      <Space align="center" gap="large" wrap>
        <Text color="secondary">
          Drawer.Layout width=&quot;50%&quot; (based on main content width)
        </Text>
      </Space>
      <View style={styles.frame}>
        <Drawer.Layout
          drawerType="slide"
          width="50%"
          open={layoutWidthDemoOpen}
          onCancel={() => {
            setLayoutWidthDemoOpen(false);
          }}
          onOpenChange={nextOpen => {
            setLayoutWidthDemoOpen(nextOpen);
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
            <Text color="secondary">Slide mode with width=&quot;50%&quot;</Text>
          </View>
        </Drawer.Layout>
      </View>
    </>
  );
}

export default DrawerWidthDemo;
