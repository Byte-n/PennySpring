import React from 'react';
import type { FloatingPlacement, PortalMountPoint } from '@pennyspring/ui';
import { Space, Button } from '@pennyspring/ui';

const PLACEMENTS: FloatingPlacement[] = [
  'bottomRight',
  'bottomLeft',
  'topLeft',
  'topRight',
];

const MOUNT_POINTS: PortalMountPoint[] = ['auto', 'local', 'portal'];

export const floatingActionGroupPlacementAndMountPointDemoTitle =
  'Placement and mountPoint';

export function FloatingActionGroupPlacementAndMountPointDemo() {
  const [placement, setPlacement] =
    React.useState<FloatingPlacement>('bottomRight');
  const [mountPoint, setMountPoint] = React.useState<PortalMountPoint>('auto');
  const [_lastEvent, setLastEvent] = React.useState('No action yet');

  return (
    <>
      <Space align="center" size="large" wrap>
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
      <Space align="center" size="large" wrap>
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
    </>
  );
}

export default FloatingActionGroupPlacementAndMountPointDemo;
