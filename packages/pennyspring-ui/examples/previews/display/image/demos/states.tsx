import React from 'react';
import { Column, Image, Text } from '@pennyspring/ui';
import { createUseSheetStyle } from '@pennyspring/ui';

const BROKEN_IMAGE = {
  uri: 'https://example.invalid/missing-image.jpg',
};

const VALID_IMAGE = {
  uri: 'https://reactnative.dev/img/tiny_logo.png',
};

const useStyles = createUseSheetStyle(token => ({
  frame: {
    width: 128,
    height: 128,
    backgroundColor: token.colorFillQuaternary,
    borderRadius: token.borderRadius,
    overflow: 'hidden',
  },
  section: {
    gap: token.marginXS,
  },
}));

export function ImageStatesDemo() {
  const styles = useStyles();

  return (
    <Column gap="large">
      <Column style={styles.section}>
        <Text color="tertiary" size="xs">
          失败态 · 图标 +「加载失败」，点击图片重试
        </Text>
        <Image src={BROKEN_IMAGE} style={styles.frame} />
      </Column>
      <Column style={styles.section}>
        <Text color="tertiary" size="xs">
          默认 · 只展示，不响应预览
        </Text>
        <Image src={VALID_IMAGE} style={styles.frame} />
      </Column>
      <Column style={styles.section}>
        <Text color="tertiary" size="xs">
          preview · 单图点击预览
        </Text>
        <Image preview src={VALID_IMAGE} style={styles.frame} />
      </Column>
      <Column style={styles.section}>
        <Text color="tertiary" size="xs">
          自定义失败内容 · error slot
        </Text>
        <Image
          error={
            <Text color="error" size="xs">
              图片不可用
            </Text>
          }
          src={BROKEN_IMAGE}
          style={styles.frame}
        />
      </Column>
    </Column>
  );
}

export default ImageStatesDemo;
