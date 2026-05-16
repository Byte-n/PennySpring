import { CalculatorInput as CalculatorInputRoot } from './CalculatorInput';
import { CalculatorInputPopup } from './CalculatorInputPopup';

export const CalculatorInput = Object.assign(CalculatorInputRoot, {
  Popup: CalculatorInputPopup,
});

export type {
  CalculatorInputOkParams,
  CalculatorInputPopupProps,
  CalculatorInputProps,
  CalculatorInputStyles,
} from './types';
