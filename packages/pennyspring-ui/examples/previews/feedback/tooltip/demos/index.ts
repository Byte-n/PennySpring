import { tooltipOverflowDemoTitle, TooltipOverflowDemo } from './overflow';
import { tooltipPlacementDemoTitle, TooltipPlacementDemo } from './placement';
import { tooltipTriggerDemoTitle, TooltipTriggerDemo } from './trigger';
import { tooltipVariantDemoTitle, TooltipVariantDemo } from './variant';

export const tooltipDemos = [
  {
    id: 'variant',
    title: tooltipVariantDemoTitle,
    Component: TooltipVariantDemo,
  },
  {
    id: 'trigger',
    title: tooltipTriggerDemoTitle,
    Component: TooltipTriggerDemo,
  },
  {
    id: 'placement',
    title: tooltipPlacementDemoTitle,
    Component: TooltipPlacementDemo,
  },
  {
    id: 'overflow',
    title: tooltipOverflowDemoTitle,
    Component: TooltipOverflowDemo,
  },
];
