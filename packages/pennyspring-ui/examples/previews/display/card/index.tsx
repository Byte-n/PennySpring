import React from 'react';
import { View } from 'react-native';
import { Card, Text } from '@pennyspring/ui';
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
          <Card titleText="Plain card" extra={<Text color="description">Extra</Text>}>
            <Text color="secondary">Default container with header, body and extra content.</Text>
          </Card>
          <Card variant="elevated" titleText="Elevated card" footer={<Text color="description">Footer</Text>}>
            <Text color="secondary">Elevated variant for higher layer content.</Text>
          </Card>
          <Card variant="summary" titleText="Summary">
            <Text color="heading" size="h3" weight="strong">
              12,840.00
            </Text>
          </Card>
        </View>
      </PreviewSection>

      <PreviewSection title="State">
        <View style={styles.stack}>
          <Card onPress={() => undefined} titleText="Pressable">
            <Text color="secondary">Tap feedback is owned by Card.</Text>
          </Card>
          <Card disabled onPress={() => undefined} titleText="Disabled">
            <Text color="secondary">Disabled state blocks interaction.</Text>
          </Card>
          <Card loading loadingNode={<Text color="description">Loading...</Text>} titleText="Loading">
            <Text>Hidden while loading.</Text>
          </Card>
        </View>
      </PreviewSection>
    </PreviewScaffold>
  );
}
