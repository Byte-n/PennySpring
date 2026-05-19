import React from 'react';
import { View } from 'react-native';
import { Button, Text, TopTabNavigator } from '@pennyspring/component';
import { createUseSheetStyle } from '@pennyspring/theme';
import { PreviewScaffold, PreviewSection } from '../../PreviewScaffold';
import type { TabScreen } from '@pennyspring/component';

const NAVIGATOR_FRAME_MIN_HEIGHT_FACTOR = 5;

const useStyles = createUseSheetStyle(token => ({
  navigatorFrame: {
    minHeight: token.controlHeightLG * NAVIGATOR_FRAME_MIN_HEIGHT_FACTOR,
    borderWidth: token.lineWidth,
    borderColor: token.colorBorderSecondary,
    borderRadius: token.borderRadius,
    overflow: 'hidden',
    backgroundColor: token.colorBgContainer,
  },
  screen: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: token.padding,
  },
  actionRow: {
    flexDirection: 'row',
    gap: token.marginXXS,
  },
}));

function OverviewScreen() {
  const styles = useStyles();

  return (
    <View style={styles.screen}>
      <Text color="secondary">Overview content</Text>
    </View>
  );
}

function DetailScreen() {
  const styles = useStyles();

  return (
    <View style={styles.screen}>
      <Text color="secondary">Details content</Text>
    </View>
  );
}

function HistoryScreen() {
  const styles = useStyles();

  return (
    <View style={styles.screen}>
      <Text color="secondary">History content</Text>
    </View>
  );
}

export function TopTabNavigatorPreview() {
  const styles = useStyles();
  const [eventText, setEventText] = React.useState('No action yet');
  const screens = React.useMemo<readonly TabScreen[]>(
    () => [
      { name: 'overview', label: 'Overview', component: OverviewScreen },
      { name: 'details', label: 'Details', component: DetailScreen },
      { name: 'history', label: 'History', component: HistoryScreen },
    ],
    [],
  );

  return (
    <PreviewScaffold>
      <PreviewSection title="Left and right actions">
        <View style={styles.navigatorFrame}>
          <TopTabNavigator
            screens={screens}
            leftActions={
              <View style={styles.actionRow}>
                <Button
                  size="small"
                  onPress={() => {
                    setEventText('Pressed filter action');
                  }}
                >
                  Filter
                </Button>
              </View>
            }
            rightActions={
              <View style={styles.actionRow}>
                <Button
                  size="small"
                  onPress={() => {
                    setEventText('Pressed add action');
                  }}
                >
                  Add
                </Button>
              </View>
            }
          />
        </View>
        <View>
          <Text color="description" size="sm">
            {eventText}
          </Text>
        </View>
      </PreviewSection>
    </PreviewScaffold>
  );
}
