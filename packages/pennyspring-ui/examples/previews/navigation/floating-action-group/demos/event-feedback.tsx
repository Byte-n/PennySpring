import React from 'react';
import { View } from 'react-native';
import { Space, FloatingActionGroup, Text } from '@pennyspring/ui';
import { createUseSheetStyle } from '@pennyspring/ui';
import { CompassIcon, ListIcon, MapPinIcon, PlusIcon } from 'phosphor-react-native';

const useStyles = createUseSheetStyle(token => ({
  canvas: {
    minHeight: token.controlHeightLG * 5,
    borderWidth: token.lineWidth,
    borderColor: token.colorBorderSecondary,
    borderRadius: token.borderRadius,
    backgroundColor: token.colorBgContainer,
    overflow: 'hidden',
    padding: token.paddingSM,
  },
  statusLine: {
    paddingVertical: token.paddingXXS,
  },
}));

export function FloatingActionGroupEventFeedbackDemo() {
  const styles = useStyles();
  const [lastEvent, setLastEvent] = React.useState('No action yet');
  const actions = React.useMemo(
    () => [
      {
        key: 'create',
        label: 'Create',
        icon: PlusIcon,
        onPress: () => {
          setLastEvent('Pressed Create');
        },
      },
      {
        key: 'map',
        label: 'Map',
        icon: MapPinIcon,
        onPress: () => {
          setLastEvent('Pressed Map');
        },
      },
      {
        key: 'list',
        label: 'List',
        icon: ListIcon,
        onPress: () => {
          setLastEvent('Pressed List');
        },
      },
      {
        key: 'focus',
        label: 'Focus',
        icon: CompassIcon,
        onPress: () => {
          setLastEvent('Pressed Focus');
        },
      },
    ],
    [],
  );

  return (
    <>
      <Space direction="vertical" gap="normal">
        <View style={styles.statusLine}>
          <Text color="description" size="sm">
            {lastEvent}
          </Text>
        </View>
      </Space>
      <View style={styles.canvas}>
        <FloatingActionGroup
          actions={actions}
          collapseOnOutsidePress
          defaultVisibleCount={1}
        />
      </View>
    </>
  );
}

export default FloatingActionGroupEventFeedbackDemo;
