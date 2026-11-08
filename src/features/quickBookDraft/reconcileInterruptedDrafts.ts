import { QUICK_BOOK_DRAFT_STATUS } from '@pennyspring/api';

import { agentDebugLog } from '../../agent/core/debug';
import { bumpDraftVersion } from '../../stores/draftVersionStore';
import { quickBookDraftCache } from './draftCacheStorage';
import { useQuickBookDraftProgressStore } from './draftProgress';
import {
  getQuickBookActiveDraftIds,
  getQuickBookPendingDraftJobs,
} from './native';
import { materializeInterruptedDraftJobs } from './pendingDraftJobs';

export const INTERRUPTED_DRAFT_ERROR = '生成被中断，请重试';

function getSessionDraftIds(): string[] {
  return Object.keys(useQuickBookDraftProgressStore.getState().progressById);
}

async function getPendingJobs(): Promise<unknown[] | null> {
  try {
    return await getQuickBookPendingDraftJobs();
  } catch (error: unknown) {
    agentDebugLog('quickBookDraft', 'pending-jobs-unavailable', {
      message: error instanceof Error ? error.message : String(error),
    });
    return null;
  }
}

interface ActiveDraftStatus {
  ids: string[];
  isAvailable: boolean;
}

async function getActiveDraftStatus(): Promise<ActiveDraftStatus> {
  try {
    return { ids: await getQuickBookActiveDraftIds(), isAvailable: true };
  } catch (error: unknown) {
    // 原生状态不可用时仍可校准：占位草稿写入前一定会先登记进程内进度，
    // 因此不在进度表里的 generating 草稿不可能是当前进程在跑的任务。
    agentDebugLog('quickBookDraft', 'active-drafts-unavailable', {
      message: error instanceof Error ? error.message : String(error),
    });
    return { ids: [], isAvailable: false };
  }
}

async function reconcileInterruptedDrafts(): Promise<number> {
  // 先读任务日志、再查活跃集合：日志只在登记并发槽位后写入，
  // 因此日志里的任务若仍存活，必然出现在随后的活跃集合里。
  const pendingJobs = await getPendingJobs();
  const [activeStatus, generatingDrafts] = await Promise.all([
    getActiveDraftStatus(),
    quickBookDraftCache.list({
      statuses: [QUICK_BOOK_DRAFT_STATUS.generating],
    }),
  ]);
  const sessionDraftIds = getSessionDraftIds();
  const liveDraftIds = new Set([...activeStatus.ids, ...sessionDraftIds]);
  const materializedCount =
    pendingJobs !== null && activeStatus.isAvailable
      ? await materializeInterruptedDraftJobs(
          pendingJobs,
          INTERRUPTED_DRAFT_ERROR,
          { isDraftLive: draftId => liveDraftIds.has(draftId) },
        )
      : 0;
  let interruptedCount = 0;
  for (const draft of generatingDrafts) {
    if (liveDraftIds.has(draft.id)) {
      continue;
    }
    try {
      await quickBookDraftCache.markFailed(draft.id, INTERRUPTED_DRAFT_ERROR);
      interruptedCount += 1;
    } catch (error: unknown) {
      // 草稿可能在查询后已被其他路径推进；只跳过这一条。
      agentDebugLog('quickBookDraft', 'reconcile-skip', {
        draftId: draft.id,
        message: error instanceof Error ? error.message : String(error),
      });
    }
  }
  if (interruptedCount + materializedCount > 0) {
    bumpDraftVersion();
  }
  return interruptedCount + materializedCount;
}

let inFlight: Promise<number> | null = null;

/**
 * 进程重启后校准仍为 generating 的草稿：
 * 既没有原生任务，也不在当前进程的进行中集合里，说明生成已随进程中断。
 * 标记失败并交给用户手动重试。
 */
export function reconcileInterruptedQuickBookDrafts(): Promise<number> {
  if (inFlight !== null) {
    return inFlight;
  }
  const task = reconcileInterruptedDrafts().finally(() => {
    inFlight = null;
  });
  inFlight = task;
  return task;
}
