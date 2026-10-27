import {
  pickerCascaderBasicDemoTitle,
  PickerCascaderBasicDemo,
} from './cascader-basic';
import {
  pickerCascaderControlledDemoTitle,
  PickerCascaderControlledDemo,
} from './cascader-controlled';
import {
  pickerCascaderStateDemoTitle,
  PickerCascaderStateDemo,
} from './cascader-state';

export const pickerCascaderDemos = [
  {
    id: 'cascader-basic',
    title: `Cascader / ${pickerCascaderBasicDemoTitle}`,
    Component: PickerCascaderBasicDemo,
  },
  {
    id: 'cascader-controlled',
    title: `Cascader / ${pickerCascaderControlledDemoTitle}`,
    Component: PickerCascaderControlledDemo,
  },
  {
    id: 'cascader-state',
    title: `Cascader / ${pickerCascaderStateDemoTitle}`,
    Component: PickerCascaderStateDemo,
  },
];
