import dayjs from 'dayjs';
import { createAgentUIStream, type ChatTransport, type UIMessage } from 'ai';
import type { Api } from '@pennyspring/api';

import {
  AGENT_CHUNK_TIMEOUT_MS,
  AGENT_RESPONSE_TOKEN_RESERVE,
  AGENT_TIMEOUT_MS,
} from '../core/constants';
import { createAgent } from '../core/createAgent';
import { addUsage, EMPTY_USAGE, toTokenUsage } from '../core/messages';
import { estimateTokens } from '../core/tokens';
import type { TokenUsage } from '../core/types';
import {
  getUiMessageText,
  trimUiMessagesByTokens,
} from '../core/uiMessages';
import { buildSystemPrompt } from '../projection/context';
import { getActiveAgentProvider } from '../providers/configStore';
import {
  rememberThreadModel,
  resolveThreadModel,
} from '../providers/modelSelectionStore';
import { loadProviderApiKey } from '../providers/secureKey';
import { createQueryRecordsTool } from '../tools/queryRecords';
import {
  AGENT_NOT_CONFIGURED_MESSAGE,
  AGENT_NO_MODEL_MESSAGE,
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

      if (trigger === 'submit-message') {
        const userMessage = messages[messages.length - 1];
        if (userMessage?.role === 'user') {
          await options.persistUserMessage(userMessage);
          const text = getUiMessageText(userMessage);
          if (text) {
            await options.ensureTitle(text);
          }
        }
      }

      const types = await options.api.type.getAll(options.booksId);
      const systemPrompt = buildSystemPrompt({
        bookName: options.bookName,
        today: dayjs().format('YYYY-MM-DD'),
        types,
      });
      const tokenBudget =
        model.contextWindow -
        estimateTokens(systemPrompt) -
        AGENT_RESPONSE_TOKEN_RESERVE;
      const tools = {
        queryRecords: createQueryRecordsTool({
          api: options.api,
          booksId: options.booksId,
          bookName: options.bookName,
        }),
      };

      return createAgentUIStream({
        agent: createAgent({
          provider,
          model,
          apiKey,
          systemPrompt,
          tools,
        }),
        uiMessages: trimUiMessagesByTokens(messages, tokenBudget),
        abortSignal,
        sendReasoning: false,
        sendSources: false,
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
    },

    async reconnectToStream() {
      return null;
    },
  };
}
