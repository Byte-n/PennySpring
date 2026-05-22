import React from 'react';
import { View } from 'react-native';
import { Progress } from '@pennyspring/ui';
import { createUseSheetStyle } from '@pennyspring/theme';
import { PreviewScaffold, PreviewRow, PreviewSection } from '../../PreviewScaffold';

const useStyles = createUseSheetStyle(token => ({
  stack: {
    gap: token.marginSM,
  },
}));

export function ProgressPreview() {
  const styles = useStyles();

  return (
    <PreviewScaffold>
      <PreviewSection title="Bar">
        <View style={styles.stack}>
          <Progress.Bar percent={24} />
          <Progress.Bar percent={56} size="small" />
          <Progress.Bar percent={72} size="large" />
          <Progress.Bar percent={100} status="success" />
          <Progress.Bar percent={38} status="exception" />
          <Progress.Bar showInfo={false} percent={64} />
        </View>
      </PreviewSection>

      <PreviewSection title="Circle">
        <PreviewRow>
          <Progress.Circle percent={30} size="small" />
          <Progress.Circle percent={65} />
          <Progress.Circle percent={88} size="large" />
          <Progress.Circle percent={100} status="success" />
          <Progress.Circle
            percent={42}
            status="exception"
            format={percent => `${Math.round(percent / 10)}/10`}
          />
        </PreviewRow>
      </PreviewSection>
    </PreviewScaffold>
  );
}
