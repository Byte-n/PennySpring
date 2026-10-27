import { pickerCascaderBasicDemoTitle, PickerCascaderBasicDemo } from './basic';
import {
  pickerCascaderControlledDemoTitle,
  PickerCascaderControlledDemo,
} from './controlled';
import { pickerCascaderStateDemoTitle, PickerCascaderStateDemo } from './state';

export const pickerCascaderDemos = [
  {
    id: 'basic',
    title: pickerCascaderBasicDemoTitle,
    Component: PickerCascaderBasicDemo,
  },
  {
    id: 'controlled',
    title: pickerCascaderControlledDemoTitle,
    Component: PickerCascaderControlledDemo,
  },
  {
    id: 'state',
    title: pickerCascaderStateDemoTitle,
    Component: PickerCascaderStateDemo,
  },
];
