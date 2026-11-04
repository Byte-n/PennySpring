import dayjs from 'dayjs';
import {
  localApi,
  QUICK_BOOK_DRAFT_SOURCE,
  type Api,
  type QuickBookDraftPreset,
} from '@pennyspring/api';
import type { ModelMessage } from 'ai';
import { FileSystem } from 'react-native-file-access';

import { resolveQuickBookModel } from '../../features/quickBook/validation';
import { AGENT_TIMEOUT_MS } from '../core/constants';
import { createAgent } from '../core/createAgent';
import { agentDebugLog } from '../core/debug';
import {
  buildQuickBookDraftSystemPrompt,
  buildQuickBookDraftUserMessage,
} from '../projection/quickBookDraftContext';
import { createQuickBookDraftTools } from '../tools/saveRecordDrafts';

/**
 * 原生 HeadlessJsTaskConfig.timeout 使用的总超时；必须大于 Agent 总超时。
 * P3 原生启动任务时传入该上限。
 */
export const QUICK_BOOK_DRAFT_TASK_TIMEOUT_MS = 180_000;

const DEFAULT_IMAGE_MEDIA_TYPE = 'image/jpeg';
const DEFAULT_IMAGE_EXTENSION = 'jpg';
const NO_DRAFT_ERROR = '未能从截图生成草稿';
const GENERATION_FAILED_ERROR = '生成草稿失败，请重试';

export interface RunQuickBookDraftInput {
  draftId: string;
  imagePath: string;
  booksId: number;
  preset?: { assetId: number; typeId: number };
}

interface ImageContent {
  base64: string;
  mediaType: string;
  extension: string;
}

interface ImageFormat {
  mediaType: string;
  extension: string;
}

function getErrorMessage(error: unknown): string {
  if (error instanceof Error && error.message.trim()) {
    return error.message;
  }
  return String(error);
}

function toDraftErrorMessage(error: unknown): string {
  if (
    error instanceof Error &&
    (error.name === 'TimeoutError' || error.name === 'AbortError')
  ) {
    return '生成草稿超时，请重试';
  }
  const message = getErrorMessage(error).trim();
  return message === '' ? GENERATION_FAILED_ERROR : message;
}

function normalizePreset(
  preset: RunQuickBookDraftInput['preset'],
): QuickBookDraftPreset {
  return {
    assetId: preset?.assetId ?? 0,
    typeId: preset?.typeId ?? 0,
  };
}

function detectImageFormat(path: string): ImageFormat {
  const lower = path.toLocaleLowerCase();
  if (lower.endsWith('.png')) {
    return { mediaType: 'image/png', extension: 'png' };
  }
  if (lower.endsWith('.webp')) {
    return { mediaType: 'image/webp', extension: 'webp' };
  }
  if (lower.endsWith('.gif')) {
    return { mediaType: 'image/gif', extension: 'gif' };
  }
  return {
    mediaType: DEFAULT_IMAGE_MEDIA_TYPE,
    extension: DEFAULT_IMAGE_EXTENSION,
  };
}

function toLocalImagePath(imagePath: string): string {
  if (imagePath.startsWith('file://')) {
    try {
      return decodeURIComponent(imagePath.slice('file://'.length));
    } catch {
      throw new Error('截图路径不合法，无法读取图片');
    }
  }
  if (imagePath.startsWith('/')) {
    return imagePath;
  }
  throw new Error('截图路径不合法，无法读取图片');
}

async function readImageContent(imagePath: string): Promise<ImageContent> {
  const localPath = toLocalImagePath(imagePath);
  const format = detectImageFormat(localPath);
  let base64: string;
  try {
    base64 = await FileSystem.readFile(localPath, 'base64');
  } catch (error: unknown) {
    throw new Error(`无法读取截图图片：${getErrorMessage(error)}`);
  }
  if (!base64.trim()) {
    throw new Error('截图图片内容为空，无法生成草稿');
  }
  return {
    ...format,
    base64,
  };
}

function buildImageUserMessage(
  image: ImageContent,
  text: string,
): ModelMessage {
  return {
    role: 'user',
    content: [
      {
        type: 'file',
        mediaType: image.mediaType,
        filename: `screenshot.${image.extension}`,
        data: { type: 'data', data: image.base64 },
      },
      { type: 'text', text },
    ],
  };
}

