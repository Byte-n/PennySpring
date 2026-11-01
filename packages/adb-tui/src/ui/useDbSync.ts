import { useCallback, useEffect, useRef, useState } from 'react';
import type { DbSyncThread } from '../features/db-sync-thread';
import type { DbWatchConfig } from '../features';
import type { SyncSummaryEntry } from './sync-title';

interface ThreadFactoryOptions {
  onPull: () => void;
  onError: (error: unknown) => void;
}

type ThreadFactory = (
  config: DbWatchConfig,
  options: ThreadFactoryOptions,
) => DbSyncThread;

interface UseDbSyncOptions {
  adbPath: string;
  createThread: ThreadFactory;
}

export interface DbSyncManager {
  summary: SyncSummaryEntry[];
  errors: Record<string, unknown>;
  isSyncing(serial: string): boolean;
  start(serial: string): void;
  stop(serial: string): void;
}

interface SyncEntry {
  thread: DbSyncThread;
  lastAtMs: number | undefined;
}

export function useDbSync({
  adbPath,
  createThread,
}: UseDbSyncOptions): DbSyncManager {
  const entriesRef = useRef(new Map<string, SyncEntry>());
  const [summary, setSummary] = useState<SyncSummaryEntry[]>([]);
  const [errors, setErrors] = useState<Record<string, unknown>>({});

  const refreshSummary = useCallback(() => {
    setSummary(
      [...entriesRef.current.entries()].map(([serial, entry]) => ({
        serial,
        lastAtMs: entry.lastAtMs,
      })),
    );
  }, []);

  const start = useCallback(
    (serial: string) => {
      if (entriesRef.current.has(serial)) {
        return;
      }
      const thread = createThread(
        { serial, adbPath },
        {
          onPull: () => {
            const entry = entriesRef.current.get(serial);
            if (entry) {
              entry.lastAtMs = Date.now();
              refreshSummary();
            }
          },
          onError: error => setErrors(prev => ({ ...prev, [serial]: error })),
        },
      );
      entriesRef.current.set(serial, { thread, lastAtMs: undefined });
      thread.start();
      setErrors(prev => {
        if (!(serial in prev)) {
          return prev;
        }
        const next = { ...prev };
        delete next[serial];
        return next;
      });
      refreshSummary();
    },
    [adbPath, createThread, refreshSummary],
  );

  const stop = useCallback(
    (serial: string) => {
      const entry = entriesRef.current.get(serial);
      if (!entry) {
        return;
      }
      entry.thread.stop();
      entriesRef.current.delete(serial);
      refreshSummary();
    },
    [refreshSummary],
  );

  useEffect(() => {
    const entries = entriesRef.current;
    return () => {
      entries.forEach(entry => entry.thread.stop());
      entries.clear();
    };
  }, []);

  const isSyncing = useCallback(
    (serial: string) => entriesRef.current.has(serial),
    [],
  );

  return { summary, errors, isSyncing, start, stop };
}
