import React from 'react';
import { View } from 'react-native';
import {
  Button,
  FloatingActionGroup,
  PortalProvider,
  Text,
} from '@pennyspring/component';
import { createUseSheetStyle } from '@pennyspring/theme';
import {
  PreviewRow,
  PreviewScaffold,
  PreviewSection,
} from '../../PreviewScaffold';
import type {
  FloatingActionItem,
  FloatingDirection,
  PortalMountPoint,
} from '@pennyspring/component';

const useStyles = createUseSheetStyle(token => ({
  frame: {
    height: token.controlHeightLG * 6,
    borderWidth: token.lineWidth,
    borderColor: token.colorBorderSecondary,
    borderRadius: token.borderRadius,
    overflow: 'hidden',
    backgroundColor: token.colorBgLayout,
    position: 'relative',
  },
  frameContent: {
    flex: 1,
    padding: token.paddingMD,
    gap: token.marginXS,
  },
  eventLine: {
    paddingVertical: token.paddingXXS,
  },
}));

const DIRECTIONS: FloatingDirection[] = ['vertical', 'horizontal', 'radial'];
const MOUNT_POINTS: PortalMountPoint[] = ['auto', 'local', 'portal'];

export function FloatingActionGroupPreview() {
  const styles = useStyles();
  const [direction, setDirection] = React.useState<FloatingDirection>('vertical');
  const [mountPoint, setMountPoint] = React.useState<PortalMountPoint>('auto');
  const [eventText, setEventText] = React.useState('No action yet');

  const actions = React.useMemo<FloatingActionItem[]>(
    () => [
      {
        key: 'create',
        label: '创建',
        onPress: () => {
          setEventText('点击了 创建');
        },
      },
      {
        key: 'scan',
        label: '扫描',
        onPress: () => {
          setEventText('点击了 扫描');
        },
      },
      {
        key: 'share',
        label: '分享',
        onPress: () => {
          setEventText('点击了 分享');
        },
      },
      {
        key: 'archive',
        label: '归档',
        onPress: () => {
          setEventText('点击了 归档');
        },
      },
    ],
    [],
  );

  const demo = (
    <View style={styles.frame}>
      <View style={styles.frameContent}>
        <Text color="heading" weight="strong">
          FloatingActionGroup
        </Text>
        <Text color="secondary" size="sm">
          direction={direction} mountPoint={mountPoint}
        </Text>
      </View>
      <FloatingActionGroup
        actions={actions}
        defaultVisibleCount={1}
        direction={direction}
        mountPoint={mountPoint}
        placement="bottomRight"
      />
    </View>
  );

  return (
    <PreviewScaffold>
      <PreviewSection title="Direction">
        <PreviewRow>
          {DIRECTIONS.map(item => (
            <Button
              key={item}
              type={direction === item ? 'primary' : 'default'}
              onPress={() => {
                setDirection(item);
                setEventText(`direction 切换为 ${item}`);
              }}
            >
              {item}
            </Button>
          ))}
        </PreviewRow>
      </PreviewSection>

      <PreviewSection title="MountPoint">
        <PreviewRow>
          {MOUNT_POINTS.map(item => (
            <Button
              key={item}
              type={mountPoint === item ? 'primary' : 'default'}
              onPress={() => {
                setMountPoint(item);
                setEventText(`mountPoint 切换为 ${item}`);
              }}
            >
              {item}
            </Button>
          ))}
        </PreviewRow>
      </PreviewSection>

      <PreviewSection title="Preview">
        <PortalProvider>{demo}</PortalProvider>
      </PreviewSection>

      <PreviewSection title="Event feedback">
        <View style={styles.eventLine}>
          <Text color="description" size="sm">
            {eventText}
          </Text>
        </View>
      </PreviewSection>
    </PreviewScaffold>
  );
}
