import { listPickerGroupedDemoTitle, ListPickerGroupedDemo } from './grouped';
import {
  listPickerMultipleDemoTitle,
  ListPickerMultipleDemo,
} from './multiple';
import { listPickerSingleDemoTitle, ListPickerSingleDemo } from './single';
import { listPickerStatesDemoTitle, ListPickerStatesDemo } from './states';

export const listPickerDemos = [
  {
    id: 'single',
    title: listPickerSingleDemoTitle,
    Component: ListPickerSingleDemo,
  },
  {
    id: 'multiple',
    title: listPickerMultipleDemoTitle,
    Component: ListPickerMultipleDemo,
  },
  {
    id: 'grouped',
    title: listPickerGroupedDemoTitle,
    Component: ListPickerGroupedDemo,
  },
  {
    id: 'states',
    title: listPickerStatesDemoTitle,
    Component: ListPickerStatesDemo,
  },
];
