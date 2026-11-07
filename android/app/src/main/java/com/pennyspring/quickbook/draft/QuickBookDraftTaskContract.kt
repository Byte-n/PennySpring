package com.pennyspring.quickbook.draft

/**
 * 原生与 JS 之间共享的 Headless 任务契约。
 *
 * 任务名与超时必须与 `src/agent/headless/QuickBookDraftTask.ts` 保持一致。
 */
object QuickBookDraftTaskContract {
    const val HEADLESS_TASK_NAME = "QuickBookDraftTask"
    const val TASK_TIMEOUT_MS = 180_000L

    const val EXTRA_DRAFT_ID = "draftId"
    const val EXTRA_IMAGE_PATH = "imagePath"
    const val EXTRA_BOOKS_ID = "booksId"
    const val EXTRA_ASSET_ID = "assetId"
    const val EXTRA_TYPE_ID = "typeId"

    const val AGENT_DEEP_LINK = "pennyspring://agent"
}
