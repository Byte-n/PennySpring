package com.pennyspring.quickbook.widget

/** 原生与 JS 之间共享的小组件直接记账 Headless 任务契约。 */
object QuickTemplateRecordTaskContract {
    const val HEADLESS_TASK_NAME = "QuickTemplateRecordTask"
    const val TASK_TIMEOUT_MS = 20_000L

    const val EXTRA_REQUEST_ID = "requestId"
    const val EXTRA_TEMPLATE_ID = "templateId"
    const val EXTRA_BOOK_REF = "bookRef"
    const val EXTRA_WIDGET_ID = "widgetId"
}
