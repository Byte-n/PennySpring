package com.pennyspring.quickbook.widget

import android.app.Notification
import android.app.NotificationChannel
import android.app.NotificationManager
import android.content.Context
import android.os.Build
import androidx.core.app.NotificationCompat
import androidx.core.content.ContextCompat
import com.pennyspring.R

/** 小组件直接记账的前台服务通知。 */
object QuickTemplateWidgetNotifications {
    const val CHANNEL_ID = "quick_template_record"
    const val NOTIFICATION_ID = 3101

    fun recordingNotification(context: Context): Notification {
        ensureChannel(context)
        return NotificationCompat
            .Builder(context, CHANNEL_ID)
            .setSmallIcon(R.drawable.ic_quick_book_notification)
            .setColor(ContextCompat.getColor(context, R.color.quick_book_primary))
            .setContentTitle(context.getString(R.string.quick_template_widget_recording_title))
            .setContentText(context.getString(R.string.quick_template_widget_recording_text))
            .setPriority(NotificationCompat.PRIORITY_LOW)
            .setOngoing(true)
            .build()
    }

    private fun ensureChannel(context: Context) {
        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.O) {
            return
        }
        val manager = context.getSystemService(NotificationManager::class.java) ?: return
        if (manager.getNotificationChannel(CHANNEL_ID) != null) {
            return
        }
        manager.createNotificationChannel(
            NotificationChannel(
                CHANNEL_ID,
                context.getString(R.string.quick_template_widget_channel_name),
                NotificationManager.IMPORTANCE_LOW,
            ),
        )
    }
}
