import type { StyleProp, ViewStyle } from 'react-native';
import type { ComponentSize } from '../shares/types';

export type SliderSize = ComponentSize;

export interface SliderStyles {
  track?: StyleProp<ViewStyle>;
  trackFill?: StyleProp<ViewStyle>;
  thumb?: StyleProp<ViewStyle>;
}

export interface SliderProps {
  /**
   * Slider size semantic. Defaults to normal.
   */
  size?: SliderSize;

  /**
   * Controlled slider value.
   */
  value?: number;

  /**
   * Uncontrolled slider initial value.
   */
  defaultValue?: number;

  /**
   * Minimum slider value. Defaults to 0.
   */
  min?: number;

  /**
   * Maximum slider value. Defaults to 100.
   */
  max?: number;

  /**
   * Step size. Defaults to 1.
   */
  step?: number;

  /**
   * Called when value changes.
   */
  onChange?: (value: number) => void;

  /**
   * Disabled slider can not be dragged.
   */
  disabled?: boolean;

  /**
   * Readonly slider can not be dragged.
   */
  readonly?: boolean;

  /**
   * Root style.
   */
  style?: StyleProp<ViewStyle>;

  /**
   * Stable slot style overrides.
   */
  styles?: SliderStyles;
}
