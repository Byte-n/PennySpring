import dayjs from 'dayjs';
import {
  QUICK_BOOK_DRAFT_SOURCE,
  QUICK_BOOK_DRAFT_STATUS,
  type Api,
  type QuickBookDraftPreset,
  type QuickBookDraftSourceValue,
} from '@pennyspring/api';
import type { ModelMessage } from 'ai';
import { FileSystem } from 'react-native-file-access';

import { resolveQuickBookModel } from '../../features/quickBook/validation';
import {
  resolveBookApi,
  resolveBookMedia,
} from '../../features/quickBookDraft/bookApi';
import {
  getDraftBookKey,
  type DraftBookTarget,
} from '../../features/quickBookDraft/draftBook';
import { quickBookDraftCache } from '../../features/quickBookDraft/draftCacheStorage';
import { reportQuickBookDraftOutcome } from '../../features/quickBookDraft/native';
import { bumpDraftVersion } from '../../stores/draftVersionStore';
import { loadBookAgentRules } from '../core/agentRules';
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
  target: DraftBookTarget;
  source?: QuickBookDraftSourceValue;
  preset?: { assetId: number; typeId: number };
  /** 原生 Headless 任务需要把结果回报给原生通知；前台重试不回报。 */
  reportOutcome?: boolean;
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

function toLocalImagePath(imagePath: string): string | null {
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
  return null;
}

function parseDataUrl(dataUrl: string): ImageContent {
  const match = /^data:([^;]+);base64,(.*)$/s.exec(dataUrl);
  if (match === null) {
    throw new Error('截图图片格式不正确');
  }
  const mediaType = match[1] ?? DEFAULT_IMAGE_MEDIA_TYPE;
  return {
    mediaType,
    extension: mediaType.split('/')[1] ?? DEFAULT_IMAGE_EXTENSION,
    base64: match[2] ?? '',
  };
}

async function readImageContent(
  imagePath: string,
  target: DraftBookTarget,
): Promise<ImageContent> {
  const localPath = toLocalImagePath(imagePath);
  if (localPath === null) {
    const media = await resolveBookMedia(target);
    return parseDataUrl(await media.toDataUrl(imagePath));
  }
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
  draftId: string,
  errorText: string,
): Promise<void> {
  try {
    const draft = await quickBookDraftCache.getById(draftId);
    if (draft.status !== 'generating' && draft.status !== 'failed') {
      return;
    }
    await quickBookDraftCache.markFailed(draftId, errorText);
  } catch (markError: unknown) {
    // 保留原始生成错误；草稿已进入 pending 或缓存不存在时不覆盖。
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
  input: RunQuickBookDraftInput,
  preset: QuickBookDraftPreset,
) {
  return quickBookDraftCache.createPlaceholder({
    id: input.draftId,
    target: input.target,
    imagePath: input.imagePath,
    source: input.source ?? QUICK_BOOK_DRAFT_SOURCE.floatingCapture,
    preset,
  });
}

async function executeQuickBookDraft(
  input: RunQuickBookDraftInput,
): Promise<number> {
  const booksId = input.target.booksId;
  const preset = normalizePreset(input.preset);
  // 占位草稿先落本地：即使账本 API 不可达，也能在列表里留下 failed 可重试记录。
  await createDraftPlaceholder(input, preset);
  bumpDraftVersion();

  const api = await resolveBookApi(input.target);
  const { provider, model, apiKey } = await resolveDraftModel(api, booksId);
  await quickBookDraftCache.setAgent(input.draftId, {
    agentProviderId: provider.id,
    agentModelId: model.modelId,
  });

  const [book, agentRules] = await Promise.all([
    api.book.getById(booksId),
    loadBookAgentRules(api, booksId),
  ]);
  const image = await readImageContent(input.imagePath, input.target);
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
      rules: agentRules?.quickBookRules,
    }),
    tools: createQuickBookDraftTools({
      bookApi: api,
      draftApi: quickBookDraftCache,
      booksId,
      draftId: input.draftId,
      preset,
      imagePath: input.imagePath,
    }),
  });

  await agent.generate({
    messages: [buildImageUserMessage(image, userText)],
    timeout: { totalMs: AGENT_TIMEOUT_MS },
  });

  const draft = await quickBookDraftCache.getById(input.draftId);
  if (draft.items.length === 0) {
    throw new Error(NO_DRAFT_ERROR);
  }
  if (draft.status === QUICK_BOOK_DRAFT_STATUS.generating) {
    await quickBookDraftCache.markReady(input.draftId);
  } else if (draft.status !== QUICK_BOOK_DRAFT_STATUS.pending) {
    throw new Error(NO_DRAFT_ERROR);
  }
  return draft.items.length;
}

/**
 * 在 Headless JS 中生成截图记账草稿。
 * 不创建 Agent 会话线程；失败时把草稿标记为 failed 并抛出中文错误。
 * 每次生命周期变化都 bump 草稿版本，让前台列表与角标实时失效刷新。
 */
export async function runQuickBookDraft(
  input: RunQuickBookDraftInput,
): Promise<void> {
  let itemCount = 0;
  const bookKey = getDraftBookKey(input.target);
  try {
    itemCount = await executeQuickBookDraft(input);
    if (input.reportOutcome) {
      await reportQuickBookDraftOutcome({
        draftId: input.draftId,
        status: 'success',
        itemCount,
        bookKey,
      }).catch(() => undefined);
    }
  } catch (error: unknown) {
    const message = toDraftErrorMessage(error);
    await markDraftFailedBestEffort(input.draftId, message);
    if (input.reportOutcome) {
      await reportQuickBookDraftOutcome({
        draftId: input.draftId,
        status: 'failed',
        itemCount,
        bookKey,
      }).catch(() => undefined);
    }
    throw error instanceof Error ? error : new Error(message);
  } finally {
    bumpDraftVersion();
  }
}
