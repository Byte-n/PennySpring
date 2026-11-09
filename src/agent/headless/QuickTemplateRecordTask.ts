import { reportQuickTemplateRecordOutcome } from '../../features/quickTemplateWidget/native';
import {
  parseQuickTemplateRecordTaskData,
  type QuickTemplateRecordTaskInput,
} from '../../features/quickTemplateWidget/taskData';
import { runQuickTemplateRecord } from './runQuickTemplateRecord';

export const QUICK_TEMPLATE_RECORD_TASK_NAME = 'QuickTemplateRecordTask';

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function readRequestId(data: unknown): string {
  if (!isRecord(data)) {
    return '';
  }
  const value = data.requestId;
  return typeof value === 'string' ? value.trim() : '';
}

function getErrorMessage(error: unknown): string {
  if (error instanceof Error && error.message.trim() !== '') {
    return error.message;
  }
  return '记账失败，请重试';
}

/** Android HeadlessJsTaskService 通过 AppRegistry 调用。 */
export async function QuickTemplateRecordTask(data: unknown): Promise<void> {
  const requestId = readRequestId(data);
  let input: QuickTemplateRecordTaskInput;
  try {
    input = parseQuickTemplateRecordTaskData(data);
  } catch (error: unknown) {
    if (requestId !== '') {
      await reportQuickTemplateRecordOutcome({
        requestId,
        status: 'failed',
        message: getErrorMessage(error),
      });
      return;
    }
    throw error;
  }

  try {
    const result = await runQuickTemplateRecord(input);
    await reportQuickTemplateRecordOutcome({
      requestId: input.requestId,
      status: 'success',
      templateName: result.templateName,
      amountCents: result.amountCents,
    });
  } catch (error: unknown) {
    await reportQuickTemplateRecordOutcome({
      requestId: input.requestId,
      status: 'failed',
      message: getErrorMessage(error),
    });
  }
}
