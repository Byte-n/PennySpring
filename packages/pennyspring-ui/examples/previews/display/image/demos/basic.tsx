import React from 'react';
import { Column, Image, Text } from '@pennyspring/ui';
import { createUseSheetStyle } from '@pennyspring/theme';

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
        <Text color="tertiary" size="xs">默认 cover、圆角 12；点击打开单图预览</Text>
        <Image src={PREVIEW_IMAGE} style={styles.image} />
      </Column>
      <Column style={styles.section}>
        <Text color="tertiary" size="xs">radius · small / normal / circle</Text>
        <Column style={styles.row}>
          <Image radius="small" src={PREVIEW_IMAGE} style={styles.image} />
          <Image radius="normal" src={SECOND_IMAGE} style={styles.image} />
          <Image radius="circle" src={THIRD_IMAGE} style={styles.circle} />
        </Column>
      </Column>
      <Column style={styles.section}>
        <Text color="tertiary" size="xs">fit="contain" · 不裁切，留出底色</Text>
        <Image fit="contain" src={SECOND_IMAGE} style={styles.contain} />
      </Column>
    </Column>
  );
}

export default ImageBasicDemo;
