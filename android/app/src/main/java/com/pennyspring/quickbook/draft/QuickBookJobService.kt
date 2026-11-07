package com.pennyspring.quickbook.draft

import android.content.Context
import android.content.Intent
import android.content.pm.ServiceInfo
import android.os.Build
import android.os.Handler
import android.os.Looper
import android.util.Log
import android.widget.Toast
import androidx.core.app.ServiceCompat
import androidx.core.content.ContextCompat
import com.facebook.react.HeadlessJsTaskService
import com.facebook.react.bridge.Arguments
import com.facebook.react.jstasks.HeadlessJsTaskConfig
import com.pennyspring.R
import java.util.concurrent.Executors
import java.util.concurrent.atomic.AtomicBoolean

/**
 * 在后台运行截图记账草稿 Headless JS 任务。
 *
 * 生成期间不启动任何 Activity；任务结束后读取本地草稿状态，
 * 通过通知与 Toast 告知结果，满足 Android 14 specialUse 前台服务要求。
 */
class QuickBookJobService : HeadlessJsTaskService() {
    companion object {
        private const val TAG = "QuickBookJobService"
        private const val NOTIFICATION_ID = QuickBookDraftNotifications.NOTIFICATION_ID_GENERATING
        private const val RESULT_NOTIFICATION_ID = QuickBookDraftNotifications.NOTIFICATION_ID_RESULT
        private const val INVALID_ID = 0

        private val running = AtomicBoolean(false)
        private val lock = Any()
        private val resultExecutor = Executors.newSingleThreadExecutor()

        /**
         * 启动一次草稿生成任务。
         *
         * @return false 表示已有任务在运行，或系统拒绝在后台启动前台服务
         *   （Android 12+ 后台启动限制 / OEM 后台限制）。
         */
        @JvmStatic
        fun start(
            context: Context,
            draftId: String,
            imagePath: String,
            booksId: Int,
            assetId: Int,
            typeId: Int,
            source: String,
        ): Boolean {
            synchronized(lock) {
                if (running.get()) {
                    return false
                }
                running.set(true)
            }
            val intent =
                Intent(context, QuickBookJobService::class.java).apply {
                    putExtra(QuickBookDraftTaskContract.EXTRA_DRAFT_ID, draftId)
                    putExtra(QuickBookDraftTaskContract.EXTRA_IMAGE_PATH, imagePath)
                    putExtra(QuickBookDraftTaskContract.EXTRA_BOOKS_ID, booksId)
                    putExtra(QuickBookDraftTaskContract.EXTRA_ASSET_ID, assetId)
                    putExtra(QuickBookDraftTaskContract.EXTRA_TYPE_ID, typeId)
                    putExtra(QuickBookDraftTaskContract.EXTRA_SOURCE, source)
                }
            return try {
                ContextCompat.startForegroundService(context, intent)
                true
            } catch (error: Exception) {
                running.set(false)
                Log.w(TAG, "启动草稿任务失败", error)
                false
            }
        }

        @JvmStatic
        fun isRunning(): Boolean = running.get()
    }

    private val mainHandler = Handler(Looper.getMainLooper())

    @Volatile
    private var currentDraftId: String = ""

    override fun onStartCommand(
        intent: Intent?,
        flags: Int,
        startId: Int,
    ): Int {
        val draftId = intent?.getStringExtra(QuickBookDraftTaskContract.EXTRA_DRAFT_ID)?.trim().orEmpty()
        // 必须先 startForeground：服务由 startForegroundService 启动，
        // Android 8+ 要求 5 秒内进入前台，否则会抛 RemoteServiceException。
        startAsForegroundService(draftId)
        if (intent == null || !hasRequiredExtras(intent)) {
            Toast.makeText(applicationContext, R.string.quick_book_toast_missing_params, Toast.LENGTH_SHORT).show()
            stopJob()
            return START_NOT_STICKY
        }
        currentDraftId = draftId
        super.onStartCommand(intent, flags, startId)
        // HeadlessJsTaskService 默认返回 START_REDELIVER_INTENT；
        // 草稿任务结束即完成，重投只会造成重复生成，这里改为不重启。
        return START_NOT_STICKY
    }

