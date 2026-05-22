import React from 'react';
import { View } from 'react-native';
import { Ellipsis } from '@pennyspring/ui';
import { createUseSheetStyle } from '@pennyspring/theme';
import { PreviewScaffold, PreviewSection } from '../../PreviewScaffold';

const LONG_TEXT =
  'PennySpring helps teams review spending details quickly, compare trends, and keep financial records consistent across daily workflows.';

const useStyles = createUseSheetStyle(token => ({
  box: {
    gap: token.marginSM,
    borderWidth: token.lineWidth,
    borderColor: token.colorSplit,
    borderRadius: token.borderRadius,
    backgroundColor: token.colorBgContainer,
    padding: token.padding,
  },
}));

export function EllipsisPreview() {
  const styles = useStyles();

  return (
    <PreviewScaffold>
      <PreviewSection title="Direction">
        <View style={styles.box}>
          <Ellipsis content={LONG_TEXT} rows={1} direction="end" />
          <Ellipsis content={LONG_TEXT} rows={1} direction="start" />
          <Ellipsis content={LONG_TEXT} rows={1} direction="middle" />
        </View>
      </PreviewSection>

      <PreviewSection title="Rows and size">
        <View style={styles.box}>
          <Ellipsis content={LONG_TEXT} rows={2} size="small" />
          <Ellipsis content={LONG_TEXT} rows={2} size="normal" />
          <Ellipsis content={LONG_TEXT} rows={2} size="large" />
        </View>
      </PreviewSection>

      <PreviewSection title="Expand and collapse">
        <View style={styles.box}>
          <Ellipsis
            content={LONG_TEXT}
            rows={2}
            expandText="Read more"
            collapseText="Collapse"
          />
        </View>
      </PreviewSection>
    </PreviewScaffold>
  );
}
