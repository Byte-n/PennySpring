import React from 'react';
import { View } from 'react-native';
import { Space, Text } from '@pennyspring/ui';
import { createUseSheetStyle, useTheme } from '@pennyspring/theme';
import { ArrowsOutCardinalIcon, CircleIcon } from 'phosphor-react-native';

const useStyles = createUseSheetStyle(token => ({
  canvas: {
    minHeight: token.controlHeightLG * 5,
    borderWidth: token.lineWidth,
    borderColor: token.colorBorderSecondary,
    borderRadius: token.borderRadius,
    backgroundColor: token.colorBgContainer,
    overflow: 'hidden',
    padding: token.paddingSM,
    gap: token.marginXXS,
  },
  helper: {
    maxWidth: '50%',
  },
  statusLine: {
    paddingVertical: token.paddingXXS,
  },
}));

export const floatingActionGroupEventFeedbackDemoTitle = 'Event feedback';

export function FloatingActionGroupEventFeedbackDemo() {
  const styles = useStyles();
  const { token } = useTheme();
  const [lastEvent, _setLastEvent] = React.useState('No action yet');

  return (
    <>
      <View style={styles.statusLine}>
        <Text color="description" size="sm">
          {lastEvent}
        </Text>
      </View>
      <Space align="center" size="large" wrap>
        <ArrowsOutCardinalIcon
          color={token.colorIcon}
          size={token.fontSizeLG}
          weight="bold"
        />
        <CircleIcon
          color={token.colorIcon}
          size={token.fontSizeLG}
          weight="fill"
        />
        <Text color="tertiary" size="sm">
          Icons only demonstrate custom action icons.
        </Text>
      </Space>
    </>
  );
}

export default FloatingActionGroupEventFeedbackDemo;
