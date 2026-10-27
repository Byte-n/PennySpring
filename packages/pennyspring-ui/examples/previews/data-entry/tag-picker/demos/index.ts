import { tagPickerBasicDemoTitle, TagPickerBasicDemo } from './basic';
import { tagPickerHiddenDemoTitle, TagPickerHiddenDemo } from './hidden';
import { tagPickerSizesDemoTitle, TagPickerSizesDemo } from './sizes';
import { tagPickerStatesDemoTitle, TagPickerStatesDemo } from './states';

export const tagPickerDemos = [
  {
    id: 'basic',
    title: tagPickerBasicDemoTitle,
    Component: TagPickerBasicDemo,
  },
  {
    id: 'hidden',
    title: tagPickerHiddenDemoTitle,
    Component: TagPickerHiddenDemo,
  },
  {
    id: 'sizes',
    title: tagPickerSizesDemoTitle,
    Component: TagPickerSizesDemo,
  },
  {
    id: 'states',
    title: tagPickerStatesDemoTitle,
    Component: TagPickerStatesDemo,
  },
];
