import React from 'react';
import { Pressable } from 'react-native';
import { Icon, Row, Text } from '@pennyspring/ui';
import { createUseSheetStyle } from '@pennyspring/theme';

interface PeriodBarProps {
  label: string;
  compareLabel: string;
  compareEnabled: boolean;
  canGoPrevious: boolean;
  canGoNext: boolean;
  onPrevious: () => void;
  onNext: () => void;
  onToggleCompare: () => void;
}

const useStyles = createUseSheetStyle(token => ({
  root: {
    minHeight: token.controlHeight,
  },
  navButton: {
    width: token.controlHeight,
    height: token.controlHeight,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: token.borderRadiusSM,
  },
  navButtonPressed: {
    backgroundColor: token.colorFillTertiary,
  },
  navButtonDisabled: {
    opacity: token.opacityLoading,
  },
  label: {
    marginHorizontal: token.marginXXS,
  },
  chip: {
    height: token.controlHeightSM,
    paddingHorizontal: token.paddingSM,
    borderRadius: token.borderRadiusSM,
    borderWidth: token.lineWidth,
    borderColor: token.colorBorderSecondary,
    backgroundColor: token.colorBgContainer,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipActive: {
    borderColor: token.colorPrimaryBorder,
    backgroundColor: token.colorPrimaryBg,
  },
  chipPressed: {
    backgroundColor: token.colorFillTertiary,
  },
}));

export function PeriodBar({
  label,
  compareLabel,
  compareEnabled,
  canGoPrevious,
  canGoNext,
  onPrevious,
  onNext,
  onToggleCompare,
}: PeriodBarProps) {
  const styles = useStyles();

  return (
    <Row align="center" justify="between" style={styles.root}>
      <Row align="center">
        <Pressable
          disabled={!canGoPrevious}
          onPress={onPrevious}
          style={({ pressed }) => [
            styles.navButton,
            pressed && canGoPrevious ? styles.navButtonPressed : null,
            !canGoPrevious ? styles.navButtonDisabled : null,
          ]}
        >
          <Icon
            icon="caret-left"
            size="small"
            color={canGoPrevious ? 'secondary' : 'disabled'}
          />
        </Pressable>
        <Text
          size="md"
          weight="semibold"
          numberOfLines={1}
          style={styles.label}
        >
          {label}
        </Text>
        <Pressable
          disabled={!canGoNext}
          onPress={onNext}
          style={({ pressed }) => [
            styles.navButton,
            pressed && canGoNext ? styles.navButtonPressed : null,
            !canGoNext ? styles.navButtonDisabled : null,
          ]}
        >
          <Icon
            icon="caret-right"
            size="small"
            color={canGoNext ? 'secondary' : 'disabled'}
          />
        </Pressable>
      </Row>
      <Pressable
        onPress={onToggleCompare}
        style={({ pressed }) => [
          styles.chip,
          compareEnabled ? styles.chipActive : null,
          pressed ? styles.chipPressed : null,
        ]}
      >
        <Text
          size="xs"
          weight="medium"
          color={compareEnabled ? 'primary' : 'tertiary'}
        >
          对比 {compareLabel}同期
        </Text>
      </Pressable>
    </Row>
  );
}
