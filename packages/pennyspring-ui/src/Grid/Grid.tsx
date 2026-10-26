import React from 'react';
import { Pressable, View } from 'react-native';
import { createUseSheetStyle, useTheme } from '@pennyspring/theme';
import type { AliasToken } from '@pennyspring/theme';
import type { GridGap, GridItemProps, GridProps } from './types';
import type { ComponentSize } from '../shares/types';

const DEFAULT_SPAN = 1;
const MIN_COLUMNS = 1;
const MIN_SPAN = 1;
const GAP_DIVISOR = 2;

interface ResolvedGap {
  horizontal: number;
  vertical: number;
}

interface GridContextValue {
  columns: number;
  gap: ResolvedGap;
}

const GridContext = React.createContext<GridContextValue | null>(null);

const useGridStyles = createUseSheetStyle(() => ({
  root: {
    alignSelf: 'stretch',
  },
  row: {
    flexDirection: 'row',
  },
}));

const useGridItemStyles = createUseSheetStyle(
  (_, { gap, span, columns }: { gap: ResolvedGap; span: number; columns: number }) => ({
    item: {
      width: `${(span / columns) * 100}%`,
      paddingHorizontal: gap.horizontal / GAP_DIVISOR,
      paddingVertical: gap.vertical / GAP_DIVISOR,
    },
  }),
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
  const value = getGapValue(gap ?? 'normal', token);
  return {
    horizontal: value,
    vertical: value / GAP_DIVISOR,
  };
}

function resolveSpan(span: number | undefined, columns: number): number {
  if (span !== undefined && !Number.isFinite(span)) {
    return MIN_SPAN;
  }
  return Math.min(columns, Math.max(MIN_SPAN, Math.floor(span ?? DEFAULT_SPAN)));
}

export function GridItem({ children, disabled, onPress, span, style, testID }: GridItemProps) {
  const context = React.useContext(GridContext);
  const columns = context?.columns ?? MIN_COLUMNS;
  const gap = context?.gap ?? { horizontal: 0, vertical: 0 };
  const resolvedSpan = resolveSpan(span, columns);
  const tokenStyles = useGridItemStyles({ gap, span: resolvedSpan, columns });
  const itemStyle = [tokenStyles.item, style];

  return (
    <Pressable disabled={disabled} testID={testID ?? 'grid-item'} style={itemStyle} onPress={onPress}>
      {children}
    </Pressable>
  );
}

export function GridRoot({ children, columns, gap, style }: GridProps) {
  const { token } = useTheme();
  const resolvedColumns = resolveColumns(columns);
  const resolvedGap = resolveGap(gap, token);
  const tokenStyles = useGridStyles({});
  const context = React.useMemo(
    () => ({ columns: resolvedColumns, gap: resolvedGap }),
    [resolvedColumns, resolvedGap],
  );

  const rows = React.useMemo(() => {
    const items = React.Children.toArray(children);
    const result: React.ReactNode[][] = [];
    let current: React.ReactNode[] = [];
    let filled = 0;

    for (const item of items) {
      const rawSpan =
        React.isValidElement<GridItemProps>(item) &&
        typeof item.props.span === 'number'
          ? item.props.span
          : undefined;
      const span = resolveSpan(rawSpan, resolvedColumns);

      if (filled + span > resolvedColumns && current.length > 0) {
        result.push(current);
        current = [];
        filled = 0;
      }

      current.push(item);
      filled += span;

      if (filled >= resolvedColumns) {
        result.push(current);
        current = [];
        filled = 0;
      }
    }

    if (current.length > 0) {
      result.push(current);
    }

    return result;
  }, [children, resolvedColumns]);

  return (
    <GridContext.Provider value={context}>
      <View testID="grid" style={[tokenStyles.root, style]}>
        {rows.map((row, rowIndex) => (
          <View
            key={rowIndex}
            style={[
              tokenStyles.row,
              rowIndex > 0 && { marginTop: resolvedGap.vertical },
            ]}
          >
            {row}
          </View>
        ))}
      </View>
    </GridContext.Provider>
  );
}

export const Grid = Object.assign(GridRoot, {
  Item: GridItem,
});
