import React from 'react';
import { Column, GeometryReader, Text } from '@pennyspring/ui';
import { createUseSheetStyle } from '@pennyspring/ui';

const useStyles = createUseSheetStyle(token => ({
  cell: {
    minHeight: token.controlHeightSM,
    minWidth: token.controlHeightLG,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: token.paddingSM,
    paddingVertical: token.paddingXXS,
    borderWidth: token.lineWidth,
    borderColor: token.colorBorder,
    borderRadius: token.borderRadiusSM,
    backgroundColor: token.colorBgContainer,
  },
  frame: {
    backgroundColor: token.colorFillTertiary,
    padding: token.paddingXS,
    borderRadius: token.borderRadiusSM,
  },
  stack: {
    gap: token.marginSM,
  },
  geometryBox: {
    height: token.controlHeightLG * 2,
    backgroundColor: token.colorFillTertiary,
    borderRadius: token.borderRadiusSM,
  },
  geometryContent: {
    flex: 1,
  },
}));

export function LayoutGeometryReaderDemo() {
  const styles = useStyles();

  return (
    <>
      <GeometryReader style={styles.geometryBox}>
        {({ width, height }) => (
          <Column
            align="center"
            justify="center"
            style={styles.geometryContent}
          >
            <Text size="sm" color="secondary">
              {Math.round(width)} x {Math.round(height)}
            </Text>
          </Column>
        )}
      </GeometryReader>
    </>
  );
}

export default LayoutGeometryReaderDemo;
