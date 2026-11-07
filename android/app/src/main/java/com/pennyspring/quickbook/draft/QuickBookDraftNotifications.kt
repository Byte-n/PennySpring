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
    const val NOTIFICATION_ID_RESULT = 3103

    private const val REQUEST_CODE_OPEN_APP = 4101
    private const val REQUEST_CODE_DRAFT_BASE = 5000
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

    fun generatingNotification(
        context: Context,
        draftId: String,
    ): Notification {
        ensureChannels(context)
        val builder =
            baseBuilder(context, CHANNEL_DRAFT, NotificationCompat.PRIORITY_DEFAULT)
                .setContentTitle(context.getString(R.string.quick_book_notification_generating_title))
                .setContentText(context.getString(R.string.quick_book_notification_generating_text))
                .setOngoing(true)
                .setProgress(0, 0, true)
                .setCategory(NotificationCompat.CATEGORY_PROGRESS)
        if (draftId.isNotBlank()) {
            builder.setContentIntent(draftPendingIntent(context, draftId))
        } else {
            builder.setContentIntent(openAppPendingIntent(context))
        }
        return builder.build()
    }

    fun successNotification(
        context: Context,
        draftId: String,
        itemCount: Int,
    ): Notification {
        ensureChannels(context)
        return baseBuilder(context, CHANNEL_DRAFT, NotificationCompat.PRIORITY_DEFAULT)
            .setContentTitle(context.getString(R.string.quick_book_notification_success_title))
            .setContentText(context.getString(R.string.quick_book_notification_success_text, itemCount))
            .setContentIntent(draftPendingIntent(context, draftId))
            .setAutoCancel(true)
            .build()
    }

    fun failureNotification(
        context: Context,
        draftId: String,
    ): Notification {
        ensureChannels(context)
        return baseBuilder(context, CHANNEL_DRAFT, NotificationCompat.PRIORITY_DEFAULT)
            .setContentTitle(context.getString(R.string.quick_book_notification_failure_title))
            .setContentText(context.getString(R.string.quick_book_notification_failure_text))
            .setContentIntent(draftPendingIntent(context, draftId))
            .setAutoCancel(true)
            .build()
    }

    /** 结果通知只在系统通知开关打开时展示；前台通知必须由服务侧无条件 startForeground。 */
    fun notifyIfAllowed(
        context: Context,
        notificationId: Int,
        notification: Notification,
    ) {
        if (!canPostNotifications(context)) {
            Log.i(TAG, "通知已关闭，跳过结果通知 $notificationId")
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

    private fun draftPendingIntent(
        context: Context,
        draftId: String,
    ): PendingIntent {
        val intent =
            Intent(context, MainActivity::class.java).apply {
                action = Intent.ACTION_VIEW
                data = QuickBookDraftTaskContract.draftDeepLink(draftId)
                flags =
                    Intent.FLAG_ACTIVITY_NEW_TASK or
                    Intent.FLAG_ACTIVITY_SINGLE_TOP or
                    Intent.FLAG_ACTIVITY_CLEAR_TOP
            }
        val requestCode = REQUEST_CODE_DRAFT_BASE + draftId.hashCode()
        return PendingIntent.getActivity(context, requestCode, intent, PENDING_INTENT_FLAGS)
    }
}
