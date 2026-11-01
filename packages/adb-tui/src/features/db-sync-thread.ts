import { spawn } from 'node:child_process';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  DEFAULT_INTERVAL_MS,
  DEFAULT_LOCAL_DB,
  DEFAULT_PACKAGE,
  DEFAULT_REMOTE_DB,
  type DbWatchConfig,
} from './db-watch';

interface SyncProcess {
  stdout: {
    on(event: 'data', listener: (chunk: Buffer | string) => void): void;
  };
  stderr: {
    on(event: 'data', listener: (chunk: Buffer | string) => void): void;
  };
  on(event: 'error', listener: (error: unknown) => void): void;
  on(event: 'close', listener: (code: number | null) => void): void;
  kill(signal?: NodeJS.Signals): boolean;
}

interface DbSyncThreadOptions {
  onPull: () => void;
  onError: (error: unknown) => void;
  spawnProcess?: (command: string, args: readonly string[]) => SyncProcess;
}

export interface DbSyncThread {
  start(): void;
  stop(): void;
}

const SCRIPT_PATH = join(dirname(fileURLToPath(import.meta.url)), 'sync-db.sh');

export function createDbSyncThread(
  config: DbWatchConfig,
  options: DbSyncThreadOptions,
): DbSyncThread {
  let child: SyncProcess | undefined;

  function buildArgs(): readonly string[] {
    return [
      SCRIPT_PATH,
      config.adbPath,
      config.serial,
      config.packageName ?? DEFAULT_PACKAGE,
      config.remoteDb ?? DEFAULT_REMOTE_DB,
      config.localDb ?? DEFAULT_LOCAL_DB,
      String(Math.max(1, Math.round(DEFAULT_INTERVAL_MS / 1000))),
    ];
  }

  return {
    start() {
      if (child) {
        return;
      }
      const args = buildArgs();
      child = (options.spawnProcess ?? defaultSpawn)('bash', args);
      let stderr = '';
      child.stdout.on('data', chunk => {
        for (const line of chunk.toString().split('\n')) {
          if (line.trim() === 'PULL') {
            options.onPull();
          }
        }
      });
      child.stderr.on('data', chunk => {
        stderr += chunk.toString();
      });
      child.on('error', options.onError);
      child.on('close', code => {
        if (code !== null && code !== 0) {
          options.onError(
            new Error(stderr.trim() || `同步脚本退出，code ${code}`),
          );
        }
      });
    },
    stop() {
      if (!child) {
        return;
      }
      child.kill();
      child = undefined;
    },
  };
}

function defaultSpawn(command: string, args: readonly string[]): SyncProcess {
  return spawn(command, [...args], { stdio: ['ignore', 'pipe', 'pipe'] });
}
