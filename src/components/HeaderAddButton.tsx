import React from 'react';
import { Pressable } from 'react-native';
import { Icon } from '@pennyspring/ui';
import { createUseSheetStyle } from '@pennyspring/ui';

const HIT_SLOP = 4;

export interface HeaderAddButtonProps {
  onPress: () => void;
}

const useStyles = createUseSheetStyle(token => ({
  button: {
    alignItems: 'center',
    borderRadius: token.borderRadiusSM,
    height: token.controlHeight,
    justifyContent: 'center',
    width: token.controlHeight,
  },
  pressed: {
    backgroundColor: token.colorFill,
  },
}));

export function HeaderAddButton({ onPress }: HeaderAddButtonProps) {
  const styles = useStyles();

  return (
    <Pressable
      accessibilityLabel="新增"
      accessibilityRole="button"
      hitSlop={HIT_SLOP}
      onPress={onPress}
      style={({ pressed }) => [styles.button, pressed && styles.pressed]}
    >
      <Icon color="primary" icon="add" size="large" />
    </Pressable>
  );
}

export function createHeaderAddButton(
  onPress: () => void,
): () => React.ReactElement {
  return function HeaderAddButtonSlot() {
    return <HeaderAddButton onPress={onPress} />;
  };
}
