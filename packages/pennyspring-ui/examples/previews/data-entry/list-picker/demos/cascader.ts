import {
  listPickerCascaderBasicDemoTitle,
  ListPickerCascaderBasicDemo,
} from './cascader-basic';
import {
  listPickerCascaderTriggerDemoTitle,
  ListPickerCascaderTriggerDemo,
} from './cascader-trigger';

export const listPickerCascaderDemos = [
  {
    id: 'cascader-basic',
    title: `Cascader / ${listPickerCascaderBasicDemoTitle}`,
    Component: ListPickerCascaderBasicDemo,
  },
  {
    id: 'cascader-trigger',
    title: `Cascader / ${listPickerCascaderTriggerDemoTitle}`,
    Component: ListPickerCascaderTriggerDemo,
  },
];
