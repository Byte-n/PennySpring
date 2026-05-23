import {
  selectionListControlledValueDemoTitle,
  SelectionListControlledValueDemo,
} from './controlled-value';
import {
  selectionListSearchAndGroupedDemoTitle,
  SelectionListSearchAndGroupedDemo,
} from './search-and-grouped';
import {
  selectionListTriggerDemoTitle,
  SelectionListTriggerDemo,
} from './trigger';

export const selectionListDemos = [
  {
    id: 'controlled-value',
    title: selectionListControlledValueDemoTitle,
    Component: SelectionListControlledValueDemo,
  },
  {
    id: 'search-and-grouped',
    title: selectionListSearchAndGroupedDemoTitle,
    Component: SelectionListSearchAndGroupedDemo,
  },
  {
    id: 'trigger',
    title: selectionListTriggerDemoTitle,
    Component: SelectionListTriggerDemo,
  },
];
