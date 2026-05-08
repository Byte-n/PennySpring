import React from 'react';
import { Pressable, View } from 'react-native';
import { createUseSheetStyle } from '@pennyspring/theme';
import type { ViewStyle } from 'react-native';
import type { GridGap, GridItemProps, GridProps } from './types';

const DEFAULT_SPAN = 1;
const MIN_COLUMNS = 1;
const MIN_GAP = 0;
const MIN_SPAN = 1;
const PERCENTAGE_BASE = 100;
const GAP_DIVISOR = 2;

interface ResolvedGap {
  horizontal: number;
  vertical: number;
}

interface GridStyleOptions {
  gap: ResolvedGap;
}

interface GridItemStyleOptions {
  columns: number;
  gap: ResolvedGap;
  span: number;
}

interface GridContextValue {
  columns: number;
  gap: ResolvedGap;
}

const GridContext = React.createContext<GridContextValue | null>(null);

const useGridStyles = createUseSheetStyle((_, { gap }: GridStyleOptions) => ({
  root: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: getNegativeHalfGap(gap.horizontal),
    marginVertical: getNegativeHalfGap(gap.vertical),
  },
}));

const useGridItemStyles = createUseSheetStyle(
  (_, { columns, gap, span }: GridItemStyleOptions) => {
    const width = `${(PERCENTAGE_BASE / columns) * span}%` as ViewStyle['width'];

    return {
      item: {
        paddingHorizontal: gap.horizontal / GAP_DIVISOR,
        paddingVertical: gap.vertical / GAP_DIVISOR,
        width,
      },
    };
  },
);

function resolveColumns(columns: number): number {
  if (!Number.isFinite(columns)) {
    return MIN_COLUMNS;
  }

  return Math.max(MIN_COLUMNS, Math.floor(columns));
}

function resolveGap(gap?: GridGap): ResolvedGap {
  if (Array.isArray(gap)) {
    return {
      horizontal: resolveGapValue(gap[0]),
      vertical: resolveGapValue(gap[1]),
    };
  }

  const value = resolveGapValue(gap);

  return {
    horizontal: value,
    vertical: value,
  };
}

function resolveGapValue(gap?: number): number {
  if (gap === undefined || !Number.isFinite(gap)) {
    return MIN_GAP;
  }

  return Math.max(MIN_GAP, gap);
}

function getNegativeHalfGap(gap: number): number {
  if (gap === MIN_GAP) {
    return MIN_GAP;
  }

  return -gap / GAP_DIVISOR;
}

function resolveSpan(span: number | undefined, columns: number): number {
  if (span !== undefined && !Number.isFinite(span)) {
    return MIN_SPAN;
  }

  return Math.min(columns, Math.max(MIN_SPAN, Math.floor(span ?? DEFAULT_SPAN)));
}

export function GridItem({
  children,
  onPress,
  span,
  style,
}: GridItemProps) {
  const context = React.useContext(GridContext);
  const columns = context?.columns ?? MIN_COLUMNS;
  const gap = context?.gap ?? resolveGap();
  const resolvedSpan = resolveSpan(span, columns);
  const tokenStyles = useGridItemStyles({
    columns,
    gap,
    span: resolvedSpan,
  });
  const itemStyle = [tokenStyles.item, style];

  if (onPress === undefined) {
    return (
      <View testID="grid-item" style={itemStyle}>
        {children}
      </View>
    );
  }

  return (
    <Pressable testID="grid-item" style={itemStyle} onPress={onPress}>
      {children}
    </Pressable>
  );
}

export function GridRoot({
  children,
  columns,
  gap,
  style,
}: GridProps) {
  const resolvedColumns = resolveColumns(columns);
  const resolvedGap = resolveGap(gap);
  const tokenStyles = useGridStyles({ gap: resolvedGap });
  const context = React.useMemo(
    () => ({
      columns: resolvedColumns,
      gap: resolvedGap,
    }),
    [resolvedColumns, resolvedGap],
  );

  return (
    <GridContext.Provider value={context}>
      <View testID="grid" style={[tokenStyles.root, style]}>
        {children}
      </View>
    </GridContext.Provider>
  );
}

export const Grid = Object.assign(GridRoot, {
  Item: GridItem,
});
