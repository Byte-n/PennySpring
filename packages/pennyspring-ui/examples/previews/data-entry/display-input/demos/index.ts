import { displayInputBasicDemoTitle, DisplayInputBasicDemo } from './basic';
import {
  displayInputCustomValueNodeDemoTitle,
  DisplayInputCustomValueNodeDemo,
} from './custom-value-node';
import {
  displayInputDisplayDemoTitle,
  DisplayInputDisplayDemo,
} from './display';
import {
  displayInputOverflowDemoTitle,
  DisplayInputOverflowDemo,
} from './overflow';
import {
  displayInputOverflowVisibleDemoTitle,
  DisplayInputOverflowVisibleDemo,
} from './overflow-visible';
import {
  displayInputSizeDemoTitle,
  DisplayInputSizeDemo,
} from './size';
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
    id: 'size',
    title: displayInputSizeDemoTitle,
    Component: DisplayInputSizeDemo,
  },
  {
    id: 'display',
    title: displayInputDisplayDemoTitle,
    Component: DisplayInputDisplayDemo,
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
  {
    id: 'custom-value-node',
    title: displayInputCustomValueNodeDemoTitle,
    Component: DisplayInputCustomValueNodeDemo,
  },
  {
    id: 'overflow',
    title: displayInputOverflowDemoTitle,
    Component: DisplayInputOverflowDemo,
  },
  {
    id: 'overflow-visible',
    title: displayInputOverflowVisibleDemoTitle,
    Component: DisplayInputOverflowVisibleDemo,
  },
];
