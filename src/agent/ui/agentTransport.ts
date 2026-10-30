import dayjs from 'dayjs';
import {
  type ChatTransport,
  createAgentUIStream,
  type UIMessage,
  type UIMessageChunk,
} from 'ai';
import type { Api } from '@pennyspring/api';

import {
  AGENT_CHUNK_TIMEOUT_MS,
  AGENT_RESPONSE_TOKEN_RESERVE,
  AGENT_TIMEOUT_MS,
} from '../core/constants';
import { agentDebugLog } from '../core/debug';
import { createAgent } from '../core/createAgent';
import { addUsage, EMPTY_USAGE, toTokenUsage } from '../core/messages';
import { hasUiMessageImages, stripUiMessageFiles } from '../core/attachments';
import { estimateTokens } from '../core/tokens';
import type { TokenUsage } from '../core/types';
import { getUiMessageText, trimUiMessagesByTokens } from '../core/uiMessages';
import { buildSystemPrompt } from '../projection/context';
import { getActiveAgentProvider } from '../providers/configStore';
import {
  rememberThreadModel,
  resolveThreadModel,
} from '../providers/modelSelectionStore';
import { isMultimodalModel } from '../providers/models';
import { loadProviderApiKey } from '../providers/secureKey';
import {
  CREATE_RECORD_TOOL_NAME,
  createCreateRecordTool,
} from '../tools/createRecord';
import {
  createListAssetsTool,
  LIST_ASSETS_TOOL_NAME,
} from '../tools/listAssets';
import { createListTagsTool, LIST_TAGS_TOOL_NAME } from '../tools/listTags';
import { createListTypesTool, LIST_TYPES_TOOL_NAME } from '../tools/listTypes';
import {
  createQueryRecordsTool,
  QUERY_RECORDS_TOOL_NAME,
} from '../tools/queryRecords';
import {
  AGENT_MODEL_NO_IMAGE_MESSAGE,
  AGENT_NO_MODEL_MESSAGE,
  AGENT_NOT_CONFIGURED_MESSAGE,
  IMAGE_MESSAGE_TITLE,
} from './copy';

export interface AgentTransportOptions {
  api: Api;
  booksId: number;
  bookName: string;
  threadId: number;
  usageRef: { current: TokenUsage };
  persistUserMessage: (message: UIMessage) => Promise<void>;
  ensureTitle: (text: string) => Promise<void>;
  onRunStart?: () => void;
}

function describeStreamError(error: unknown): string {
  if (error instanceof Error && error.message.trim()) {
    return error.message;
  }
  return String(error);
}

function handleStreamError(error: unknown): string {
  // execute 内异常已由 createAgentTool 打印；字符串错误来自 execute 前的 SDK 校验。
  if (!(error instanceof Error)) {
    console.error('[agent:tool-call] 工具调用失败', error);
  }
  return describeStreamError(error);
}

function summarizeChunk(chunk: UIMessageChunk): Record<string, unknown> {
  const record = chunk as unknown as Record<string, unknown>;
  const summary: Record<string, unknown> = { type: chunk.type };
  if (typeof record.id === 'string') {
    summary.id = record.id;
  }
  if (typeof record.delta === 'string') {
    summary.len = record.delta.length;
    summary.preview = record.delta.slice(0, 16);
  }
  if (typeof record.toolName === 'string') {
    summary.toolName = record.toolName;
  }
  if (typeof record.toolCallId === 'string') {
    summary.toolCallId = record.toolCallId;
  }
  if (typeof record.errorText === 'string') {
    summary.errorText = record.errorText;
  }
  if (record.finishReason !== undefined) {
    summary.finishReason = record.finishReason;
  }
  return summary;
}

function debugUiMessageStream(
  stream: ReadableStream<UIMessageChunk>,
): ReadableStream<UIMessageChunk> {
  const reader = stream.getReader();
  return new ReadableStream<UIMessageChunk>({
    async pull(controller) {
      try {
        const { done, value } = await reader.read();
        if (done) {
          agentDebugLog('transport', 'stream-done');
          controller.close();
          return;
        }
        agentDebugLog('transport', value.type, summarizeChunk(value));
        controller.enqueue(value);
      } catch (error) {
        agentDebugLog('transport', 'stream-error', {
          message: error instanceof Error ? error.message : String(error),
        });
        controller.error(error);
      }
    },
    cancel(reason) {
      agentDebugLog('transport', 'stream-cancel');
      return reader.cancel(reason);
    },
  });
}

