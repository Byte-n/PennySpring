import { loadingSizeDemoTitle, LoadingSizeDemo } from './size';
import { loadingStatesDemoTitle, LoadingStatesDemo } from './states';
import { loadingVariantsDemoTitle, LoadingVariantsDemo } from './variants';

export const loadingDemos = [
  { id: 'variants', title: loadingVariantsDemoTitle, Component: LoadingVariantsDemo },
  { id: 'size', title: loadingSizeDemoTitle, Component: LoadingSizeDemo },
  { id: 'states', title: loadingStatesDemoTitle, Component: LoadingStatesDemo },
];
