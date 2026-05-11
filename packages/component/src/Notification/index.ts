export { Notification } from './Notification';
export {
  NotificationPortal,
  openNotification,
  clearAllNotifications,
} from './NotificationManager';
export type {
  NotificationOpenOptions,
  NotificationProps,
  NotificationSize,
  NotificationStaticMethods,
  NotificationStyles,
  NotificationType,
} from './types';

import { openNotification, clearAllNotifications } from './NotificationManager';
import type { NotificationOpenOptions } from './types';

export const notification = {
  open: openNotification,
  success: (options: Omit<NotificationOpenOptions, 'type'>) =>
    openNotification({ ...options, type: 'success' }),
  warning: (options: Omit<NotificationOpenOptions, 'type'>) =>
    openNotification({ ...options, type: 'warning' }),
  error: (options: Omit<NotificationOpenOptions, 'type'>) =>
    openNotification({ ...options, type: 'error' }),
  info: (options: Omit<NotificationOpenOptions, 'type'>) =>
    openNotification({ ...options, type: 'info' }),
  clear: clearAllNotifications,
};
