import React from 'react';
import { View } from 'react-native';
import { Space, Button, Drawer, Text } from '@pennyspring/ui';
import { createUseSheetStyle } from '@pennyspring/theme';

type DrawerPosition = 'left' | 'right';

const DRAWER_POSITIONS: DrawerPosition[] = ['left', 'right'];

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
}));

export const drawerControlledDemoTitle = 'Controlled';

export function DrawerControlledDemo() {
  const styles = useStyles();
  const [open, setOpen] = React.useState(false);
  const [position, setPosition] = React.useState<DrawerPosition>('left');
  const [lastEvent, setLastEvent] = React.useState('No drawer action yet');
  const openDrawer = React.useCallback((nextPosition: DrawerPosition) => {
    setPosition(nextPosition);
    setLastEvent(`Opened ${nextPosition} drawer`);
    setOpen(true);
  }, []);
  const close = (): void => {
    setOpen(false);
  };

  return (
    <>
      <Space direction="vertical" size="small">
        <Text color="description" size="sm">
          {lastEvent}
        </Text>
        <Space align="center" size="large" wrap>
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
        </Space>
      </Space>
      <View style={styles.frame}>
        <View style={styles.frameMain}>
          <Text color="heading" weight="strong">
            Main content
          </Text>
          <Text color="secondary">
            受控 Drawer 通过 open 与 onOpenChange 双向绑定，可在左/右位置切换。
          </Text>
        </View>
        <Drawer
          drawerPosition={position}
          onCancel={() => {
            setLastEvent(`Drawer cancelled (${position})`);
          }}
          onOpenChange={nextOpen => {
            if (!nextOpen) {
              setOpen(false);
            }
          }}
          open={open}
        >
          <View style={styles.drawerContent}>
            <Text color="heading" weight="strong">
              {position === 'left' ? '左侧抽屉' : '右侧抽屉'}
            </Text>
            <Text color="secondary">
              点击遮罩或下方按钮可关闭，也可滑动边缘关闭。
            </Text>
            <Button
              block
              onPress={() => {
                setLastEvent('Closed via button');
                close();
              }}
            >
              Close drawer
            </Button>
          </View>
        </Drawer>
      </View>
    </>
  );
}

export default DrawerControlledDemo;
