import React from 'react';
import { View } from 'react-native';
import { createUseSheetStyle } from '@pennyspring/theme';
import type { PortalProps, PortalProviderProps } from './types';

interface PortalEntry {
  key: number;
  children?: React.ReactNode;
}

interface PortalContextValue {
  mount: (children?: React.ReactNode) => number;
  update: (key: number, children?: React.ReactNode) => void;
  unmount: (key: number) => void;
}

const PortalContext = React.createContext<PortalContextValue | null>(null);

export { PortalContext };
export type { PortalContextValue };

const useStyles = createUseSheetStyle(() => ({
  overlay: {
    bottom: 0,
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
  },
}));

export function PortalProvider({ children }: PortalProviderProps) {
  const nextKeyRef = React.useRef(0);
  const [entries, setEntries] = React.useState<readonly PortalEntry[]>([]);
  const styles = useStyles();

  const mount = React.useCallback((portalChildren?: React.ReactNode) => {
    const key = nextKeyRef.current;
    nextKeyRef.current += 1;

    setEntries(currentEntries => [
      ...currentEntries,
      {
        key,
        children: portalChildren,
      },
    ]);

    return key;
  }, []);

  const update = React.useCallback(
    (key: number, portalChildren?: React.ReactNode) => {
      setEntries(currentEntries =>
        currentEntries.map(entry =>
          entry.key === key
            ? {
                ...entry,
                children: portalChildren,
              }
            : entry,
        ),
      );
    },
    [],
  );

  const unmount = React.useCallback((key: number) => {
    setEntries(currentEntries =>
      currentEntries.filter(entry => entry.key !== key),
    );
  }, []);

  const contextValue = React.useMemo(
    () => ({
      mount,
      update,
      unmount,
    }),
    [mount, update, unmount],
  );

  return (
    <PortalContext.Provider value={contextValue}>
      {children}
      <View pointerEvents="box-none" style={styles.overlay}>
        {entries.map(entry => (
          <View key={entry.key} pointerEvents="box-none" style={styles.overlay}>
            {entry.children}
          </View>
        ))}
      </View>
    </PortalContext.Provider>
  );
}

export function Portal({ children }: PortalProps) {
  const context = React.useContext(PortalContext);
  const keyRef = React.useRef<number | null>(null);

  if (context === null) {
    throw new Error('Portal must be rendered inside a PortalProvider.');
  }

  React.useLayoutEffect(() => {
    keyRef.current = context.mount(children);

    return () => {
      if (keyRef.current !== null) {
        context.unmount(keyRef.current);
      }
    };
  }, [context]);

  React.useLayoutEffect(() => {
    if (keyRef.current !== null) {
      context.update(keyRef.current, children);
    }
  }, [children, context]);

  return null;
}
