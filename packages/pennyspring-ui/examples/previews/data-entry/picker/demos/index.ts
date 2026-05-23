import { pickerBasicDemoTitle, PickerBasicDemo } from './basic';
import { pickerControlledDemoTitle, PickerControlledDemo } from './controlled';
import { pickerPopupPropsDemoTitle, PickerPopupPropsDemo } from './popup-props';
import { pickerStateDemoTitle, PickerStateDemo } from './state';

export const pickerDemos = [
  { id: 'basic', title: pickerBasicDemoTitle, Component: PickerBasicDemo },
  {
    id: 'controlled',
    title: pickerControlledDemoTitle,
    Component: PickerControlledDemo,
  },
  {
    id: 'popup-props',
    title: pickerPopupPropsDemoTitle,
    Component: PickerPopupPropsDemo,
  },
  { id: 'state', title: pickerStateDemoTitle, Component: PickerStateDemo },
];
