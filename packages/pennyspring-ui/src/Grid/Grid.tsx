import React from 'react';
import { Pressable, View } from 'react-native';
import { createUseSheetStyle, useTheme } from '@pennyspring/theme';
import type { AliasToken } from '@pennyspring/theme';
import type { GridGap, GridItemProps, GridProps } from './types';
import type { ComponentSize } from '../shares/types';

const DEFAULT_SPAN = 1;
const MIN_COLUMNS = 1;
const MIN_GAP = 0;
const MIN_SPAN = 1;
const GAP_DIVISOR = 2;

interface ResolvedGap {
  horizontal: number;
  vertical: number;
}

interface GridStyleOptions {
  gap: ResolvedGap;
}

interface GridItemStyleOptions {
  containerWidth: number;
  columns: number;
  gap: ResolvedGap;
  span: number;
}

interface GridContextValue {
  containerWidth: number;
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
  (_, { columns, containerWidth, gap, span }: GridItemStyleOptions) => {
    const cellWidth = columns > 0 ? containerWidth / columns : 0;
    const itemWidth = Math.max(MIN_GAP, cellWidth * span);

    return {
      item: {
        paddingHorizontal: gap.horizontal / GAP_DIVISOR,
        paddingVertical: gap.vertical / GAP_DIVISOR,
        width: itemWidth,
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

function getGapValue(gap: ComponentSize, token: AliasToken): number {
  if (gap === 'small') {
    return token.paddingXXS;
  }

  if (gap === 'large') {
    return token.paddingSM;
  }

  return token.paddingXS;
}

function resolveGap(gap: GridGap | undefined, token: AliasToken): ResolvedGap {
  const toVerticalGap = (horizontalGap: number): number => {
    return horizontalGap / GAP_DIVISOR;
  };

  const value = getGapValue(gap ?? 'normal', token);

  return {
    horizontal: value,
    vertical: toVerticalGap(value),
  };
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
  const containerWidth = context?.containerWidth ?? MIN_GAP;
  const columns = context?.columns ?? MIN_COLUMNS;
  const gap = context?.gap ?? { horizontal: MIN_GAP, vertical: MIN_GAP };
  const resolvedSpan = resolveSpan(span, columns);
  const tokenStyles = useGridItemStyles({
    columns,
    containerWidth,
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
  const { token } = useTheme();
  const resolvedColumns = resolveColumns(columns);
  const resolvedGap = resolveGap(gap, token);
  const tokenStyles = useGridStyles({ gap: resolvedGap });
  const context = React.useMemo(
    () => ({
      containerWidth: MIN_GAP,
      columns: resolvedColumns,
      gap: resolvedGap,
    }),
    [resolvedColumns, resolvedGap],
  );
  const [containerWidth, setContainerWidth] = React.useState(MIN_GAP);
  const resolvedContext = React.useMemo(
    () => ({
      ...context,
      containerWidth: Math.max(MIN_GAP, containerWidth),
    }),
    [containerWidth, context],
  );

  return (
    <GridContext.Provider value={resolvedContext}>
      <View
        testID="grid"
        onLayout={event => {
          setContainerWidth(event.nativeEvent.layout.width);
        }}
        style={[tokenStyles.root, style]}
      >
        {children}
      </View>
    </GridContext.Provider>
  );
}

export const Grid = Object.assign(GridRoot, {
  Item: GridItem,
});
