import React from 'react';
import { Column, Image, Row, Text } from '@pennyspring/ui';
import { createUseSheetStyle } from '@pennyspring/ui';

const PREVIEW_IMAGES = [
  { uri: 'https://reactnative.dev/img/tiny_logo.png' },
  { uri: 'https://reactnative.dev/img/logo-og.png' },
  { uri: 'https://reactnative.dev/img/tiny_logo.png' },
];

const useStyles = createUseSheetStyle(token => ({
  row: {
    gap: token.marginSM,
  },
  image: {
    width: 96,
    height: 96,
  },
}));

export function ImageGroupDemo() {
  const styles = useStyles();

  return (
    <Column gap="small">
      <Text color="tertiary" size="xs">
        Image.PreviewGroup · 子图片自动注册；组内忽略 preview 属性，点击后打开共享预览
      </Text>
      <Image.PreviewGroup>
        <Row style={styles.row}>
          {PREVIEW_IMAGES.map((image, index) => (
            <Image
              key={`${image.uri}-${index}`}
              preview={false}
              src={image}
              style={styles.image}
              testID={`image-demo-group-${index}`}
            />
          ))}
        </Row>
      </Image.PreviewGroup>
    </Column>
  );
}

export default ImageGroupDemo;
