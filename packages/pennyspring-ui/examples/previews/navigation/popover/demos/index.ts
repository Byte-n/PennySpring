import { popoverPlacementDemoTitle, PopoverPlacementDemo } from './placement';
import { popoverTriggerDemoTitle, PopoverTriggerDemo } from './trigger';

export const popoverDemos = [
  {
    id: 'trigger',
    title: popoverTriggerDemoTitle,
    Component: PopoverTriggerDemo,
  },
  {
    id: 'placement',
    title: popoverPlacementDemoTitle,
    Component: PopoverPlacementDemo,
  },
];
