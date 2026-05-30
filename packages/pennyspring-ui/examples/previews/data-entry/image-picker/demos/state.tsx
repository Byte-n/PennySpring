import React from 'react';
import { Column, ImagePicker } from '@pennyspring/ui';
import type { ImagePickerValue } from '@pennyspring/ui';
import { createUseSheetStyle } from '@pennyspring/theme';

const useStyles = createUseSheetStyle(token => ({
  stack: {
    gap: token.marginSM,
  },
}));

export const imagePickerStateDemoTitle = 'State';

export function ImagePickerStateDemo() {
  const styles = useStyles();
  const presetValue: ImagePickerValue = {
    uri: 'file:///preset.jpg',
    fileName: 'preset.jpg',
  };

  return (
    <Column style={styles.stack}>
      <ImagePicker disabled label="Disabled" labelText="Cannot select" />
      <ImagePicker label="Readonly" labelText="Read only" readonly />
      <ImagePicker
        defaultValue={presetValue}
        label="With Default Value"
        labelText="Choose image"
      />
    </Column>
  );
}

export default ImagePickerStateDemo;