export function createAgentTransport(
  options: AgentTransportOptions,
): ChatTransport<UIMessage> {
  return {
    async sendMessages({ trigger, messages, abortSignal }) {
      options.onRunStart?.();
      options.usageRef.current = EMPTY_USAGE;

      const provider = getActiveAgentProvider();
      if (provider === null) {
        throw new Error(AGENT_NOT_CONFIGURED_MESSAGE);
      }

      const model = resolveThreadModel(provider, options.threadId);
      if (model === null) {
        throw new Error(AGENT_NO_MODEL_MESSAGE);
      }

      const apiKey = await loadProviderApiKey(provider.id);
      if (!apiKey) {
        throw new Error(AGENT_NOT_CONFIGURED_MESSAGE);
      }

      rememberThreadModel(options.threadId, provider.id, model.modelId);
      const supportsImages = isMultimodalModel(model);

      if (trigger === 'submit-message') {
        const userMessage = messages[messages.length - 1];
        if (userMessage?.role === 'user') {
          if (!supportsImages && hasUiMessageImages(userMessage)) {
            throw new Error(AGENT_MODEL_NO_IMAGE_MESSAGE);
          }
          await options.persistUserMessage(userMessage);
          const text = getUiMessageText(userMessage);
          const title =
            text ||
            (hasUiMessageImages(userMessage) ? IMAGE_MESSAGE_TITLE : '');
          if (title) {
            await options.ensureTitle(title);
          }
        }
      }

      const systemPrompt = buildSystemPrompt({
        bookName: options.bookName,
        today: dayjs().format('YYYY-MM-DD'),
      });
      const tokenBudget =
        model.contextWindow -
        estimateTokens(systemPrompt) -
        AGENT_RESPONSE_TOKEN_RESERVE;
      const requestMessages = supportsImages
        ? messages
        : stripUiMessageFiles(messages);
      const tools = {
        [QUERY_RECORDS_TOOL_NAME]: createQueryRecordsTool({
          api: options.api,
          booksId: options.booksId,
          bookName: options.bookName,
        }),
        [LIST_TYPES_TOOL_NAME]: createListTypesTool({
          api: options.api,
          booksId: options.booksId,
        }),
        [LIST_TAGS_TOOL_NAME]: createListTagsTool({
          api: options.api,
          booksId: options.booksId,
        }),
        [LIST_ASSETS_TOOL_NAME]: createListAssetsTool({
          api: options.api,
          booksId: options.booksId,
        }),
        [CREATE_RECORD_TOOL_NAME]: createCreateRecordTool({
          api: options.api,
          booksId: options.booksId,
        }),
      };
      const toolApproval = {
        [CREATE_RECORD_TOOL_NAME]: {
          type: 'user-approval' as const,
          reason: '将写入账本，请确认',
        },
      };

      agentDebugLog('transport', 'request', {
        threadId: options.threadId,
        provider: provider.descriptorId,
        model: model.modelId,
        reasoningEffort: model.reasoningEffort,
        multimodal: supportsImages,
        messages: requestMessages.length,
        budget: tokenBudget,
      });

      const stream = await createAgentUIStream({
        agent: createAgent({
          provider,
          model,
          apiKey,
          systemPrompt,
          tools,
          toolApproval,
        }),
        uiMessages: trimUiMessagesByTokens(requestMessages, tokenBudget),
        abortSignal,
        sendReasoning: true,
        sendSources: false,
        onError: handleStreamError,
        timeout: {
          totalMs: AGENT_TIMEOUT_MS,
          chunkMs: AGENT_CHUNK_TIMEOUT_MS,
        },
        onStepEnd: step => {
          options.usageRef.current = addUsage(
            options.usageRef.current,
            toTokenUsage(step.usage),
          );
        },
      });

      return debugUiMessageStream(stream);
    },

    async reconnectToStream() {
      return null;
    },
  };
}
