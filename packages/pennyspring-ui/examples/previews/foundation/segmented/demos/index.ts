import { segmentedBlockDemoTitle, SegmentedBlockDemo } from './block';
import {
  segmentedContentDemoTitle,
  SegmentedContentDemo,
} from './content';
import { segmentedDarkDemoTitle, SegmentedDarkDemo } from './dark';
import { segmentedSizeDemoTitle, SegmentedSizeDemo } from './size';
import {
  segmentedStatesDemoTitle,
  SegmentedStatesDemo,
} from './states';

export const segmentedDemos = [
  { id: 'size', title: segmentedSizeDemoTitle, Component: SegmentedSizeDemo },
  {
    id: 'states',
    title: segmentedStatesDemoTitle,
    Component: SegmentedStatesDemo,
  },
  {
    id: 'content',
    title: segmentedContentDemoTitle,
    Component: SegmentedContentDemo,
  },
  { id: 'block', title: segmentedBlockDemoTitle, Component: SegmentedBlockDemo },
  { id: 'dark', title: segmentedDarkDemoTitle, Component: SegmentedDarkDemo },
];
