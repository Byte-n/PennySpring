package com.pennyspring.quickbook.draft

import android.content.Context
import android.content.SharedPreferences

/**
 * 截图记账草稿的轻量设备级偏好。
 *
 * 只保存当前账本与悬浮球开关，草稿正文仍以本地 SQLite 为准；
 * 该文件不参与备份与账本同步。
 */
object QuickBookDraftPrefs {
    const val PREFS_NAME = "quick_book_draft_prefs"

    private const val KEY_CURRENT_BOOK_ID = "current_book_id"
    private const val KEY_FLOATING_BALL_ENABLED = "floating_ball_enabled"
    private const val DEFAULT_BOOK_ID = 0

    private fun prefs(context: Context): SharedPreferences =
        context.applicationContext.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)

    fun getCurrentBookId(context: Context): Int = prefs(context).getInt(KEY_CURRENT_BOOK_ID, DEFAULT_BOOK_ID)

    fun setCurrentBookId(
        context: Context,
        bookId: Int,
    ) {
        prefs(context).edit().putInt(KEY_CURRENT_BOOK_ID, bookId).apply()
    }

    fun isFloatingBallEnabled(context: Context): Boolean = prefs(context).getBoolean(KEY_FLOATING_BALL_ENABLED, false)

    fun setFloatingBallEnabled(
        context: Context,
        enabled: Boolean,
    ) {
        prefs(context).edit().putBoolean(KEY_FLOATING_BALL_ENABLED, enabled).apply()
    }
}
