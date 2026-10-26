import React from 'react';
import { Column } from '@pennyspring/ui';
import { createUseSheetStyle } from '@pennyspring/theme';

interface ColorDotProps {
  color: string;
}

const useStyles = createUseSheetStyle((token, { color }: ColorDotProps) => ({
  dot: {
    width: token.sizeXS,
    height: token.sizeXS,
    borderRadius: token.borderRadiusXS,
    backgroundColor: color,
  },
}));

export function ColorDot({ color }: ColorDotProps) {
  const styles = useStyles({ color });
  return <Column style={styles.dot} />;
}
