import {
  tool,
  type FlexibleSchema,
  type InferSchema,
  type Tool,
  type ToolExecutionOptions,
} from 'ai';

import { agentDebugLog } from '../core/debug';

export interface AgentToolConfig<SCHEMA extends FlexibleSchema, OUTPUT> {
  name: string;
  description: string;
  inputSchema: SCHEMA;
  execute: (input: InferSchema<SCHEMA>) => Promise<OUTPUT>;
}

function isAbortError(error: unknown): boolean {
  return error instanceof Error && error.name === 'AbortError';
}

function errorMessage(error: unknown): string {
  if (error instanceof Error && error.message.trim()) {
    return error.message;
  }
  return String(error);
}

export function createAgentTool<SCHEMA extends FlexibleSchema, OUTPUT>(
  config: AgentToolConfig<SCHEMA, OUTPUT>,
): Tool<InferSchema<SCHEMA>, OUTPUT> {
  // Tool 的 NeverOptional<OUTPUT, …> 在泛型 OUTPUT 下无法被求值，
  // 结构等价但只能断言。
  return tool({
    description: config.description,
    inputSchema: config.inputSchema as FlexibleSchema<InferSchema<SCHEMA>>,
    execute: async (
      input: InferSchema<SCHEMA>,
      options: ToolExecutionOptions<unknown>,
    ) => {
      const startedAt = Date.now();
      agentDebugLog('tool', 'start', { name: config.name });
      try {
        const result = await config.execute(input);
        agentDebugLog('tool', 'finish', {
          name: config.name,
          ms: Date.now() - startedAt,
        });
        return result;
      } catch (error) {
        if (options.abortSignal?.aborted || isAbortError(error)) {
          throw error;
        }
        agentDebugLog('tool', 'error', {
          name: config.name,
          ms: Date.now() - startedAt,
          message: errorMessage(error),
        });
        console.error(`[agent:${config.name}] 工具执行失败`, error);
        throw new Error(`工具 ${config.name} 执行失败：${errorMessage(error)}`);
      }
    },
  } as unknown as Tool<InferSchema<SCHEMA>, OUTPUT>);
}
