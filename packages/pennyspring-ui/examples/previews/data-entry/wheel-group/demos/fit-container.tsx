import React from 'react';
import { createUseSheetStyle } from '@pennyspring/ui';
import { Column, Space, Text, WheelGroup } from '@pennyspring/ui';
import type { WheelGroupColumn } from '@pennyspring/ui';

function padValue(value: number): string {
  return String(value).padStart(2, '0');
}

const HOURS: WheelGroupColumn = Array.from({ length: 24 }, (_, index) => ({
  labelText: padValue(index),
  value: index,
}));

const useStyles = createUseSheetStyle(token => ({
  box: {
    height: token.controlHeight * 3,
    backgroundColor: token.colorBgLayout,
    borderRadius: token.borderRadiusSM,
    overflow: 'hidden',
  },
  boxMedium: {
    height: token.controlHeight * 6,
    backgroundColor: token.colorBgLayout,
    borderRadius: token.borderRadiusSM,
    overflow: 'hidden',
  },
  boxLarge: {
    height: token.controlHeight * 7,
    backgroundColor: token.colorBgLayout,
    borderRadius: token.borderRadiusSM,
    overflow: 'hidden',
  },
}));

export function WheelGroupFitContainerDemo() {
  const styles = useStyles();

  return (
    <Space block direction="vertical" gap="large">
      <Column gap="small">
        <Text color="description" size="sm">
          3 rows container
        </Text>
        <WheelGroup
          columns={[HOURS]}
          defaultValue={[9]}
          fit="container"
          style={styles.box}
        />
      </Column>
      <Column gap="small">
        <Text color="description" size="sm">
          6 rows tall container, quantized to 5 rows
        </Text>
        <WheelGroup
          columns={[HOURS]}
          defaultValue={[9]}
          fit="container"
          style={styles.boxMedium}
        />
      </Column>
      <Column gap="small">
        <Text color="description" size="sm">
          7 rows container
        </Text>
        <WheelGroup
          columns={[HOURS]}
          defaultValue={[9]}
          fit="container"
          style={styles.boxLarge}
        />
      </Column>
    </Space>
  );
}

export default WheelGroupFitContainerDemo;
