import { emptySizeDemoTitle, EmptySizeDemo } from './size';
import { emptySlotsDemoTitle, EmptySlotsDemo } from './slots';
import { emptyVariantsDemoTitle, EmptyVariantsDemo } from './variants';

export const emptyDemos = [
  { id: 'variants', title: emptyVariantsDemoTitle, Component: EmptyVariantsDemo },
  { id: 'size', title: emptySizeDemoTitle, Component: EmptySizeDemo },
  { id: 'slots', title: emptySlotsDemoTitle, Component: EmptySlotsDemo },
];
