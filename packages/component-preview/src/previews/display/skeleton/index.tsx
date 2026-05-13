import React from 'react';
import { View } from 'react-native';
import { Skeleton, Text } from '@pennyspring/component';
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
}));

export function SkeletonPreview() {
  const styles = useStyles();

  return (
    <PreviewScaffold>
      <PreviewSection title="Shape">
        <PreviewRow>
          <Skeleton shape="line" width="40%" />
          <Skeleton shape="circle" />
          <Skeleton shape="rect" width="30%" />
        </PreviewRow>
      </PreviewSection>

      <PreviewSection title="Layout">
        <View style={styles.card}>
          <View style={styles.stack}>
            <Skeleton shape="line" width="50%" />
            <Skeleton shape="line" width="100%" />
            <Skeleton shape="line" width="85%" />
            <Skeleton shape="rect" size="large" style={styles.block} />
          </View>
        </View>
      </PreviewSection>

      <PreviewSection title="Animated and static">
        <PreviewRow>
          <Skeleton shape="rect" width="46%" size="large" />
          <Skeleton shape="rect" width="46%" size="large" animated={false} />
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
