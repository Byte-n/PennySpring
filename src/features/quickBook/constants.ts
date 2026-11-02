import {
  AGENT_IMAGE_MAX_DIMENSION,
  AGENT_IMAGE_QUALITY,
} from '../../agent/ui/imageAttachments';

export const DEFAULT_QUICK_BOOK_PROMPT =
  '请根据这张截图帮我记账。先调用 listTypes 获取 typeId，再调用 createRecords；请根据截图内容从类型清单中自行选择最精确的子类型，不要为了分类反复确认；金额确实无法确定时再问我，不要猜测。不要查询已有记录。';

/** 旧版默认提示词，仅用于一次性升级迁移。 */
export const LEGACY_DEFAULT_QUICK_BOOK_PROMPT =
  '请根据这张截图帮我记账。先调用 listTypes 获取 typeId，再调用 createRecords；金额、类型或日期不明确时先问我，不要猜测。不要查询已有记录。';

export const DEFAULT_SCREENSHOT_FRESH_WINDOW_SECONDS = 60;
export const MIN_SCREENSHOT_FRESH_WINDOW_SECONDS = 5;
export const MAX_SCREENSHOT_FRESH_WINDOW_SECONDS = 600;

export const QUICK_BOOK_THREAD_TITLE_PREFIX = '截图记账';
export const QUICK_BOOK_THREAD_TITLE_TIME_FORMAT = 'MM-DD HH:mm';

export const QUICK_BOOK_IMAGE_MAX_DIMENSION = AGENT_IMAGE_MAX_DIMENSION;
export const QUICK_BOOK_IMAGE_QUALITY_PERCENT = Math.round(
  AGENT_IMAGE_QUALITY * 100,
);

export const QUICK_BOOK_SHARE_EVENT = 'QuickBookShareAvailable';
