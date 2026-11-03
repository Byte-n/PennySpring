import type { Api } from '@pennyspring/api';
import { z } from 'zod';

import { AGENT_BATCH_MAX_COUNT } from '../core/constants';
import { createAgentTool } from './createAgentTool';

export const DELETE_RECORDS_TOOL_NAME = 'deleteRecords';

export const DELETE_RECORDS_TOOL_DESCRIPTION =
  '批量删除当前账本已有的记账记录，整批一次确认、同事务删除，任何一条失败都不会删除。recordIds 必须来自 queryRecords 明细里的 id，且不能重复。删除会回滚资产余额；删除支出或退款/报销记录时，会重新计算关联记录的金额。调用后会先请求用户确认，只有用户确认且工具返回成功后才算删除。';

export const deleteRecordsInputSchema = z.object({
  recordIds: z
    .array(z.number().int().positive())
    .min(1, '至少删除一条记录')
    .max(AGENT_BATCH_MAX_COUNT, `一次最多删除 ${AGENT_BATCH_MAX_COUNT} 条记录`)
    .refine(
      recordIds => new Set(recordIds).size === recordIds.length,
      'recordIds 不能包含重复的记录 id',
    )
    .describe('要删除的记录 id 列表，必须来自 queryRecords 的明细。'),
});

export type DeleteRecordsToolInput = z.infer<typeof deleteRecordsInputSchema>;

export interface DeleteRecordsToolDeps {
  api: Api;
  booksId: number;
  /** 批量删除成功后通知应用层失效记录数据。 */
  onRecordsChanged?: () => void;
}

export function createDeleteRecordsTool(deps: DeleteRecordsToolDeps) {
  return createAgentTool({
    name: DELETE_RECORDS_TOOL_NAME,
    description: DELETE_RECORDS_TOOL_DESCRIPTION,
    inputSchema: deleteRecordsInputSchema,
    execute: async input => {
      if (new Set(input.recordIds).size !== input.recordIds.length) {
        throw new Error('recordIds 不能包含重复的记录 id');
      }
      await Promise.all(
        input.recordIds.map(recordId =>
          deps.api.record.getDetailById(recordId, deps.booksId),
        ),
      );
      await deps.api.record.deleteMany(input.recordIds, deps.booksId);
      deps.onRecordsChanged?.();
      return {
        ok: true,
        count: input.recordIds.length,
        recordIds: input.recordIds,
      };
    },
  });
}
