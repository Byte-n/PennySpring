import React, { useEffect, useState } from 'react';
import { Notification } from './Notification';
import type { NotificationOpenOptions } from './types';

interface NotificationItem {
  id: number;
  options: NotificationOpenOptions;
  timerId: ReturnType<typeof setTimeout> | null;
}

let items: readonly NotificationItem[] = [];
let nextId = 0;
let listener: (() => void) | null = null;
const DEFAULT_MAX_COUNT = 5;

function notify(): void {
  listener?.();
}

export function openNotification(options: NotificationOpenOptions): void {
  const id = nextId;
  nextId += 1;

  const item: NotificationItem = { id, options, timerId: null };

  // Enforce maxCount
  let currentItems = [...items];
  if (currentItems.length >= DEFAULT_MAX_COUNT) {
    const removed = currentItems.splice(0, currentItems.length - DEFAULT_MAX_COUNT + 1);
    for (const r of removed) {
      if (r.timerId !== null) {
        clearTimeout(r.timerId);
      }
    }
  }

  if (options.duration !== 0) {
    const duration = options.duration ?? 4500;
    item.timerId = setTimeout(() => {
      options.onCancel?.();
      items = items.filter(i => i.id !== id);
      notify();
    }, duration);
  }

  items = [...currentItems, item];
  notify();
}

export function clearAllNotifications(): void {
  for (const item of items) {
    if (item.timerId !== null) {
      clearTimeout(item.timerId);
    }
  }
  items = [];
  notify();
}

/** @internal Reset module-level state for testing isolation. */
export function _resetNotificationState(): void {
  for (const item of items) {
    if (item.timerId !== null) {
      clearTimeout(item.timerId);
    }
  }
  items = [];
  nextId = 0;
  listener = null;
}

function removeNotification(id: number): void {
  const item = items.find(i => i.id === id);
  if (item?.timerId !== null) {
    clearTimeout(item.timerId!);
  }
  items = items.filter(i => i.id !== id);
  notify();
}

export function NotificationPortal(): React.ReactElement {
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
        <Notification
          key={item.id}
          defaultOpen
          closeable={item.options.closeable}
          content={item.options.content}
          contentText={item.options.contentText}
          description={item.options.description}
          descriptionText={item.options.descriptionText}
          duration={0} // Manager handles duration
          icon={item.options.icon}
          onCancel={() => {
            item.options.onCancel?.();
            removeNotification(item.id);
          }}
          onPress={item.options.onPress}
          size={item.options.size}
          title={item.options.title}
          titleText={item.options.titleText}
          type={item.options.type}
        />
      ))}
    </>
  );
}
