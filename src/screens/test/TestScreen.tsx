import React from 'react';
import { Pressable, View } from 'react-native';
import { Page, Text, TextPreview } from '@pennyspring/component';
import { createUseSheetStyle, ThemePreview } from '@pennyspring/theme';

type TestPreviewTab = 'theme' | 'text';

const useStyles = createUseSheetStyle(token => ({
  activeTabButton: {
    backgroundColor: token.controlItemBgActive,
  },
  container: {
    flex: 1,
    gap: token.paddingSM,
  },
  previewContent: {
    flex: 1,
  },
  tabButton: {
    alignItems: 'center',
    borderRadius: token.borderRadiusSM,
    flex: 1,
    paddingVertical: token.paddingXS,
  },
  tabButtonPressed: {
    backgroundColor: token.colorBgTextActive,
  },
  tabRow: {
    backgroundColor: token.colorBgLayout,
    borderRadius: token.borderRadius,
    flexDirection: 'row',
    gap: token.paddingXXS,
    padding: token.paddingXXS,
  },
}));

interface TestTabButtonProps {
  active: boolean;
  label: string;
  onPress: () => void;
}

function TestTabButton({ active, label, onPress }: TestTabButtonProps) {
  const styles = useStyles();

  return (
    <Pressable
      accessibilityLabel={`${label} preview tab`}
      accessibilityRole="tab"
      accessibilityState={{ selected: active }}
      onPress={onPress}
      style={({ pressed }) => [
        styles.tabButton,
        active && styles.activeTabButton,
        pressed && styles.tabButtonPressed,
      ]}
    >
      <Text size="sm" weight={active ? 'strong' : 'regular'}>
        {label}
      </Text>
    </Pressable>
  );
}

export function TestScreen() {
  const styles = useStyles();
  const [activeTab, setActiveTab] = React.useState<TestPreviewTab>('theme');

  const showTheme = React.useCallback(() => {
    setActiveTab('theme');
  }, []);

  const showText = React.useCallback(() => {
    setActiveTab('text');
  }, []);

  return (
    <Page title="Test" >
      <View style={styles.container}>
        <View accessibilityRole="tablist" style={styles.tabRow}>
          <TestTabButton
            active={activeTab === 'theme'}
            label="Theme"
            onPress={showTheme}
          />
          <TestTabButton
            active={activeTab === 'text'}
            label="Text"
            onPress={showText}
          />
        </View>
        <View style={styles.previewContent}>
          {activeTab === 'theme' ? <ThemePreview /> : <TextPreview />}
        </View>
      </View>
    </Page>
  );
}
