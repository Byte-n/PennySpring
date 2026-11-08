package com.pennyspring.quickbook.draft

import android.app.Notification
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.content.Context
import android.content.Intent
import android.os.Build
import android.util.Log
import androidx.core.app.NotificationCompat
import androidx.core.app.NotificationManagerCompat
import androidx.core.content.ContextCompat
import com.pennyspring.MainActivity
import com.pennyspring.R

/**
 * 截图记账草稿相关通知。
 *
 * 所有正文只展示笔数，不展示金额或截图，避免锁屏泄露。
 * Android 13+ 未授予 POST_NOTIFICATIONS 时通知不会展示，
 * 但前台服务仍必须调用 startForeground，因此这里不阻塞前台通知构建。
 */
object QuickBookDraftNotifications {
    private const val TAG = "QuickBookDraftNotify"

    const val CHANNEL_FLOATING = "quick_book_floating"
    const val CHANNEL_DRAFT = "quick_book_draft"

    const val NOTIFICATION_ID_FLOATING = 3101
    const val NOTIFICATION_ID_GENERATING = 3102
    const val NOTIFICATION_ID_ENTRY_TRIGGER = 3111

    private const val REQUEST_CODE_OPEN_APP = 4101
    private const val REQUEST_CODE_CAPTURE = 4102
    private const val REQUEST_CODE_REPOST = 4103
    private const val REQUEST_CODE_DISABLE = 4104
    private const val PENDING_INTENT_FLAGS = PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE

    fun ensureChannels(context: Context) {
        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.O) {
            return
        }
        val manager = context.getSystemService(NotificationManager::class.java) ?: return
        val floatingChannel =
            NotificationChannel(
                CHANNEL_FLOATING,
                context.getString(R.string.quick_book_channel_floating_name),
                NotificationManager.IMPORTANCE_LOW,
            ).apply {
                description = context.getString(R.string.quick_book_channel_floating_description)
                setShowBadge(false)
            }
        val draftChannel =
            NotificationChannel(
                CHANNEL_DRAFT,
                context.getString(R.string.quick_book_channel_draft_name),
                NotificationManager.IMPORTANCE_DEFAULT,
            ).apply {
                description = context.getString(R.string.quick_book_channel_draft_description)
            }
        manager.createNotificationChannels(listOf(floatingChannel, draftChannel))
    }

    fun canPostNotifications(context: Context): Boolean =
        try {
            NotificationManagerCompat.from(context).areNotificationsEnabled()
        } catch (error: Exception) {
            Log.w(TAG, "检查通知开关失败", error)
            false
        }

    fun floatingNotification(context: Context): Notification {
        ensureChannels(context)
        return baseBuilder(context, CHANNEL_FLOATING, NotificationCompat.PRIORITY_LOW)
            .setContentTitle(context.getString(R.string.quick_book_notification_floating_title))
            .setContentText(context.getString(R.string.quick_book_notification_floating_text))
            .setContentIntent(openAppPendingIntent(context))
            .setOngoing(true)
            .setShowWhen(false)
            .setCategory(NotificationCompat.CATEGORY_SERVICE)
            .build()
    }

    fun entryTriggerNotification(context: Context): Notification {
        ensureChannels(context)
        return baseBuilder(context, CHANNEL_FLOATING, NotificationCompat.PRIORITY_LOW)
            .setContentTitle(context.getString(R.string.quick_book_notification_entry_title))
            .setContentText(context.getString(R.string.quick_book_notification_entry_text))
            .setContentIntent(capturePendingIntent(context))
            .setDeleteIntent(repostPendingIntent(context))
            .addAction(
                R.drawable.ic_quick_book_close,
                context.getString(R.string.quick_book_notification_entry_disable),
                disablePendingIntent(context),
            ).setOngoing(true)
            .setShowWhen(false)
            .setCategory(NotificationCompat.CATEGORY_SERVICE)
            .build()
    }

    /** 常驻通知入口由通知本身持有，不依赖前台服务。 */
    fun postEntryTrigger(context: Context): Boolean {
        if (!canPostNotifications(context)) {
            Log.i(TAG, "通知已关闭，跳过常驻通知入口")
            return false
        }
        return try {
            NotificationManagerCompat
                .from(context)
                .notify(NOTIFICATION_ID_ENTRY_TRIGGER, entryTriggerNotification(context))
            true
        } catch (error: SecurityException) {
            Log.w(TAG, "发送常驻通知入口失败", error)
            false
        }
    }

    fun cancelEntryTrigger(context: Context) {
        try {
            NotificationManagerCompat.from(context).cancel(NOTIFICATION_ID_ENTRY_TRIGGER)
        } catch (error: Exception) {
            Log.w(TAG, "取消常驻通知入口失败", error)
        }
    }

    fun isEntryTriggerActive(context: Context): Boolean =
        try {
            context
                .getSystemService(NotificationManager::class.java)
                ?.activeNotifications
                ?.any { it.id == NOTIFICATION_ID_ENTRY_TRIGGER } == true
        } catch (error: Exception) {
            Log.w(TAG, "读取常驻通知入口状态失败", error)
            false
        }

    fun generatingNotification(
        context: Context,
        completedCount: Int,
        totalCount: Int,
    ): Notification {
        ensureChannels(context)
        val safeTotal = totalCount.coerceAtLeast(1)
        val safeCompleted = completedCount.coerceIn(0, safeTotal)
        val progressText =
            context.getString(
                R.string.quick_book_notification_generating_text,
                safeCompleted,
                safeTotal,
            )
        return baseBuilder(context, CHANNEL_DRAFT, NotificationCompat.PRIORITY_DEFAULT)
            .setContentTitle(context.getString(R.string.quick_book_notification_generating_title))
            .setContentText(progressText)
            .setOngoing(true)
            .setProgress(safeTotal, safeCompleted, false)
            .setCategory(NotificationCompat.CATEGORY_PROGRESS)
            .setContentIntent(openAppPendingIntent(context))
            .build()
    }

    /** 整批草稿结束后复用同一条通知展示结果，不再逐条发结果通知。 */
    fun batchResultNotification(
        context: Context,
        successCount: Int,
        failureCount: Int,
        itemCount: Int,
    ): Notification {
        ensureChannels(context)
        val title: String
        val text: String
        if (failureCount == 0) {
            title = context.getString(R.string.quick_book_notification_success_title)
            text = context.getString(R.string.quick_book_notification_success_text, successCount, itemCount)
        } else if (successCount == 0) {
            title = context.getString(R.string.quick_book_notification_failure_title)
            text = context.getString(R.string.quick_book_notification_failure_text)
        } else {
            title = context.getString(R.string.quick_book_notification_partial_title)
            text = context.getString(R.string.quick_book_notification_partial_text, successCount, failureCount)
        }
        return baseBuilder(context, CHANNEL_DRAFT, NotificationCompat.PRIORITY_DEFAULT)
            .setContentTitle(title)
            .setContentText(text)
            .setContentIntent(openAppPendingIntent(context))
            .setAutoCancel(true)
            .build()
    }

    /** 结果通知只在系统通知开关打开时展示。 */
    fun notifyIfAllowed(
        context: Context,
        notificationId: Int,
        notification: Notification,
    ) {
        if (!canPostNotifications(context)) {
            Log.i(TAG, "通知已关闭，跳过通知 $notificationId")
            return
        }
        try {
            NotificationManagerCompat.from(context).notify(notificationId, notification)
        } catch (error: SecurityException) {
            Log.w(TAG, "发送通知失败 $notificationId", error)
        }
    }

    private fun baseBuilder(
        context: Context,
        channelId: String,
        priority: Int,
    ): NotificationCompat.Builder =
        NotificationCompat
            .Builder(context, channelId)
            .setSmallIcon(R.drawable.ic_quick_book_notification)
            .setColor(ContextCompat.getColor(context, R.color.quick_book_primary))
            .setPriority(priority)

    private fun openAppIntent(context: Context): Intent =
        Intent(context, MainActivity::class.java).apply {
            action = Intent.ACTION_MAIN
            addCategory(Intent.CATEGORY_LAUNCHER)
            flags =
                Intent.FLAG_ACTIVITY_NEW_TASK or
                Intent.FLAG_ACTIVITY_SINGLE_TOP or
                Intent.FLAG_ACTIVITY_CLEAR_TOP
        }

    private fun openAppPendingIntent(context: Context): PendingIntent =
        PendingIntent.getActivity(
            context,
            REQUEST_CODE_OPEN_APP,
            openAppIntent(context),
            PENDING_INTENT_FLAGS,
        )

    private fun capturePendingIntent(context: Context): PendingIntent =
        PendingIntent.getActivity(
            context,
            REQUEST_CODE_CAPTURE,
            ScreenCaptureActivity
                .createIntent(context, ScreenCaptureActivity.TRIGGER_NOTIFICATION)
                .apply {
                    // 抓帧界面已在前台时复用实例，避免嵌套截到上一张抓帧 UI。
                    addFlags(Intent.FLAG_ACTIVITY_CLEAR_TOP or Intent.FLAG_ACTIVITY_SINGLE_TOP)
                },
            PENDING_INTENT_FLAGS,
        )

    private fun repostPendingIntent(context: Context): PendingIntent =
        PendingIntent.getBroadcast(
            context,
            REQUEST_CODE_REPOST,
            QuickBookEntryNotificationReceiver.repostIntent(context),
            PENDING_INTENT_FLAGS,
        )

    private fun disablePendingIntent(context: Context): PendingIntent =
        PendingIntent.getBroadcast(
            context,
            REQUEST_CODE_DISABLE,
            QuickBookEntryNotificationReceiver.disableIntent(context),
            PENDING_INTENT_FLAGS,
        )
}