async function markDraftFailedBestEffort(
  api: Api,
  draftId: string,
  errorText: string,
): Promise<void> {
  try {
    const draft = await api.quickBookDraft.getById(draftId);
    if (draft.status !== 'generating' && draft.status !== 'failed') {
      return;
    }
    await api.quickBookDraft.markFailed(draftId, errorText);
  } catch (markError: unknown) {
    // 保留原始生成错误；草稿已进入 pending 或行不存在时不覆盖。
    agentDebugLog('quickBookDraft', 'mark-failed-error', {
      message: getErrorMessage(markError),
    });
  }
}

async function resolveDraftModel(api: Api, booksId: number) {
  const [selection, providers] = await Promise.all([
    api.quickBook.getSelection(),
    api.provider.getAll(),
  ]);
  const resolution = resolveQuickBookModel(providers, selection);
  if (!resolution.ok) {
    throw new Error(
      resolution.reason === 'provider-missing'
        ? '请先在 AI 记账设置中选择 AI 提供商。'
        : resolution.reason === 'model-missing'
          ? '请先在 AI 记账设置中选择模型。'
          : '所选模型不支持图片输入，请重新选择。',
    );
  }
  const apiKey = await api.credential.getKey(booksId, resolution.provider.id);
  if (!apiKey) {
    throw new Error('所选提供商还没有保存 API Key。');
  }
  return {
    provider: resolution.provider,
    model: resolution.model,
    apiKey,
  };
}

function createDraftPlaceholder(
  api: Api,
  input: RunQuickBookDraftInput,
  preset: QuickBookDraftPreset,
  agentProviderId: number,
  agentModelId: string,
) {
  return api.quickBookDraft.createPlaceholder({
    id: input.draftId,
    booksId: input.booksId,
    imagePath: input.imagePath,
    source: QUICK_BOOK_DRAFT_SOURCE.floatingCapture,
    preset,
    agentProviderId,
    agentModelId,
  });
}

async function executeQuickBookDraft(
  input: RunQuickBookDraftInput,
): Promise<void> {
  const api = localApi;
  const preset = normalizePreset(input.preset);
  let resolved: Awaited<ReturnType<typeof resolveDraftModel>>;
  try {
    resolved = await resolveDraftModel(api, input.booksId);
  } catch (error) {
    // 先落一个 generating 占位，让外层 catch 能把它标记为 failed，
    // 用户下次打开 App 时可以看到失败原因并重试。
    await createDraftPlaceholder(api, input, preset, 0, '').catch(() => {});
    throw error;
  }
  const { provider, model, apiKey } = resolved;

  await createDraftPlaceholder(api, input, preset, provider.id, model.modelId);

  const book = await api.book.getById(input.booksId);
  const image = await readImageContent(input.imagePath);
  const userText = buildQuickBookDraftUserMessage({
    bookName: book.name,
    preset,
  });

  const agent = createAgent({
    provider,
    model,
    apiKey,
    systemPrompt: buildQuickBookDraftSystemPrompt({
      bookName: book.name,
      today: dayjs().format('YYYY-MM-DD'),
      preset,
    }),
    tools: createQuickBookDraftTools({
      api,
      booksId: input.booksId,
      draftId: input.draftId,
      preset,
      imagePath: input.imagePath,
    }),
  });

  await agent.generate({
    messages: [buildImageUserMessage(image, userText)],
    timeout: { totalMs: AGENT_TIMEOUT_MS },
  });

  const draft = await api.quickBookDraft.getById(input.draftId);
  if (draft.status !== 'pending' || draft.items.length === 0) {
    throw new Error(NO_DRAFT_ERROR);
  }
}

/**
 * 在 Headless JS 中生成截图记账草稿。
 * 不创建 Agent 会话线程；失败时把草稿标记为 failed 并抛出中文错误。
 */
export async function runQuickBookDraft(
  input: RunQuickBookDraftInput,
): Promise<void> {
  try {
    await executeQuickBookDraft(input);
  } catch (error: unknown) {
    const message = toDraftErrorMessage(error);
    await markDraftFailedBestEffort(localApi, input.draftId, message);
    throw error instanceof Error ? error : new Error(message);
  }
}
