package com.pennyspring.quickbook.draft

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
import java.lang.ref.WeakReference

/**
 * 在后台运行截图记账草稿 Headless JS 任务。
 *
 * 同一服务实例可并发托管多个任务；生成期间不启动任何 Activity，
 * 任务结束前由 JS 回报结果，原生通过通知与 Toast 告知。
 */
class QuickBookJobService : HeadlessJsTaskService() {
    enum class StartResult {
        STARTED,
        BUSY,
        FAILED,
    }

    companion object {
        private const val TAG = "QuickBookJobService"
        private const val NOTIFICATION_ID = QuickBookDraftNotifications.NOTIFICATION_ID_GENERATING
        private const val INVALID_ID = 0
        private const val MAX_CONCURRENT_DRAFTS = 3
        private const val TASK_STALE_AFTER_MS = QuickBookDraftTaskContract.TASK_TIMEOUT_MS + 5_000L

        private val registry = QuickBookTaskRegistry(MAX_CONCURRENT_DRAFTS, TASK_STALE_AFTER_MS)
        private var knownReactContextRef: WeakReference<ReactContext>? = null

        /**
         * 启动一次草稿生成任务。
         *
         * @return [StartResult.BUSY] 表示并发草稿已达上限；[StartResult.FAILED] 表示系统拒绝在后台
         *   启动前台服务（Android 12+ 后台启动限制 / OEM 后台限制）。
         */
        @JvmStatic
        fun start(
            context: Context,
            draftId: String,
            imagePath: String,
            bookRefJson: String,
            booksId: Int,
            assetId: Int,
            typeId: Int,
            source: String,
        ): StartResult {
            if (!registry.tryAcquire(draftId)) {
                return StartResult.BUSY
            }
            val intent =
                Intent(context, QuickBookJobService::class.java).apply {
                    putExtra(QuickBookDraftTaskContract.EXTRA_DRAFT_ID, draftId)
                    putExtra(QuickBookDraftTaskContract.EXTRA_IMAGE_PATH, imagePath)
                    putExtra(QuickBookDraftTaskContract.EXTRA_BOOK_REF, bookRefJson)
                    putExtra(QuickBookDraftTaskContract.EXTRA_BOOKS_ID, booksId)
                    putExtra(QuickBookDraftTaskContract.EXTRA_ASSET_ID, assetId)
                    putExtra(QuickBookDraftTaskContract.EXTRA_TYPE_ID, typeId)
                    putExtra(QuickBookDraftTaskContract.EXTRA_SOURCE, source)
                }
            return try {
                ContextCompat.startForegroundService(context, intent)
                StartResult.STARTED
            } catch (error: Exception) {
                registry.release(draftId)
                Log.w(TAG, "启动草稿任务失败", error)
                StartResult.FAILED
            }
        }

        /**
         * JS 回报草稿结果后立即结束对应 Headless 任务。
         * 不依赖 RN 的 notifyTaskFinished：该回调在本项目的 bridgeless 链路下不可靠，
         * 会导致前台通知一直停留到 180s 超时。
         */
        @JvmStatic
        fun finishReportedDraft(
            context: ReactContext,
            draftId: String,
        ) {
            val taskId = registry.findTaskId(draftId) ?: return
            HeadlessJsTaskContext.getInstance(context).finishTask(taskId)
        }
    }

    private var batchSuccessCount = 0
    private var batchFailureCount = 0
    private var batchItemCount = 0

