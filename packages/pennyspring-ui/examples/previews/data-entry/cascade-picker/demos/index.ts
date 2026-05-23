import { cascadePickerBasicDemoTitle, CascadePickerBasicDemo } from './basic';
import {
  cascadePickerControlledDemoTitle,
  CascadePickerControlledDemo,
} from './controlled';
import { cascadePickerStateDemoTitle, CascadePickerStateDemo } from './state';

export const cascadePickerDemos = [
  {
    id: 'basic',
    title: cascadePickerBasicDemoTitle,
    Component: CascadePickerBasicDemo,
  },
  {
    id: 'controlled',
    title: cascadePickerControlledDemoTitle,
    Component: CascadePickerControlledDemo,
  },
  {
    id: 'state',
    title: cascadePickerStateDemoTitle,
    Component: CascadePickerStateDemo,
  },
];
