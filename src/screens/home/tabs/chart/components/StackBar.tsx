import React from 'react';
import { Row } from '@pennyspring/ui';
import { createUseSheetStyle } from '@pennyspring/theme';

export interface StackSegment {
  key: string;
  value: number;
  color: string;
}

interface StackSegmentViewProps {
  value: number;
  color: string;
}

const useStyles = createUseSheetStyle(token => ({
  track: {
    height: token.sizeXS,
    borderRadius: token.borderRadiusXS,
    backgroundColor: token.colorFillQuaternary,
    overflow: 'hidden',
  },
}));

const useSegmentStyles = createUseSheetStyle(
  (token, { value, color }: StackSegmentViewProps) => ({
    segment: {
      flexBasis: 0,
      flexGrow: value,
      minWidth: token.lineWidth,
      alignSelf: 'stretch',
      borderRadius: token.borderRadiusXS,
      backgroundColor: color,
    },
  }),
);

function StackSegmentView({ value, color }: StackSegmentViewProps) {
  const styles = useSegmentStyles({ value, color });
  return <Row style={styles.segment} />;
}

interface StackBarProps {
  segments: readonly StackSegment[];
}

export function StackBar({ segments }: StackBarProps) {
  const styles = useStyles();
  const visible = segments.filter(segment => segment.value > 0);

  return (
    <Row style={styles.track} gap="small">
      {visible.map(segment => (
        <StackSegmentView
          key={segment.key}
          value={segment.value}
          color={segment.color}
        />
      ))}
    </Row>
  );
}