    override fun getTaskConfig(intent: Intent?): HeadlessJsTaskConfig? {
        if (intent == null || !hasRequiredExtras(intent)) {
            return null
        }
        val draftId = intent.getStringExtra(QuickBookDraftTaskContract.EXTRA_DRAFT_ID)?.trim().orEmpty()
        val imagePath = intent.getStringExtra(QuickBookDraftTaskContract.EXTRA_IMAGE_PATH)?.trim().orEmpty()
        val data =
            Arguments.createMap().apply {
                putString(QuickBookDraftTaskContract.EXTRA_DRAFT_ID, draftId)
                putString(QuickBookDraftTaskContract.EXTRA_IMAGE_PATH, imagePath)
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

    override fun onHeadlessJsTaskFinish(taskId: Int) {
        val draftId = currentDraftId
        // 先保持前台服务存活，读取完草稿结果并发出通知后再停止，避免结果丢失。
        resultExecutor.execute {
            val summary =
                if (draftId.isBlank()) {
                    null
                } else {
                    QuickBookDraftDb.loadSummary(this, draftId)
                }
            val succeeded = QuickBookDraftDb.isPendingWithItems(summary)
            val itemCount = summary?.itemCount ?: 0
            mainHandler.post {
                if (succeeded) {
                    QuickBookDraftNotifications.notifyIfAllowed(
                        this,
                        RESULT_NOTIFICATION_ID,
                        QuickBookDraftNotifications.successNotification(this, itemCount),
                    )
                    Toast
                        .makeText(
                            applicationContext,
                            getString(R.string.quick_book_toast_draft_generated, itemCount),
                            Toast.LENGTH_SHORT,
                        ).show()
                } else {
                    QuickBookDraftNotifications.notifyIfAllowed(
                        this,
                        RESULT_NOTIFICATION_ID,
                        QuickBookDraftNotifications.failureNotification(this),
                    )
                    Toast.makeText(applicationContext, R.string.quick_book_toast_draft_failed, Toast.LENGTH_SHORT).show()
                }
                // 任务完成后再交给基类清理 activeTasks 并 stopSelf。
                finishTaskTracking(taskId)
                stopJob()
            }
        }
    }

    override fun onDestroy() {
        stopForegroundService()
        running.set(false)
        super.onDestroy()
    }

    private fun hasRequiredExtras(intent: Intent): Boolean {
        val draftId = intent.getStringExtra(QuickBookDraftTaskContract.EXTRA_DRAFT_ID)?.trim().orEmpty()
        val imagePath = intent.getStringExtra(QuickBookDraftTaskContract.EXTRA_IMAGE_PATH)?.trim().orEmpty()
        val booksId = intent.getIntExtra(QuickBookDraftTaskContract.EXTRA_BOOKS_ID, INVALID_ID)
        return draftId.isNotEmpty() && imagePath.isNotEmpty() && booksId > 0
    }

    private fun startAsForegroundService(draftId: String) {
        // Android 13+ 无通知权限时系统允许前台服务继续运行，只是不展示通知；
        // Android 14+ 需要显式传入 specialUse 类型，否则会抛 MissingForegroundServiceTypeException。
        val notification = QuickBookDraftNotifications.generatingNotification(this)
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

    private fun stopJob() {
        running.set(false)
        stopForegroundService()
        stopSelf()
    }

    private fun stopForegroundService() {
        ServiceCompat.stopForeground(this, ServiceCompat.STOP_FOREGROUND_REMOVE)
    }

    private fun finishTaskTracking(taskId: Int) {
        super.onHeadlessJsTaskFinish(taskId)
    }
}
