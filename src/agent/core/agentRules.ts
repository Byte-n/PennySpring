import type { AgentRulesRow, Api } from '@pennyspring/api';

import { agentDebugLog } from './debug';

/**
 * 读取账本规则。旧版服务器没有 agentRules 路由时回退到内置默认规则，
 * 不阻塞本轮对话或草稿生成。
 */
export async function loadBookAgentRules(
  api: Api,
  booksId: number,
): Promise<AgentRulesRow | null> {
  try {
    return await api.agentRules.get(booksId);
  } catch (error: unknown) {
    agentDebugLog('agentRules', 'load-failed', {
      booksId,
      message: error instanceof Error ? error.message : String(error),
    });
    return null;
  }
}
