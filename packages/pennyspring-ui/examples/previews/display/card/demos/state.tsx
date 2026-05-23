import React from 'react';
import { View } from 'react-native';
import { Card, Text } from '@pennyspring/ui';
import { createUseSheetStyle } from '@pennyspring/theme';

const useStyles = createUseSheetStyle(token => ({
  stack: {
    gap: token.marginSM,
  },
}));

export const cardStateDemoTitle = 'State';

export function CardStateDemo() {
  const styles = useStyles();

  return (
    <>
      <View style={styles.stack}>
        <Card onPress={() => undefined} titleText="Pressable">
          <Text color="secondary">Tap feedback is owned by Card.</Text>
        </Card>
        <Card disabled onPress={() => undefined} titleText="Disabled">
          <Text color="secondary">Disabled state blocks interaction.</Text>
        </Card>
        <Card
          loading
          loadingNode={<Text color="description">Loading...</Text>}
          titleText="Loading"
        >
          <Text>Hidden while loading.</Text>
        </Card>
      </View>
    </>
  );
}

export default CardStateDemo;
