package com.pennyspring.quickbook.widget

import android.content.Context
import android.content.Intent
import android.content.pm.ServiceInfo
import android.os.Build
import android.util.Log
import android.widget.Toast
import androidx.core.app.ServiceCompat
import androidx.core.content.ContextCompat
import com.facebook.react.HeadlessJsTaskService
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.ReactContext
import com.facebook.react.jstasks.HeadlessJsTaskConfig
import com.facebook.react.jstasks.HeadlessJsTaskContext
import com.pennyspring.R
import com.pennyspring.quickbook.draft.QuickBookTaskRegistry
import java.lang.ref.WeakReference
import java.util.Locale

/**
 * 桌面小组件点击后的直接记账 Headless 服务。
 *
 * 小组件点击是 Android 官方允许后台启动前台服务的场景；服务只负责拉起 JS 任务、
 * 读取 JS 回报的结果并发 Toast，不在原生里写业务表。
 */
class QuickTemplateRecordService : HeadlessJsTaskService() {
    enum class StartResult {
        STARTED,
        BUSY,
        FAILED,
    }

    companion object {
        private const val TAG = "QuickTemplateRecordService"
        private const val INVALID_ID = 0
        private const val MAX_CONCURRENT = 2
        private const val TASK_STALE_AFTER_MS = QuickTemplateRecordTaskContract.TASK_TIMEOUT_MS + 5_000L

        private val registry = QuickBookTaskRegistry(MAX_CONCURRENT, TASK_STALE_AFTER_MS)
        private var knownReactContextRef: WeakReference<ReactContext>? = null

        /**
         * 启动一次小组件直接记账。
         *
         * @return [StartResult.BUSY] 表示并发任务已达上限；[StartResult.FAILED] 表示系统拒绝启动前台服务。
         */
        @JvmStatic
        fun start(
            context: Context,
            requestId: String,
            templateId: Int,
            bookRefJson: String,
            widgetId: Int,
        ): StartResult {
            if (!registry.tryAcquire(requestId)) {
                return StartResult.BUSY
            }
            return try {
                val intent =
                    Intent(context, QuickTemplateRecordService::class.java).apply {
                        putExtra(QuickTemplateRecordTaskContract.EXTRA_REQUEST_ID, requestId)
                        putExtra(QuickTemplateRecordTaskContract.EXTRA_TEMPLATE_ID, templateId)
                        putExtra(QuickTemplateRecordTaskContract.EXTRA_BOOK_REF, bookRefJson)
                        putExtra(QuickTemplateRecordTaskContract.EXTRA_WIDGET_ID, widgetId)
                    }
                ContextCompat.startForegroundService(context, intent)
                StartResult.STARTED
            } catch (error: Exception) {
                registry.release(requestId)
                Log.w(TAG, "启动小组件记账服务失败", error)
                StartResult.FAILED
            }
        }

        /** JS 回报结果后立即结束对应 Headless 任务，不依赖 RN 的 notifyTaskFinished。 */
        @JvmStatic
        fun finishReportedRequest(
            context: ReactContext,
            requestId: String,
        ) {
            val taskId = registry.findTaskId(requestId) ?: return
            HeadlessJsTaskContext.getInstance(context).finishTask(taskId)
        }
    }

    override fun onStartCommand(
        intent: Intent?,
        flags: Int,
        startId: Int,
    ): Int {
        syncTaskContext()
        startAsForegroundService()
        val requestId = intent?.getStringExtra(QuickTemplateRecordTaskContract.EXTRA_REQUEST_ID)?.trim().orEmpty()
        if (intent == null || !hasRequiredExtras(intent)) {
            registry.release(requestId)
            Toast.makeText(applicationContext, R.string.quick_template_widget_toast_missing_params, Toast.LENGTH_SHORT).show()
            settleService()
            return START_NOT_STICKY
        }
        registry.expectTask(requestId)
        return try {
            super.onStartCommand(intent, flags, startId)
            // 每次点击都是一次独立任务，不重投。
            START_NOT_STICKY
        } catch (error: Exception) {
            registry.cancelExpectedTask(requestId)
            registry.release(requestId)
            Log.w(TAG, "创建小组件 Headless 任务失败", error)
            Toast.makeText(applicationContext, R.string.quick_template_widget_toast_failed, Toast.LENGTH_SHORT).show()
            settleService()
            START_NOT_STICKY
        }
    }

