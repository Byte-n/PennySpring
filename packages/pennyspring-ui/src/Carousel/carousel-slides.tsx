import { useMemoizedFn } from '../_hooks';
import { type ReactNode, useMemo } from 'react';
import { View, type ViewStyle } from 'react-native';
import { clampValue } from './utils';

interface CarouselSlidesProps<Data = unknown> {
  data: Data[];
  renderItem: (item: Data, index: number) => ReactNode;
  total: number;
  virtualRange: {
    start: number;
    end: number;
    isVirtual: boolean;
  } | null;
  loopEnabled: boolean;
  clonesBefore: number;
  extTotal: number;
  styles: {
    slideWrapper: ViewStyle;
    spacerLeading: ViewStyle;
    spacerTrailing: ViewStyle;
  };
}

export const CarouselSlides = <Data = unknown,>(
  props: CarouselSlidesProps<Data>,
) => {
  const {
    data,
    renderItem,
    total,
    virtualRange,
    loopEnabled,
    clonesBefore,
    extTotal,
    styles,
  } = props;

  const getIndexFromExtIndex = useMemoizedFn((extIndex: number) => {
    if (!loopEnabled) return clampValue(extIndex, 0, total - 1);
    if (extIndex < clonesBefore) {
      return (((extIndex - clonesBefore) % total) + total) % total;
    }
    if (extIndex >= clonesBefore + total) {
      return (extIndex - clonesBefore - total) % total;
    }
    return extIndex - clonesBefore;
  });

  const slideElements = useMemo(() => {
    if (!virtualRange) return null;

    const { start, end } = virtualRange;
    const elements: ReactNode[] = [];

    for (let extIndex = start; extIndex <= end; extIndex += 1) {
      const logicalIndex = loopEnabled
        ? getIndexFromExtIndex(extIndex)
        : clampValue(extIndex, 0, total - 1);

      const item = data[logicalIndex];
      const element = renderItem(item, logicalIndex);
      if (!element) continue;

      elements.push(
        <View key={extIndex} style={styles.slideWrapper}>
          {element}
        </View>,
      );
    }

    return elements;
  }, [
    data,
    getIndexFromExtIndex,
    loopEnabled,
    renderItem,
    styles.slideWrapper,
    total,
    virtualRange,
  ]);

  const leadSpacer = useMemo(() => {
    if (!virtualRange?.isVirtual) {
      return null;
    }

    const leadingSize = virtualRange.start;
    if (leadingSize <= 0) {
      return null;
    }

    return <View style={styles.spacerLeading} />;
  }, [styles.spacerLeading, virtualRange]);

  const trailSpacer = useMemo(() => {
    if (!virtualRange?.isVirtual) {
      return null;
    }

    const trailingSize = extTotal - virtualRange.end - 1;
    if (trailingSize <= 0) {
      return null;
    }

    return <View style={styles.spacerTrailing} />;
  }, [extTotal, styles.spacerTrailing, virtualRange]);

  if (!virtualRange) return null;

  return (
    <>
      {leadSpacer}
      {slideElements}
      {trailSpacer}
    </>
  );
};
