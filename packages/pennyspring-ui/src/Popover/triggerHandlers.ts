import React from 'react';
import type { GestureResponderEvent } from 'react-native';

interface TriggerHandlers {
  onLongPress?: (event: GestureResponderEvent) => void;
  onPress?: (event: GestureResponderEvent) => void;
}

export function mergeTriggerHandlers(
  child: React.ReactElement,
  onPress?: () => void,
  onLongPress?: () => void,
): React.ReactElement {
  if (onPress === undefined && onLongPress === undefined) {
    return child;
  }

  const childProps = child.props as TriggerHandlers;
  const mergedProps: TriggerHandlers = {
    onPress:
      onPress === undefined
        ? childProps.onPress
        : event => {
            childProps.onPress?.(event);
            onPress();
          },
    onLongPress:
      onLongPress === undefined
        ? childProps.onLongPress
        : event => {
            childProps.onLongPress?.(event);
            onLongPress();
          },
  };

  return React.cloneElement(child, mergedProps);
}
