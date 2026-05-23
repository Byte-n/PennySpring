import {
  segmentedControlledBlockDemoTitle,
  SegmentedControlledBlockDemo,
} from './controlled-block';
import { segmentedOptionsDemoTitle, SegmentedOptionsDemo } from './options';
import {
  segmentedSizeAndDisabledDemoTitle,
  SegmentedSizeAndDisabledDemo,
} from './size-and-disabled';

export const segmentedDemos = [
  {
    id: 'controlled-block',
    title: segmentedControlledBlockDemoTitle,
    Component: SegmentedControlledBlockDemo,
  },
  {
    id: 'options',
    title: segmentedOptionsDemoTitle,
    Component: SegmentedOptionsDemo,
  },
  {
    id: 'size-and-disabled',
    title: segmentedSizeAndDisabledDemoTitle,
    Component: SegmentedSizeAndDisabledDemo,
  },
];
