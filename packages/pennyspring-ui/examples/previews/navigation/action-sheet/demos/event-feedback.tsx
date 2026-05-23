import React from 'react';
import { View } from 'react-native';
import { Text } from '@pennyspring/ui';
import { createUseSheetStyle } from '@pennyspring/theme';

const useStyles = createUseSheetStyle(token => ({
  status: {
    paddingVertical: token.paddingXXS,
  },
}));

export const actionSheetEventFeedbackDemoTitle = 'Event feedback';

export function ActionSheetEventFeedbackDemo() {
  const styles = useStyles();
  const [eventText, _setEventText] = React.useState('No action yet');

  return (
    <>
      <View style={styles.status}>
        <Text color="description" size="sm">
          {eventText}
        </Text>
      </View>
    </>
  );
}

export default ActionSheetEventFeedbackDemo;
