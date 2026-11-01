import { execFile } from 'node:child_process';
import { AdbError } from './errors';

export interface AdbResult {
  stdout: string;
  stderr: string;
  code: number;
}

export type AdbExecutor = (
  adbPath: string,
  args: readonly string[],
) => Promise<AdbResult>;

const TIMEOUT_MS = 15000;

const defaultExecutor: AdbExecutor = (adbPath, args) =>
  new Promise(resolve => {
    execFile(
      adbPath,
      [...args],
      { encoding: 'utf8', timeout: TIMEOUT_MS, maxBuffer: 1024 * 1024 * 16 },
      (error, stdout, stderr) => {
        const code =
          error && typeof error.code === 'number' ? error.code : error ? 1 : 0;
        resolve({ stdout: stdout.trim(), stderr: stderr.trim(), code });
      },
    );
  });

export interface AdbRunner {
  run(args: readonly string[]): Promise<AdbResult>;
}

export function createAdbRunner(
  adbPath: string,
  executor: AdbExecutor = defaultExecutor,
): AdbRunner {
  return {
    async run(args) {
      try {
        return await executor(adbPath, args);
      } catch (cause) {
        throw new AdbError('command-failed', { cause });
      }
    },
  };
}
