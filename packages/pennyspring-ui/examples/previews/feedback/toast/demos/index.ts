import { toastPlacementDemoTitle, ToastPlacementDemo } from './placement';
import { toastReplaceDemoTitle, ToastReplaceDemo } from './replace';
import { toastSizeDemoTitle, ToastSizeDemo } from './size';
import { toastStatusDemoTitle, ToastStatusDemo } from './status';

export const toastDemos = [
  { id: 'size', title: toastSizeDemoTitle, Component: ToastSizeDemo },
  { id: 'status', title: toastStatusDemoTitle, Component: ToastStatusDemo },
  { id: 'placement', title: toastPlacementDemoTitle, Component: ToastPlacementDemo },
  { id: 'replace', title: toastReplaceDemoTitle, Component: ToastReplaceDemo },
];
