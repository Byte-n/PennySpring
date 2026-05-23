import {
  dataListFlatListAndLoadStatesDemoTitle,
  DataListFlatListAndLoadStatesDemo,
} from './flat-list-and-load-states';
import {
  dataListLoadingAndEmptyFooterDemoTitle,
  DataListLoadingAndEmptyFooterDemo,
} from './loading-and-empty-footer';
import {
  dataListSectionListDemoTitle,
  DataListSectionListDemo,
} from './section-list';

export const dataListDemos = [
  {
    id: 'flat-list-and-load-states',
    title: dataListFlatListAndLoadStatesDemoTitle,
    Component: DataListFlatListAndLoadStatesDemo,
  },
  {
    id: 'loading-and-empty-footer',
    title: dataListLoadingAndEmptyFooterDemoTitle,
    Component: DataListLoadingAndEmptyFooterDemo,
  },
  {
    id: 'section-list',
    title: dataListSectionListDemoTitle,
    Component: DataListSectionListDemo,
  },
];
