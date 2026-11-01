import React from 'react';
import { Column, ImagePicker } from '@pennyspring/ui';
import type { ImagePickerValue } from '@pennyspring/ui';
import { createUseSheetStyle } from '@pennyspring/ui';

const useStyles = createUseSheetStyle(token => ({
  stack: {
    gap: token.marginSM,
  },
}));

export function ImagePickerStateDemo() {
  const styles = useStyles();
  const presetValue: ImagePickerValue = {
    uri: 'https://reactnative.dev/img/tiny_logo.png',
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
      <ImagePicker
        allowClear
        defaultValue={presetValue}
        label="Clearable"
        labelText="Choose image"
        size="small"
      />
      <ImagePicker label="Error" labelText="Choose image" status="error" />
    </Column>
  );
}

export default ImagePickerStateDemo;
