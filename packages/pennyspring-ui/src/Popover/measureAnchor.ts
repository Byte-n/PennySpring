import type { View } from 'react-native';
import type { PopoverAnchorRect } from './popoverLayout';

interface MeasurableNode {
  measureInWindow?: (
    callback: (x: number, y: number, width: number, height: number) => void,
  ) => void;
}

export function measurePopoverAnchor(
  node: View | null,
  onMeasured: (rect: PopoverAnchorRect) => void,
): void {
  const measurableNode = node as unknown as MeasurableNode | null;

  if (typeof measurableNode?.measureInWindow !== 'function') {
    onMeasured({ x: 0, y: 0, width: 0, height: 0 });
    return;
  }

  measurableNode.measureInWindow((x, y, width, height) => {
    onMeasured({ x, y, width, height });
  });
}
