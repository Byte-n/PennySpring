import {
  calculatorInputBasicDemoTitle,
  CalculatorInputBasicDemo,
} from './basic';
import {
  calculatorInputCalculatorInputPopupDemoTitle,
  CalculatorInputCalculatorInputPopupDemo,
} from './calculator-input-popup';
import {
  calculatorInputControlledDemoTitle,
  CalculatorInputControlledDemo,
} from './controlled';
import {
  calculatorInputStateDemoTitle,
  CalculatorInputStateDemo,
} from './state';

export const calculatorInputDemos = [
  {
    id: 'basic',
    title: calculatorInputBasicDemoTitle,
    Component: CalculatorInputBasicDemo,
  },
  {
    id: 'calculator-input-popup',
    title: calculatorInputCalculatorInputPopupDemoTitle,
    Component: CalculatorInputCalculatorInputPopupDemo,
  },
  {
    id: 'controlled',
    title: calculatorInputControlledDemoTitle,
    Component: CalculatorInputControlledDemo,
  },
  {
    id: 'state',
    title: calculatorInputStateDemoTitle,
    Component: CalculatorInputStateDemo,
  },
];
