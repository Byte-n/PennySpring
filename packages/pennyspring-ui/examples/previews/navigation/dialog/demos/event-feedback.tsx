import React from 'react';
import { View } from 'react-native';
import { Text } from '@pennyspring/ui';
import { createUseSheetStyle } from '@pennyspring/theme';

const useStyles = createUseSheetStyle(token => ({
  stack: {
    gap: token.marginSM,
  },
  body: {
    gap: token.marginXS,
  },
  customTitle: {
    gap: token.marginXXS,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: token.marginXS,
  },
  statusLine: {
    paddingVertical: token.paddingXXS,
  },
}));

export const dialogEventFeedbackDemoTitle = 'Event feedback';

export function DialogEventFeedbackDemo() {
  const styles = useStyles();
  const [lastEvent, _setLastEvent] = React.useState('No dialog action yet');

  return (
    <>
      <View style={styles.statusLine}>
        <Text color="description" size="sm">
          {lastEvent}
        </Text>
      </View>
    </>
  );
}

export default DialogEventFeedbackDemo;
