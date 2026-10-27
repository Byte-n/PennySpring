import { cardSizeDemoTitle, CardSizeDemo } from './size';
import { cardSlotsDemoTitle, CardSlotsDemo } from './slots';
import { cardStateDemoTitle, CardStateDemo } from './state';
import { cardVariantsDemoTitle, CardVariantsDemo } from './variants';

export const cardDemos = [
  { id: 'variants', title: cardVariantsDemoTitle, Component: CardVariantsDemo },
  { id: 'size', title: cardSizeDemoTitle, Component: CardSizeDemo },
  { id: 'slots', title: cardSlotsDemoTitle, Component: CardSlotsDemo },
  { id: 'state', title: cardStateDemoTitle, Component: CardStateDemo },
];
