package com.pennyspring.quickbook.draft

import android.util.Log
import com.facebook.react.bridge.ReactApplicationContext

/**
 * 悬浮球原生动作回传 JS 的桥。
 *
 * 原生长按菜单直接写 SharedPreferences，JS 运行时不存在时事件静默丢弃，
 * 下次启动由 JS 读取原生列表补齐。
 */
object QuickBookDraftEvents {
    private const val TAG = "QuickBookDraftEvents"

    const val EVENT_EXCLUDED_PACKAGE_ADDED = "QuickBookDraftExcludedPackageAdded"
    const val EVENT_ENTRY_DISABLED_BY_USER = "QuickBookDraftEntryDisabledByUser"

    @Volatile
    private var reactContext: ReactApplicationContext? = null

    fun attach(context: ReactApplicationContext) {
        reactContext = context
    }

    fun detach(context: ReactApplicationContext) {
        if (reactContext === context) {
            reactContext = null
        }
    }

    fun emitExcludedPackageAdded(packageName: String) {
        val context = reactContext ?: return
        try {
            context.emitDeviceEvent(EVENT_EXCLUDED_PACKAGE_ADDED, packageName)
        } catch (error: Exception) {
            Log.w(TAG, "发送排除应用事件失败", error)
        }
    }

    fun emitEntryDisabledByUser() {
        val context = reactContext ?: return
        try {
            context.emitDeviceEvent(EVENT_ENTRY_DISABLED_BY_USER, true)
        } catch (error: Exception) {
            Log.w(TAG, "发送入口关闭事件失败", error)
        }
    }
}
