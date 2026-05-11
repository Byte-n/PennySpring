import React, { useEffect, useState } from 'react';
import { Portal } from '../Portal';
import { Toast } from './Toast';
import type { ToastShowOptions } from './types';

interface ToastItem {
  id: number;
  options: ToastShowOptions;
}

let items: readonly ToastItem[] = [];
let nextId = 0;
let listener: (() => void) | null = null;

function notify(): void {
  listener?.();
}

export function showToast(options: ToastShowOptions): void {
  const id = nextId;
  nextId += 1;
  items = [...items, { id, options }];
  notify();
}

export function clearAllToasts(): void {
  items = [];
  notify();
}

function removeToast(id: number): void {
  items = items.filter(item => item.id !== id);
  notify();
}

export function ToastPortal(): React.ReactElement {
  const [, setTick] = useState(0);

  useEffect(() => {
    listener = () => setTick(n => n + 1);
    return () => {
      listener = null;
    };
  }, []);

  return (
    <Portal>
      {items.map(item => (
        <Toast
          key={item.id}
          defaultOpen
          content={item.options.content}
          contentText={item.options.contentText}
          duration={item.options.duration}
          icon={item.options.icon}
          mask={item.options.mask}
          onCancel={() => {
            item.options.onCancel?.();
            removeToast(item.id);
          }}
          position={item.options.position}
          size={item.options.size}
          type={item.options.type}
        />
      ))}
    </Portal>
  );
}
