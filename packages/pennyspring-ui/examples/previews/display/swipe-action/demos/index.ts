import {
  swipeActionLeftAndRightActionsDemoTitle,
  SwipeActionLeftAndRightActionsDemo,
} from './left-and-right-actions';
import {
  swipeActionSizeAndReadonlyDemoTitle,
  SwipeActionSizeAndReadonlyDemo,
} from './size-and-readonly';

export const swipeActionDemos = [
  {
    id: 'left-and-right-actions',
    title: swipeActionLeftAndRightActionsDemoTitle,
    Component: SwipeActionLeftAndRightActionsDemo,
  },
  {
    id: 'size-and-readonly',
    title: swipeActionSizeAndReadonlyDemoTitle,
    Component: SwipeActionSizeAndReadonlyDemo,
  },
];
