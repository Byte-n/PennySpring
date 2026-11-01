import React from 'react';
import { View } from 'react-native';
import type { FloatingPlacement, PortalMountPoint } from '@pennyspring/ui';
import {
  Space,
  Button,
  FloatingActionGroup,
  PortalProvider,
  Text,
} from '@pennyspring/ui';
import { createUseSheetStyle } from '@pennyspring/ui';
import {
  CompassIcon,
  ListIcon,
  MapPinIcon,
  PlusIcon,
} from 'phosphor-react-native';

const PLACEMENTS: FloatingPlacement[] = [
  'bottomRight',
  'bottomLeft',
  'topLeft',
  'topRight',
];

const MOUNT_POINTS: PortalMountPoint[] = ['auto', 'local', 'portal'];

const useStyles = createUseSheetStyle(token => ({
  canvas: {
    minHeight: token.controlHeightLG * 5,
    borderWidth: token.lineWidth,
    borderColor: token.colorBorderSecondary,
    borderRadius: token.borderRadius,
    backgroundColor: token.colorBgContainer,
    overflow: 'hidden',
    padding: token.paddingSM,
  },
  statusLine: {
    paddingVertical: token.paddingXXS,
  },
}));

export function FloatingActionGroupPlacementAndMountPointDemo() {
  const styles = useStyles();
  const [placement, setPlacement] =
    React.useState<FloatingPlacement>('bottomRight');
  const [mountPoint, setMountPoint] = React.useState<PortalMountPoint>('auto');
  const [lastEvent, setLastEvent] = React.useState('No action yet');
  const actions = React.useMemo(
    () => [
      {
        key: 'create',
        label: 'Create',
        icon: PlusIcon,
        onPress: () => {
          setLastEvent('Pressed Create');
        },
      },
      {
        key: 'map',
        label: 'Map',
        icon: MapPinIcon,
        onPress: () => {
          setLastEvent('Pressed Map');
        },
      },
      {
        key: 'list',
        label: 'List',
        icon: ListIcon,
        onPress: () => {
          setLastEvent('Pressed List');
        },
      },
      {
        key: 'focus',
        label: 'Focus',
        icon: CompassIcon,
        onPress: () => {
          setLastEvent('Pressed Focus');
        },
      },
    ],
    [],
  );

  return (
    <>
      <Space direction="vertical" gap="small">
        <View style={styles.statusLine}>
          <Text color="description" size="sm">
            {lastEvent}
          </Text>
        </View>
        <Space align="center" gap="large" wrap>
          {PLACEMENTS.map(item => (
            <Button
              key={item}
              type={placement === item ? 'primary' : 'default'}
              onPress={() => {
                setPlacement(item);
                setLastEvent(`Placement set to ${item}`);
              }}
            >
              {item}
            </Button>
          ))}
        </Space>
        <Space align="center" gap="large" wrap>
          {MOUNT_POINTS.map(item => (
            <Button
              key={item}
              type={mountPoint === item ? 'primary' : 'default'}
              onPress={() => {
                setMountPoint(item);
                setLastEvent(`mountPoint set to ${item}`);
              }}
            >
              {item}
            </Button>
          ))}
        </Space>
      </Space>
      <View style={styles.canvas}>
        <PortalProvider>
          <FloatingActionGroup
            actions={actions}
            defaultVisibleCount={1}
            mountPoint={mountPoint}
            placement={placement}
          />
        </PortalProvider>
      </View>
    </>
  );
}

export default FloatingActionGroupPlacementAndMountPointDemo;
