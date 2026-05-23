import React from 'react';
import { View } from 'react-native';
import { Text } from '@pennyspring/ui';
import { createUseSheetStyle } from '@pennyspring/theme';

const useStyles = createUseSheetStyle(token => ({
  frame: {
    minHeight: token.controlHeightLG * 5,
    borderWidth: token.lineWidth,
    borderColor: token.colorBorderSecondary,
    borderRadius: token.borderRadius,
    overflow: 'hidden',
    backgroundColor: token.colorBgLayout,
  },
  bodyContent: {
    gap: token.marginSM,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: token.marginXS,
  },
  meta: {
    gap: token.marginXXS,
  },
  sideBody: {
    justifyContent: 'center',
  },
  statusLine: {
    paddingVertical: token.paddingXXS,
  },
}));

export const popupEventFeedbackDemoTitle = 'Event feedback';

export function PopupEventFeedbackDemo() {
  const styles = useStyles();
  const [lastEvent, _setLastEvent] = React.useState('No popup action yet');

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

export default PopupEventFeedbackDemo;