    override fun onStartCommand(
        intent: Intent?,
        flags: Int,
        startId: Int,
    ): Int {
        syncTaskContext()
        // 必须先 startForeground：服务由 startForegroundService 启动，
        // Android 8+ 要求 5 秒内进入前台，否则会抛 RemoteServiceException。
        startAsForegroundService()
        val draftId = intent?.getStringExtra(QuickBookDraftTaskContract.EXTRA_DRAFT_ID)?.trim().orEmpty()
        if (intent == null || !hasRequiredExtras(intent)) {
            registry.release(draftId)
            Toast.makeText(applicationContext, R.string.quick_book_toast_missing_params, Toast.LENGTH_SHORT).show()
            settleTasks(showSummary = false)
            return START_NOT_STICKY
        }
        registry.expectTask(draftId)
        return try {
            super.onStartCommand(intent, flags, startId)
            // HeadlessJsTaskService 默认返回 START_REDELIVER_INTENT；
            // 草稿任务结束即完成，重投只会造成重复生成，这里改为不重启。
            START_NOT_STICKY
        } catch (error: Exception) {
            Log.w(TAG, "启动草稿任务失败", error)
            registry.cancelExpectedTask(draftId)
            registry.release(draftId)
            Toast.makeText(applicationContext, R.string.quick_book_capture_send_failed, Toast.LENGTH_SHORT).show()
            settleTasks(showSummary = false)
            START_NOT_STICKY
        }
    }

    override fun getTaskConfig(intent: Intent?): HeadlessJsTaskConfig? {
        if (intent == null || !hasRequiredExtras(intent)) {
            return null
        }
        val draftId = intent.getStringExtra(QuickBookDraftTaskContract.EXTRA_DRAFT_ID)?.trim().orEmpty()
        val imagePath = intent.getStringExtra(QuickBookDraftTaskContract.EXTRA_IMAGE_PATH)?.trim().orEmpty()
        val bookRef = intent.getStringExtra(QuickBookDraftTaskContract.EXTRA_BOOK_REF)?.trim().orEmpty()
        val data =
            Arguments.createMap().apply {
                putString(QuickBookDraftTaskContract.EXTRA_DRAFT_ID, draftId)
                putString(QuickBookDraftTaskContract.EXTRA_IMAGE_PATH, imagePath)
                if (bookRef.isNotEmpty()) {
                    putString(QuickBookDraftTaskContract.EXTRA_BOOK_REF, bookRef)
                }
                putInt(
                    QuickBookDraftTaskContract.EXTRA_BOOKS_ID,
                    intent.getIntExtra(QuickBookDraftTaskContract.EXTRA_BOOKS_ID, INVALID_ID),
                )
                putInt(
                    QuickBookDraftTaskContract.EXTRA_ASSET_ID,
                    intent.getIntExtra(QuickBookDraftTaskContract.EXTRA_ASSET_ID, INVALID_ID),
                )
                putInt(
                    QuickBookDraftTaskContract.EXTRA_TYPE_ID,
                    intent.getIntExtra(QuickBookDraftTaskContract.EXTRA_TYPE_ID, INVALID_ID),
                )
                putString(
                    QuickBookDraftTaskContract.EXTRA_SOURCE,
                    intent
                        .getStringExtra(QuickBookDraftTaskContract.EXTRA_SOURCE)
                        ?.trim()
                        .orEmpty()
                        .ifEmpty { QuickBookDraftTaskContract.SOURCE_FLOATING_CAPTURE },
                )
            }
        return HeadlessJsTaskConfig(
            QuickBookDraftTaskContract.HEADLESS_TASK_NAME,
            data,
            QuickBookDraftTaskContract.TASK_TIMEOUT_MS,
            // App 在前台时也允许执行，避免 HeadlessJsTaskContext 直接抛异常。
            true,
        )
    }

    override fun onHeadlessJsTaskStart(taskId: Int) {
        reactContext?.let { knownReactContextRef = WeakReference(it) }
        registry.bindTask(taskId)
    }

    override fun onHeadlessJsTaskFinish(taskId: Int) {
        val draftId = registry.completeTask(taskId)
        if (draftId == null) {
            settleTasks(showSummary = false)
            return
        }
        val outcome = QuickBookDraftTaskResults.take(draftId)
        recordOutcome(outcome)
        // 生命周期由 registry 管理，不调用 super，避免基类 activeTasks 为空时提前 stopSelf。
        settleTasks(showSummary = true)
    }

    override fun onDestroy() {
        stopForegroundService()
        super.onDestroy()
    }

