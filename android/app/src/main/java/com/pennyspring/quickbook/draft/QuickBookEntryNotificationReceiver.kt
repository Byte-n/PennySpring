package com.pennyspring.quickbook.draft

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent

/**
 * 常驻通知入口的删除与关闭动作。
 *
 * 用户划掉通知时自动重发；用户点「关闭入口」时落盘一次性关闭标记并取消通知，
 * JS 在启动/回前台/收到事件后消费标记并关闭设置开关。
 */
class QuickBookEntryNotificationReceiver : BroadcastReceiver() {
    companion object {
        private const val ACTION_REPOST = "com.pennyspring.quickbook.action.REPOST_ENTRY"
        private const val ACTION_DISABLE = "com.pennyspring.quickbook.action.DISABLE_ENTRY"

        fun repostIntent(context: Context): Intent =
            Intent(context, QuickBookEntryNotificationReceiver::class.java)
                .setAction(ACTION_REPOST)

        fun disableIntent(context: Context): Intent =
            Intent(context, QuickBookEntryNotificationReceiver::class.java)
                .setAction(ACTION_DISABLE)
    }

    override fun onReceive(
        context: Context,
        intent: Intent?,
    ) {
        when (intent?.action) {
            ACTION_REPOST -> repost(context)
            ACTION_DISABLE -> disable(context)
        }
    }

    private fun repost(context: Context) {
        val shouldRepost =
            QuickBookEntryNotificationPolicy.shouldRepost(
                entryEnabled = QuickBookDraftPrefs.isFloatingBallEnabled(context),
                entryMode = QuickBookDraftPrefs.getEntryMode(context),
                notificationsAllowed = QuickBookDraftNotifications.canPostNotifications(context),
                disabledByUser = QuickBookDraftPrefs.isEntryDisabledByUser(context),
            )
        if (shouldRepost) {
            QuickBookDraftNotifications.postEntryTrigger(context)
        }
    }

    private fun disable(context: Context) {
        QuickBookDraftPrefs.setFloatingBallEnabled(context, false)
        QuickBookDraftPrefs.setEntryDisabledByUser(context, true)
        QuickBookDraftNotifications.cancelEntryTrigger(context)
        FloatingBallService.stop(context)
        QuickBookDraftEvents.emitEntryDisabledByUser()
    }
}
