import React from 'react';
import { View } from 'react-native';
import { Card, Text } from '@pennyspring/component';
import { createUseSheetStyle } from '@pennyspring/theme';
import { PreviewScaffold, PreviewSection } from '../../PreviewScaffold';

const useStyles = createUseSheetStyle(token => ({
  stack: {
    gap: token.marginSM,
  },
}));

export function CardPreview() {
  const styles = useStyles();

  return (
    <PreviewScaffold>
      <PreviewSection title="Variants">
        <View style={styles.stack}>
          <Card title="Plain card" extra={<Text color="description">Extra</Text>}>
            <Text color="secondary">Default container with header, body and extra content.</Text>
          </Card>
          <Card variant="elevated" title="Elevated card" footer={<Text color="description">Footer</Text>}>
            <Text color="secondary">Elevated variant for higher layer content.</Text>
          </Card>
          <Card variant="summary" title="Summary">
            <Text color="heading" size="h3" weight="strong">
              12,840.00
            </Text>
          </Card>
        </View>
      </PreviewSection>

      <PreviewSection title="State">
        <View style={styles.stack}>
          <Card onPress={() => undefined} title="Pressable">
            <Text color="secondary">Tap feedback is owned by Card.</Text>
          </Card>
          <Card loading loadingNode={<Text color="description">Loading...</Text>} title="Loading">
            <Text>Hidden while loading.</Text>
          </Card>
        </View>
      </PreviewSection>
    </PreviewScaffold>
  );
}
