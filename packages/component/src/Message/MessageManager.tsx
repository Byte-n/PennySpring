import React, { useEffect, useState } from 'react';
import { Message } from './Message';
import type { MessageShowOptions } from './types';

interface MessageItem {
  id: number;
  options: MessageShowOptions;
  timerId: ReturnType<typeof setTimeout> | null;
}

let items: readonly MessageItem[] = [];
let nextId = 0;
let listener: (() => void) | null = null;

function notify(): void {
  listener?.();
}

export function showMessage(options: MessageShowOptions): void {
  const id = nextId;
  nextId += 1;

  const item: MessageItem = { id, options, timerId: null };

  if (options.duration !== 0) {
    const duration = options.duration ?? 3000;
    item.timerId = setTimeout(() => {
      options.onCancel?.();
      items = items.filter(i => i.id !== id);
      notify();
    }, duration);
  }

  items = [...items, item];
  notify();
}

export function clearAllMessages(): void {
  for (const item of items) {
    if (item.timerId !== null) {
      clearTimeout(item.timerId);
    }
  }
  items = [];
  notify();
}

function removeMessage(id: number): void {
  const item = items.find(i => i.id === id);
  if (item?.timerId !== null) {
    clearTimeout(item.timerId!);
  }
  items = items.filter(i => i.id !== id);
  notify();
}

export function MessagePortal(): React.ReactElement {
  const [, setTick] = useState(0);

  useEffect(() => {
    listener = () => setTick(n => n + 1);
    return () => {
      listener = null;
      // Cleanup all timers on unmount
      for (const item of items) {
        if (item.timerId !== null) {
          clearTimeout(item.timerId);
        }
      }
    };
  }, []);

  return (
    <>
      {items.map(item => (
        <Message
          key={item.id}
          defaultOpen
          closeable={item.options.closeable}
          content={item.options.content}
          contentText={item.options.contentText}
          duration={0} // Manager handles duration
          icon={item.options.icon}
          onCancel={() => {
            item.options.onCancel?.();
            removeMessage(item.id);
          }}
          size={item.options.size}
          type={item.options.type}
        />
      ))}
    </>
  );
}