    private fun syncTaskContext() {
        val context = reactContext ?: return
        val knownContext = knownReactContextRef?.get()
        if (knownContext !== null && knownContext !== context) {
            // JS 重载后 HeadlessJsTaskContext 会重建，taskId 从头计数；旧任务已随旧上下文失效。
            registry.resetTaskMappings()
        }
        knownReactContextRef = WeakReference(context)
    }

    private fun hasRequiredExtras(intent: Intent): Boolean {
        val draftId = intent.getStringExtra(QuickBookDraftTaskContract.EXTRA_DRAFT_ID)?.trim().orEmpty()
        val imagePath = intent.getStringExtra(QuickBookDraftTaskContract.EXTRA_IMAGE_PATH)?.trim().orEmpty()
        val bookRef = intent.getStringExtra(QuickBookDraftTaskContract.EXTRA_BOOK_REF)?.trim().orEmpty()
        val booksId = intent.getIntExtra(QuickBookDraftTaskContract.EXTRA_BOOKS_ID, INVALID_ID)
        return draftId.isNotEmpty() && imagePath.isNotEmpty() && (bookRef.isNotEmpty() || booksId > 0)
    }

    private fun startAsForegroundService() {
        // Android 13+ 无通知权限时系统允许前台服务继续运行，只是不展示通知；
        // Android 14+ 需要显式传入 specialUse 类型，否则会抛 MissingForegroundServiceTypeException。
        val completedCount = batchSuccessCount + batchFailureCount
        val totalCount = completedCount + registry.activeCount()
        val notification =
            QuickBookDraftNotifications.generatingNotification(this, completedCount, totalCount)
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.UPSIDE_DOWN_CAKE) {
            startForeground(
                NOTIFICATION_ID,
                notification,
                ServiceInfo.FOREGROUND_SERVICE_TYPE_SPECIAL_USE,
            )
        } else {
            startForeground(NOTIFICATION_ID, notification)
        }
    }

    private fun recordOutcome(outcome: QuickBookDraftTaskResults.Outcome?) {
        if (outcome?.succeeded == true) {
            batchSuccessCount += 1
            batchItemCount += outcome.itemCount
        } else {
            batchFailureCount += 1
        }
    }

    /** 有任务在跑就刷新前台通知；全部结束才汇总提示并停止服务。 */
    private fun settleTasks(showSummary: Boolean) {
        if (registry.activeCount() > 0) {
            startAsForegroundService()
            return
        }
        if (showSummary) {
            QuickBookDraftNotifications.notifyIfAllowed(
                this,
                NOTIFICATION_ID,
                QuickBookDraftNotifications.batchResultNotification(
                    this,
                    batchSuccessCount,
                    batchFailureCount,
                    batchItemCount,
                ),
            )
            detachForegroundService()
            showBatchResultToast()
        } else {
            stopForegroundService()
        }
        QuickBookDraftTaskResults.clear()
        batchSuccessCount = 0
        batchFailureCount = 0
        batchItemCount = 0
        stopSelf()
    }

    private fun showBatchResultToast() {
        if (batchFailureCount == 0) {
            Toast
                .makeText(
                    applicationContext,
                    getString(R.string.quick_book_toast_draft_generated, batchItemCount),
                    Toast.LENGTH_SHORT,
                ).show()
            return
        }
        val message =
            if (batchItemCount > 0) {
                R.string.quick_book_toast_draft_partial_failed
            } else {
                R.string.quick_book_toast_draft_failed
            }
        Toast.makeText(applicationContext, message, Toast.LENGTH_SHORT).show()
    }

    /** 结果通知复用前台通知：有通知权限时保留并更新，否则直接移除。 */
    private fun detachForegroundService() {
        if (QuickBookDraftNotifications.canPostNotifications(this)) {
            ServiceCompat.stopForeground(this, ServiceCompat.STOP_FOREGROUND_DETACH)
        } else {
            stopForegroundService()
        }
    }

    private fun stopForegroundService() {
        ServiceCompat.stopForeground(this, ServiceCompat.STOP_FOREGROUND_REMOVE)
    }
}
