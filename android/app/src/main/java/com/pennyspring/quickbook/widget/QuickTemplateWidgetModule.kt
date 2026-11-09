package com.pennyspring.quickbook.widget

import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.ReadableMap

/** 快捷模板桌面小组件的 JS 桥：发布快照与回报直接记账结果。 */
class QuickTemplateWidgetModule(
    private val reactContext: ReactApplicationContext,
) : ReactContextBaseJavaModule(reactContext) {
    companion object {
        private const val ERROR_CATALOG = "QUICK_TEMPLATE_WIDGET_CATALOG_FAILED"
        private const val ERROR_OUTCOME = "QUICK_TEMPLATE_WIDGET_OUTCOME_FAILED"
    }

    override fun getName(): String = "QuickTemplateWidget"

    @ReactMethod
    fun setCatalog(
        catalogJson: String,
        promise: Promise,
    ) {
        try {
            val written = QuickTemplateWidgetCatalogStore.write(reactContext, catalogJson)
            if (written) {
                QuickTemplateWidgetProvider.refreshAll(reactContext)
            }
            promise.resolve(written)
        } catch (error: Exception) {
            promise.reject(ERROR_CATALOG, error)
        }
    }

    @ReactMethod
    fun reportRecordOutcome(
        outcome: ReadableMap,
        promise: Promise,
    ) {
        try {
            val requestId = outcome.getString("requestId")?.trim().orEmpty()
            if (requestId.isEmpty()) {
                throw IllegalArgumentException("小组件请求 id 不能为空")
            }
            val status = outcome.getString("status")
            if (status != "success" && status != "failed") {
                throw IllegalArgumentException("小组件记账结果状态不合法")
            }
            val templateName = outcome.getString("templateName")?.trim().orEmpty()
            val amountCents =
                if (outcome.hasKey("amountCents")) {
                    outcome.getInt("amountCents")
                } else {
                    0
                }
            val message = outcome.getString("message")?.trim().orEmpty()
            QuickTemplateRecordTaskResults.put(
                QuickTemplateRecordTaskResults.Outcome(
                    requestId = requestId,
                    succeeded = status == "success",
                    templateName = templateName,
                    amountCents = amountCents.coerceAtLeast(0),
                    message = message,
                ),
            )
            QuickTemplateRecordService.finishReportedRequest(reactContext, requestId)
            promise.resolve(null)
        } catch (error: Exception) {
            promise.reject(ERROR_OUTCOME, error)
        }
    }
}
