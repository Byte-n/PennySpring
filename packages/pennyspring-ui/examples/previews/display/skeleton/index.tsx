import React from 'react';
import { View } from 'react-native';
import { Skeleton, Text } from '@pennyspring/ui';
import { createUseSheetStyle } from '@pennyspring/theme';
import { PreviewRow, PreviewScaffold, PreviewSection } from '../../PreviewScaffold';

const useStyles = createUseSheetStyle(token => ({
  card: {
    gap: token.marginSM,
    borderWidth: token.lineWidth,
    borderColor: token.colorSplit,
    borderRadius: token.borderRadius,
    backgroundColor: token.colorBgContainer,
    padding: token.padding,
  },
  stack: {
    gap: token.marginXS,
  },
  block: {
    width: '100%',
  },
  w40: {
    width: '40%',
  },
  w30: {
    width: '30%',
  },
  w50: {
    width: '50%',
  },
  w85: {
    width: '85%',
  },
  w46: {
    width: '46%',
  },
}));

export function SkeletonPreview() {
  const styles = useStyles();

  return (
    <PreviewScaffold>
      <PreviewSection title="Shape">
        <PreviewRow>
          <Skeleton shape="line" style={styles.w40} />
          <Skeleton shape="circle" />
          <Skeleton shape="rect" style={styles.w30} />
        </PreviewRow>
      </PreviewSection>

      <PreviewSection title="Layout">
        <View style={styles.card}>
          <View style={styles.stack}>
            <Skeleton shape="line" style={styles.w50} />
            <Skeleton shape="line" style={styles.block} />
            <Skeleton shape="line" style={styles.w85} />
            <Skeleton shape="rect" size="large" style={styles.block} />
          </View>
        </View>
      </PreviewSection>

      <PreviewSection title="Animated and static">
        <PreviewRow>
          <Skeleton shape="rect" style={styles.w46} size="large" />
          <Skeleton shape="rect" style={styles.w46} size="large" animated={false} />
        </PreviewRow>
      </PreviewSection>

      <PreviewSection title="Loading switch">
        <Skeleton loading={false}>
          <Text color="description">Content rendered when loading is false.</Text>
        </Skeleton>
      </PreviewSection>
    </PreviewScaffold>
  );
}
