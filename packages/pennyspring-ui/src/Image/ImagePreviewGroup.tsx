import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { useControllableValue } from '../_hooks';
import { ImagePreview } from './ImagePreview';
import {
  ImagePreviewGroupContext,
  type RegisteredImage,
} from './context';
import type { ImagePreviewGroupProps } from './types';
import {
  clampIndex,
  isSameImageSource,
  normalizePreviewItems,
} from './utils';

interface RegisteredEntry extends RegisteredImage {
  id: string;
}

export function ImagePreviewGroup({
  children,
  defaultIndex = 0,
  defaultOpen = false,
  index,
  items,
  onCancel,
  onIndexChange,
  onOpenChange,
  open,
  styles,
}: ImagePreviewGroupProps): React.ReactElement {
  const [registered, setRegistered] = useState<RegisteredEntry[]>([]);
  const [resolvedOpen, setResolvedOpen] = useControllableValue(
    defaultOpen,
    open,
    onOpenChange,
  );
  const [resolvedIndex, setResolvedIndex] = useControllableValue(
    defaultIndex,
    index,
    onIndexChange,
  );

  const register = useCallback((id: string, data: RegisteredImage) => {
    setRegistered(current => {
      const existingIndex = current.findIndex(entry => entry.id === id);

      if (existingIndex === -1) {
        return [...current, { id, ...data }];
      }

      const existing = current[existingIndex];

      if (isSameImageSource(existing.src, data.src)) {
        return current;
      }

      const next = [...current];
      next[existingIndex] = { id, ...data };
      return next;
    });

    return () => {
      setRegistered(current => current.filter(entry => entry.id !== id));
    };
  }, []);

  const previewItems = useMemo(
    () =>
      items !== undefined
        ? normalizePreviewItems(items)
        : registered.map(entry => entry.src),
    [items, registered],
  );
  const fromItems = items !== undefined;

  const handlePreview = useCallback(
    (id: string, src: RegisteredImage['src']) => {
      let nextIndex = 0;

      if (fromItems) {
        const foundIndex = previewItems.findIndex(item =>
          isSameImageSource(item, src),
        );
        nextIndex = foundIndex < 0 ? 0 : foundIndex;
      } else {
        const foundIndex = registered.findIndex(entry => entry.id === id);
        nextIndex = foundIndex < 0 ? 0 : foundIndex;
      }

      setResolvedIndex(nextIndex);
      setResolvedOpen(true);
    },
    [
      fromItems,
      previewItems,
      registered,
      setResolvedIndex,
      setResolvedOpen,
    ],
  );

  const contextValue = useMemo(
    () => ({ onPreview: handlePreview, register }),
    [handlePreview, register],
  );
  const normalizedIndex = clampIndex(
    resolvedIndex ?? 0,
    previewItems.length,
  );

  useEffect(() => {
    if (previewItems.length === 0) {
      return;
    }

    if (normalizedIndex !== resolvedIndex) {
      setResolvedIndex(normalizedIndex);
    }
  }, [
    normalizedIndex,
    previewItems.length,
    resolvedIndex,
    setResolvedIndex,
  ]);

  return (
    <ImagePreviewGroupContext.Provider value={contextValue}>
      {children}
      <ImagePreview
        images={previewItems}
        index={normalizedIndex}
        onCancel={onCancel}
        onIndexChange={nextIndex => setResolvedIndex(nextIndex)}
        onOpenChange={nextOpen => setResolvedOpen(nextOpen)}
        open={resolvedOpen === true}
        styles={styles}
      />
    </ImagePreviewGroupContext.Provider>
  );
}
