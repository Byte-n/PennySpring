import React from 'react';
import { PortalContext } from '../Portal/Portal';

interface OverlayOptions<TOptions extends object> {
  render: (
    options: TOptions,
    params: {
      isOpen: boolean;
      onExited: () => void;
    },
  ) => React.ReactNode;
}

interface OverlayEmitter<TOptions extends object> {
  show: (options: TOptions) => number;
  hide: (key: number) => void;
  clear: () => void;
}

interface OverlayEntry<TOptions extends object> {
  options: TOptions;
  portalKey: number;
  mounted: boolean;
}

export function useOverlayEmitter<TOptions extends object>({
  render,
}: OverlayOptions<TOptions>): OverlayEmitter<TOptions> {
  const portalContext = React.useContext(PortalContext);
  const entriesRef = React.useRef<Map<number, OverlayEntry<TOptions>>>(
    new Map(),
  );
  const nextLocalKeyRef = React.useRef(0);

  const show = React.useCallback(
    (options: TOptions): number => {
      if (portalContext === null) {
        throw new Error('Overlay emitter requires a PortalProvider.');
      }

      const key = nextLocalKeyRef.current;
      nextLocalKeyRef.current += 1;

      const onExited = () => {
        const current = entriesRef.current.get(key);
        if (current !== undefined && current.mounted) {
          portalContext.unmount(current.portalKey);
          entriesRef.current.delete(key);
        }
      };

      const portalKey = portalContext.mount(
        render(options, {
          isOpen: true,
          onExited,
        }),
      );

      entriesRef.current.set(key, {
        options,
        portalKey,
        mounted: true,
      });

      return key;
    },
    [portalContext, render],
  );

  const hide = React.useCallback(
    (key: number) => {
      if (portalContext === null) {
        throw new Error('Overlay emitter requires a PortalProvider.');
      }

      const entry = entriesRef.current.get(key);
      if (entry === undefined || entry.mounted === false) {
        return;
      }

      portalContext.update(
        entry.portalKey,
        render(entry.options, {
          isOpen: false,
          onExited: () => {
            const latestEntry = entriesRef.current.get(key);
            if (latestEntry !== undefined && latestEntry.mounted) {
              portalContext.unmount(latestEntry.portalKey);
              entriesRef.current.delete(key);
            }
          },
        }),
      );
    },
    [portalContext, render],
  );

  const clear = React.useCallback(() => {
    const keys = Array.from(entriesRef.current.keys());
    keys.forEach(key => {
      const entry = entriesRef.current.get(key);
      if (entry !== undefined && entry.mounted) {
        portalContext?.update(
          entry.portalKey,
          render(entry.options, {
            isOpen: false,
            onExited: () => {
              const latestEntry = entriesRef.current.get(key);
              if (latestEntry !== undefined && latestEntry.mounted) {
                portalContext?.unmount(latestEntry.portalKey);
                entriesRef.current.delete(key);
              }
            },
          }),
        );
      }
    });
  }, [portalContext, render]);

  React.useEffect(() => {
    return () => {
      entriesRef.current.forEach(entry => {
        if (entry.mounted) {
          portalContext?.unmount(entry.portalKey);
        }
      });
      entriesRef.current.clear();
    };
  }, [portalContext]);

  return {
    show,
    hide,
    clear,
  };
}
