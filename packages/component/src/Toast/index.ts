export { Toast } from './Toast';
export { ToastPortal, showToast, clearAllToasts } from './ToastManager';
export type {
  ToastPosition,
  ToastProps,
  ToastShowOptions,
  ToastSize,
  ToastStaticMethods,
  ToastStyles,
  ToastType,
} from './types';

import { showToast, clearAllToasts } from './ToastManager';
import type { ToastShowOptions, ToastStaticMethods } from './types';

export const toast: ToastStaticMethods = {
  show: showToast,
  success: (options: ToastShowOptions) => showToast({ ...options, type: 'success' }),
  fail: (options: ToastShowOptions) => showToast({ ...options, type: 'fail' }),
  info: (options: ToastShowOptions) => showToast({ ...options, type: 'info' }),
  clear: clearAllToasts,
};
