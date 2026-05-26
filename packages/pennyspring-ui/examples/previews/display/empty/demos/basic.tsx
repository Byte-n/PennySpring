import React from 'react';
import { View } from 'react-native';
import { Button, Empty, Icon, Text } from '@pennyspring/ui';
import { createUseSheetStyle } from '@pennyspring/theme';

const useStyles = createUseSheetStyle(token => ({
  stack: {
    gap: token.marginLG,
  },
  panel: {
    backgroundColor: token.colorBgContainer,
    borderColor: token.colorBorderSecondary,
    borderRadius: token.borderRadius,
    borderWidth: token.lineWidth,
    paddingHorizontal: token.padding,
    paddingVertical: token.paddingSM,
  },
  textCenter: {
    textAlign: 'center',
  },
}));

export const emptyBasicDemoTitle = 'Basic';

export function EmptyBasicDemo() {
  const styles = useStyles();

  return (
    <>
      <View style={styles.stack}>
        <View style={styles.panel}>
          <Empty messageText="No data" />
        </View>
        <View style={styles.panel}>
          <Empty
            icon={<Icon icon="list" size={28} color="textDescription" />}
            message={
              <View>
                <Text style={styles.textCenter}>No tasks</Text>
                <Text style={styles.textCenter} color="secondary">
                  Create your first item to get started.
                </Text>
                <Button size="small">Create</Button>
              </View>
            }
          />
        </View>
      </View>
    </>
  );
}

export default EmptyBasicDemo;
