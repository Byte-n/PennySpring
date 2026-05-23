import { displayInputBasicDemoTitle, DisplayInputBasicDemo } from './basic';
import {
  displayInputCustomValueNodeDemoTitle,
  DisplayInputCustomValueNodeDemo,
} from './custom-value-node';
import {
  displayInputOverflowVisibleDemoTitle,
  DisplayInputOverflowVisibleDemo,
} from './overflow-visible';
import {
  displayInputOverflowDemoTitle,
  DisplayInputOverflowDemo,
} from './overflow';
import { displayInputStateDemoTitle, DisplayInputStateDemo } from './state';
import {
  displayInputValueTextDemoTitle,
  DisplayInputValueTextDemo,
} from './value-text';

export const displayInputDemos = [
  {
    id: 'basic',
    title: displayInputBasicDemoTitle,
    Component: DisplayInputBasicDemo,
  },
  {
    id: 'custom-value-node',
    title: displayInputCustomValueNodeDemoTitle,
    Component: DisplayInputCustomValueNodeDemo,
  },
  {
    id: 'overflow-visible',
    title: displayInputOverflowVisibleDemoTitle,
    Component: DisplayInputOverflowVisibleDemo,
  },
  {
    id: 'overflow',
    title: displayInputOverflowDemoTitle,
    Component: DisplayInputOverflowDemo,
  },
  {
    id: 'state',
    title: displayInputStateDemoTitle,
    Component: DisplayInputStateDemo,
  },
  {
    id: 'value-text',
    title: displayInputValueTextDemoTitle,
    Component: DisplayInputValueTextDemo,
  },
];
