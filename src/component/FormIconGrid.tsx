import React from 'react';
import { Pressable } from 'react-native';
import { Form, Grid } from '@pennyspring/ui';
import { createUseSheetStyle, useTheme } from '@pennyspring/theme';

import { getPhosphorIconComponent } from '../constants/typeIconTree';

const ICON_GRID_COLUMNS = 6;

export interface FormIconGridProps {
  values: readonly string[];
  value?: string;
  onChange?: (value: string) => void;
}

const useStyles = createUseSheetStyle(token => ({
  cell: {
    alignItems: 'center',
    borderColor: 'transparent',
    borderRadius: token.borderRadius,
    borderWidth: token.lineWidth,
    height: token.controlHeight,
    justifyContent: 'center',
  },
  cellSelected: {
    backgroundColor: token.colorPrimaryBg,
    borderColor: token.colorPrimaryBorder,
  },
  cellPressed: {
    backgroundColor: token.colorFillQuaternary,
  },
}));

export function FormIconGrid({ values, value, onChange }: FormIconGridProps) {
  const styles = useStyles();
  const { token } = useTheme();
  const field = Form.Item.useFieldProps<string>({ value, onChange });

  return (
    <Grid columns={ICON_GRID_COLUMNS}>
      {values.map(iconName => {
        const IconComponent = getPhosphorIconComponent(iconName);
        const selected = iconName === field.value;
        return (
          <Grid.Item key={iconName}>
            <Pressable
              onPress={() => field.onChange?.(iconName)}
              style={({ pressed }) => [
                styles.cell,
                selected && styles.cellSelected,
                pressed && styles.cellPressed,
              ]}
              testID={`form-icon-${iconName}`}
            >
              <IconComponent
                color={selected ? token.colorPrimary : token.colorTextSecondary}
                size={token.fontSizeHeading4}
              />
            </Pressable>
          </Grid.Item>
        );
      })}
    </Grid>
  );
}

export const TYPE_FORM_ICONS = [
  'ForkKnife',
  'Bus',
  'ShoppingBag',
  'House',
  'GameController',
  'Pill',
  'BookOpen',
  'Gift',
  'Wallet',
  'CreditCard',
  'ChartLine',
  'DotsThreeCircle',
] as const;

export const TAG_FORM_ICONS = [
  'Receipt',
  'Briefcase',
  'Folder',
  'Gift',
  'BookOpen',
  'Barbell',
  'Plug',
  'PawPrint',
  'Users',
  'Train',
  'Coffee',
  'Archive',
] as const;
