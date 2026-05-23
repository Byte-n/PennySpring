import React from 'react';
import { Column, ImagePicker } from '@pennyspring/ui';
import { createUseSheetStyle } from '@pennyspring/theme';

const useStyles = createUseSheetStyle(token => ({
  stack: {
    gap: token.marginSM,
  },
}));

export const imagePickerBasicDemoTitle = 'Basic';

export function ImagePickerBasicDemo() {
  const styles = useStyles();

  return (
    <Column style={styles.stack}>
      <ImagePicker label="Avatar" placeholder="Choose image" />
      <ImagePicker
        label="Photo Only"
        placeholder="Photo library only"
        sources={['photo']}
      />
      <ImagePicker
        label="File System Only"
        placeholder="File system only"
        sources={['fileSystem']}
      />
    </Column>
  );
}

export default ImagePickerBasicDemo;
