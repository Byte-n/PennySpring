import { CalculatorInput as CalculatorInputRoot } from './CalculatorInput';
import { CalculatorInputPopup } from './CalculatorInputPopup';
import { useCalculatorValueState } from './useCalculatorValueState';

export const CalculatorInput = Object.assign(CalculatorInputRoot, {
  Popup: CalculatorInputPopup,
  useCalculatorValueState,
});

export type {
  CalculatorInputOkParams,
  CalculatorInputPopupProps,
  CalculatorInputProps,
  CalculatorInputStyles,
  CalculatorValueState,
  UseCalculatorValueStateOptions,
} from './types';
