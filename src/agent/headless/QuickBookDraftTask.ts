import { parseQuickBookDraftTaskData } from '../../features/quickBookDraft/taskData';
import { agentDebugLog } from '../core/debug';
import {
  runQuickBookDraft,
  type RunQuickBookDraftInput,
} from './runQuickBookDraft';

export const QUICK_BOOK_DRAFT_TASK_NAME = 'QuickBookDraftTask';

/** Android HeadlessJsTaskService 通过 AppRegistry.startHeadlessTask 调用。 */
export async function QuickBookDraftTask(data: unknown): Promise<void> {
  agentDebugLog('quickBookDraft', 'task-received');
  let input: RunQuickBookDraftInput;
  try {
    input = parseQuickBookDraftTaskData(data);
  } catch (error) {
    agentDebugLog('quickBookDraft', 'parse-error', {
      message: error instanceof Error ? error.message : String(error),
    });
    return;
  }
  try {
    await runQuickBookDraft({
      ...input,
      reportOutcome: true,
    });
  } catch (error) {
    // RN 只在任务 Promise resolve 时回调 notifyTaskFinished；
    // 失败结果已由 reportDraftOutcome 回报，这里不再向上抛，避免服务悬挂到超时。
    agentDebugLog('quickBookDraft', 'task-error', {
      message: error instanceof Error ? error.message : String(error),
    });
  }
}
