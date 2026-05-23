import React from 'react';
import { View } from 'react-native';
import { Card, Text } from '@pennyspring/ui';
import { createUseSheetStyle } from '@pennyspring/theme';

const useStyles = createUseSheetStyle(token => ({
  stack: {
    gap: token.marginSM,
  },
}));

export const cardVariantsDemoTitle = 'Variants';

export function CardVariantsDemo() {
  const styles = useStyles();

  return (
    <>
      <View style={styles.stack}>
        <Card
          titleText="Plain card"
          extra={<Text color="description">Extra</Text>}
        >
          <Text color="secondary">
            Default container with header, body and extra content.
          </Text>
        </Card>
        <Card
          variant="elevated"
          titleText="Elevated card"
          footer={<Text color="description">Footer</Text>}
        >
          <Text color="secondary">
            Elevated variant for higher layer content.
          </Text>
        </Card>
        <Card variant="summary" titleText="Summary">
          <Text color="heading" size="h3" weight="strong">
            12,840.00
          </Text>
        </Card>
      </View>
    </>
  );
}

export default CardVariantsDemo;
