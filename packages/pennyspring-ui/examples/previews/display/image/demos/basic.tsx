import React from 'react';
import { Column, Image, Text } from '@pennyspring/ui';
import { createUseSheetStyle } from '@pennyspring/ui';

const PREVIEW_IMAGE = {
  uri: 'https://reactnative.dev/img/tiny_logo.png',
};

const SECOND_IMAGE = {
  uri: 'https://reactnative.dev/img/logo-og.png',
};

const THIRD_IMAGE = {
  uri: 'https://reactnative.dev/img/tiny_logo.png',
};

const useStyles = createUseSheetStyle(token => ({
  row: {
    gap: token.marginSM,
  },
  image: {
    width: 112,
    height: 112,
  },
  circle: {
    width: 72,
    height: 72,
  },
  section: {
    gap: token.marginXS,
  },
  contain: {
    width: 160,
    height: 96,
  },
}));

export function ImageBasicDemo() {
  const styles = useStyles();

  return (
    <Column gap="large">
      <Column style={styles.section}>
        <Text color="tertiary" size="xs">preview · 显式开启单图预览；默认不响应点击</Text>
        <Image preview src={PREVIEW_IMAGE} style={styles.image} />
      </Column>
      <Column style={styles.section}>
        <Text color="tertiary" size="xs">radius · small / normal / circle</Text>
        <Column style={styles.row}>
          <Image preview radius="small" src={PREVIEW_IMAGE} style={styles.image} />
          <Image preview radius="normal" src={SECOND_IMAGE} style={styles.image} />
          <Image preview radius="circle" src={THIRD_IMAGE} style={styles.circle} />
        </Column>
      </Column>
      <Column style={styles.section}>
        <Text color="tertiary" size="xs">fit="contain" · 不裁切，留出底色</Text>
        <Image fit="contain" preview src={SECOND_IMAGE} style={styles.contain} />
      </Column>
    </Column>
  );
}

export default ImageBasicDemo;
