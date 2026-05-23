import {
  loadingCustomIndicatorDemoTitle,
  LoadingCustomIndicatorDemo,
} from './custom-indicator';
import { loadingDirectionDemoTitle, LoadingDirectionDemo } from './direction';
import { loadingSizeDemoTitle, LoadingSizeDemo } from './size';

export const loadingDemos = [
  {
    id: 'custom-indicator',
    title: loadingCustomIndicatorDemoTitle,
    Component: LoadingCustomIndicatorDemo,
  },
  {
    id: 'direction',
    title: loadingDirectionDemoTitle,
    Component: LoadingDirectionDemo,
  },
  { id: 'size', title: loadingSizeDemoTitle, Component: LoadingSizeDemo },
];
