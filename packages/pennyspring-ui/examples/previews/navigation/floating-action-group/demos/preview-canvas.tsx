import React from 'react';
import { View } from 'react-native';
import type { FloatingPlacement, PortalMountPoint } from '@pennyspring/ui';
import { FloatingActionGroup, Text } from '@pennyspring/ui';
import { createUseSheetStyle } from '@pennyspring/theme';
import {
  CompassIcon,
  ListIcon,
  MapPinIcon,
  PlusIcon,
} from 'phosphor-react-native';

const useStyles = createUseSheetStyle(token => ({
  canvas: {
    minHeight: token.controlHeightLG * 5,
    borderWidth: token.lineWidth,
    borderColor: token.colorBorderSecondary,
    borderRadius: token.borderRadius,
    backgroundColor: token.colorBgContainer,
    overflow: 'hidden',
    padding: token.paddingSM,
    gap: token.marginXXS,
  },
  helper: {
    maxWidth: '50%',
  },
  statusLine: {
    paddingVertical: token.paddingXXS,
  },
}));

export function FloatingActionGroupPreviewCanvasDemo() {
  const styles = useStyles();
  const [placement, _setPlacement] =
    React.useState<FloatingPlacement>('bottomRight');
  const [mountPoint, _setMountPoint] = React.useState<PortalMountPoint>('auto');
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
      <View style={styles.canvas}>
        <View style={styles.statusLine}>
          <Text color="description" size="sm">
            {lastEvent}
          </Text>
        </View>
        <View style={styles.helper}>
          <Text color="secondary" size="sm">
            Trigger “更多” to expand hidden actions. Tap outside to collapse.
          </Text>
        </View>
        <FloatingActionGroup
          collapseOnOutsidePress={false}
          actions={actions}
          defaultVisibleCount={1}
          mountPoint={mountPoint}
          placement={placement}
        />
      </View>
    </>
  );
}

export default FloatingActionGroupPreviewCanvasDemo;
