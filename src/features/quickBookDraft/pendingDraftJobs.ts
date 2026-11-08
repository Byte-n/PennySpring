import { agentDebugLog } from '../../agent/core/debug';
import { quickBookDraftCache } from './draftCacheStorage';
import { ackQuickBookDraftJob } from './native';
import { parseQuickBookDraftTaskData } from './taskData';

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

function readDraftId(value: unknown): string {
  return isRecord(value) && typeof value.draftId === 'string'
    ? value.draftId.trim()
    : '';
}

async function ackQuietly(draftId: string): Promise<void> {
  try {
    await ackQuickBookDraftJob(draftId);
  } catch (error: unknown) {
    agentDebugLog('quickBookDraft', 'pending-job-ack-failed', {
      draftId,
      message: getErrorMessage(error),
    });
  }
}

export interface MaterializeInterruptedDraftJobsOptions {
  /** 仍在原生任务或当前进程进度中的草稿，不能补建失败草稿。 */
  isDraftLive?: (draftId: string) => boolean;
}

/**
 * 消费原生任务日志：占位草稿已存在则只删日志；
 * 不存在说明任务在写入草稿前就被杀，补建一条 failed 草稿供用户重试。
 * 调用方必须先取日志、再查活跃任务，保证日志里的任务已在登记表中。
 */
export async function materializeInterruptedDraftJobs(
  jobs: readonly unknown[],
  errorText: string,
  options: MaterializeInterruptedDraftJobsOptions = {},
): Promise<number> {
  const isDraftLive = options.isDraftLive ?? (() => false);
  let createdCount = 0;
  for (const job of jobs) {
    const draftId = readDraftId(job);
    if (draftId === '' || isDraftLive(draftId)) {
      continue;
    }
    let input: ReturnType<typeof parseQuickBookDraftTaskData>;
    try {
      input = parseQuickBookDraftTaskData(job);
    } catch (error: unknown) {
      agentDebugLog('quickBookDraft', 'pending-job-invalid', {
        draftId,
        message: getErrorMessage(error),
      });
      await ackQuietly(draftId);
      continue;
    }

    try {
      await quickBookDraftCache.getById(draftId);
      await ackQuietly(draftId);
      continue;
    } catch {
      // 草稿尚未写入，继续补建。
    }

    try {
      await quickBookDraftCache.createPlaceholder({
        id: input.draftId,
        target: input.target,
        imagePath: input.imagePath,
        ...(input.source === undefined ? {} : { source: input.source }),
        ...(input.preset === undefined ? {} : { preset: input.preset }),
      });
      await quickBookDraftCache.markFailed(draftId, errorText);
      await ackQuietly(draftId);
      createdCount += 1;
    } catch (error: unknown) {
      agentDebugLog('quickBookDraft', 'pending-job-materialize-failed', {
        draftId,
        message: getErrorMessage(error),
      });
      // 写入失败时保留日志，下次启动继续尝试。
    }
  }
  return createdCount;
}