    override fun getTaskConfig(intent: Intent?): HeadlessJsTaskConfig? {
        if (intent == null || !hasRequiredExtras(intent)) {
            return null
        }
        val requestId = intent.getStringExtra(QuickTemplateRecordTaskContract.EXTRA_REQUEST_ID)?.trim().orEmpty()
        val data =
            Arguments.createMap().apply {
                putString(QuickTemplateRecordTaskContract.EXTRA_REQUEST_ID, requestId)
                putInt(
                    QuickTemplateRecordTaskContract.EXTRA_TEMPLATE_ID,
                    intent.getIntExtra(QuickTemplateRecordTaskContract.EXTRA_TEMPLATE_ID, INVALID_ID),
                )
                putString(
                    QuickTemplateRecordTaskContract.EXTRA_BOOK_REF,
                    intent.getStringExtra(QuickTemplateRecordTaskContract.EXTRA_BOOK_REF)?.trim().orEmpty(),
                )
            }
        return HeadlessJsTaskConfig(
            QuickTemplateRecordTaskContract.HEADLESS_TASK_NAME,
            data,
            QuickTemplateRecordTaskContract.TASK_TIMEOUT_MS,
            // App 在前台时也允许执行，避免 HeadlessJsTaskContext 直接抛异常。
            true,
        )
    }

    override fun onHeadlessJsTaskStart(taskId: Int) {
        reactContext?.let { knownReactContextRef = WeakReference(it) }
        registry.bindTask(taskId)
    }

    override fun onHeadlessJsTaskFinish(taskId: Int) {
        val requestId = registry.completeTask(taskId)
        if (requestId == null) {
            settleService()
            return
        }
        showOutcomeToast(QuickTemplateRecordTaskResults.take(requestId))
        QuickTemplateWidgetProvider.refreshAll(this)
        settleService()
    }

    override fun onDestroy() {
        stopForegroundService()
        super.onDestroy()
    }

    private fun hasRequiredExtras(intent: Intent): Boolean {
        val requestId = intent.getStringExtra(QuickTemplateRecordTaskContract.EXTRA_REQUEST_ID)?.trim().orEmpty()
        val templateId = intent.getIntExtra(QuickTemplateRecordTaskContract.EXTRA_TEMPLATE_ID, INVALID_ID)
        val bookRef = intent.getStringExtra(QuickTemplateRecordTaskContract.EXTRA_BOOK_REF)?.trim().orEmpty()
        return requestId.isNotEmpty() && templateId > 0 && bookRef.isNotEmpty()
    }

    private fun showOutcomeToast(outcome: QuickTemplateRecordTaskResults.Outcome?) {
        if (outcome?.succeeded == true) {
            val amountText = String.format(Locale.CHINA, "%.2f", outcome.amountCents / 100.0)
            val message =
                if (outcome.templateName.isBlank()) {
                    getString(R.string.quick_template_widget_toast_recorded_no_name, amountText)
                } else {
                    getString(R.string.quick_template_widget_toast_recorded, amountText, outcome.templateName)
                }
            Toast.makeText(applicationContext, message, Toast.LENGTH_SHORT).show()
            return
        }
        val reason = outcome?.message?.takeIf { it.isNotBlank() }
        val message =
            if (reason == null) {
                getString(R.string.quick_template_widget_toast_failed)
            } else {
                getString(R.string.quick_template_widget_toast_failed_with_reason, reason)
            }
        Toast.makeText(applicationContext, message, Toast.LENGTH_SHORT).show()
    }

    private fun settleService() {
        if (registry.activeCount() > 0) {
            return
        }
        stopForegroundService()
        QuickTemplateRecordTaskResults.clear()
        stopSelf()
    }

    private fun startAsForegroundService() {
        val notification = QuickTemplateWidgetNotifications.recordingNotification(this)
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.UPSIDE_DOWN_CAKE) {
            startForeground(
                QuickTemplateWidgetNotifications.NOTIFICATION_ID,
                notification,
                ServiceInfo.FOREGROUND_SERVICE_TYPE_SPECIAL_USE,
            )
        } else {
            startForeground(QuickTemplateWidgetNotifications.NOTIFICATION_ID, notification)
        }
    }

    private fun stopForegroundService() {
        ServiceCompat.stopForeground(this, ServiceCompat.STOP_FOREGROUND_REMOVE)
    }

    private fun syncTaskContext() {
        val context = reactContext ?: return
        val knownContext = knownReactContextRef?.get()
        if (knownContext !== null && knownContext !== context) {
            // JS 重载后 HeadlessJsTaskContext 会重建，taskId 从头计数。
            registry.resetTaskMappings()
        }
        knownReactContextRef = WeakReference(context)
    }
}
