import React from 'react';
import { View } from 'react-native';
import type {
  FloatingPlacement,
  PortalMountPoint,
} from '@pennyspring/component';
import { Button, FloatingActionGroup, Text } from '@pennyspring/component';
import { createUseSheetStyle, useTheme } from '@pennyspring/theme';
import {
  ArrowsOutCardinalIcon,
  CircleIcon,
  CompassIcon,
  ListIcon,
  MapPinIcon,
  PlusIcon,
} from 'phosphor-react-native';
import {
  PreviewRow,
  PreviewScaffold,
  PreviewSection,
} from '../../PreviewScaffold';

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
    gap: token.marginXXS,
  },
  helper: {
    maxWidth: '50%',
  },
  statusLine: {
    paddingVertical: token.paddingXXS,
  },
}));

export function FloatingActionGroupPreview() {
  const styles = useStyles();
  const { token } = useTheme();
  const [placement, setPlacement] =
    React.useState<FloatingPlacement>('bottomRight');
  const [mountPoint, setMountPoint] = React.useState<PortalMountPoint>('auto');
  const [lastEvent, setLastEvent] = React.useState('No action yet');

  const actions = React.useMemo(
    () => [
      {
        key: 'create',
        label: 'Create',
        icon: (
          <PlusIcon
            color={token.colorIcon}
            size={token.fontSizeLG}
            weight="bold"
          />
        ),
        onPress: () => {
          setLastEvent('Pressed Create');
        },
      },
      {
        key: 'map',
        label: 'Map',
        icon: (
          <MapPinIcon
            color={token.colorIcon}
            size={token.fontSizeLG}
            weight="bold"
          />
        ),
        onPress: () => {
          setLastEvent('Pressed Map');
        },
      },
      {
        key: 'list',
        label: 'List',
        icon: (
          <ListIcon
            color={token.colorIcon}
            size={token.fontSizeLG}
            weight="bold"
          />
        ),
        onPress: () => {
          setLastEvent('Pressed List');
        },
      },
      {
        key: 'focus',
        label: 'Focus',
        icon: (
          <CompassIcon
            color={token.colorIcon}
            size={token.fontSizeLG}
            weight="bold"
          />
        ),
        onPress: () => {
          setLastEvent('Pressed Focus');
        },
      },
    ],
    [token.colorIcon, token.fontSizeLG],
  );

  return (
    <PreviewScaffold>
      <PreviewSection title="Placement and mountPoint">
        <PreviewRow>
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
        </PreviewRow>
        <PreviewRow>
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
        </PreviewRow>
      </PreviewSection>

      <PreviewSection title="Preview canvas">
        <View style={styles.canvas}>
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
      </PreviewSection>

      <PreviewSection title="Event feedback">
        <View style={styles.statusLine}>
          <Text color="description" size="sm">
            {lastEvent}
          </Text>
        </View>
        <PreviewRow>
          <ArrowsOutCardinalIcon
            color={token.colorIcon}
            size={token.fontSizeLG}
            weight="bold"
          />
          <CircleIcon
            color={token.colorIcon}
            size={token.fontSizeLG}
            weight="fill"
          />
          <Text color="tertiary" size="sm">
            Icons only demonstrate custom action icons.
          </Text>
        </PreviewRow>
      </PreviewSection>
    </PreviewScaffold>
  );
}
