export { Message } from './Message';
export { MessagePortal } from './MessageManager';
export type {
  MessageProps,
  MessageShowOptions,
  MessageSize,
  MessageStaticMethods,
  MessageStyles,
  MessageType,
} from './types';

import { showMessage, clearAllMessages } from './MessageManager';
import type { MessageShowOptions } from './types';

export { showMessage, clearAllMessages };

export const message = {
  show: showMessage,
  success: (options: Omit<MessageShowOptions, 'type'>) => showMessage({ ...options, type: 'success' }),
  warning: (options: Omit<MessageShowOptions, 'type'>) => showMessage({ ...options, type: 'warning' }),
  error: (options: Omit<MessageShowOptions, 'type'>) => showMessage({ ...options, type: 'error' }),
  info: (options: Omit<MessageShowOptions, 'type'>) => showMessage({ ...options, type: 'info' }),
  clear: clearAllMessages,
};
