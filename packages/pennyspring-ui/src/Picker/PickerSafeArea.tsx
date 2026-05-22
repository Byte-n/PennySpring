import React from 'react';
import { View } from 'react-native';
import type { ReactNode } from 'react';
import type { PickerPanelStyles } from './types';

interface PickerSafeAreaProps {
  children: ReactNode;
  styles: ReturnType<typeof import('./usePickerStyles').usePickerStyles>;
  slotStyles?: PickerPanelStyles;
}

export function PickerSafeArea({
  children,
  slotStyles,
  styles,
}: PickerSafeAreaProps) {
  return (
    <View style={[styles.safeArea, slotStyles?.safeArea]}>
      {children}
    </View>
  );
}
