import { useCallback, useState } from 'react';
import type { LayoutChangeEvent } from 'react-native';

const INITIAL_WIDTH = 0;

export function useMeasuredWidth(): {
  width: number;
  onLayout: (event: LayoutChangeEvent) => void;
} {
  const [width, setWidth] = useState(INITIAL_WIDTH);
  const onLayout = useCallback((event: LayoutChangeEvent) => {
    setWidth(event.nativeEvent.layout.width);
  }, []);

  return { width, onLayout };
}
