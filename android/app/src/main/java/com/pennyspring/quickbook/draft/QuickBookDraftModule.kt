package com.pennyspring.quickbook.draft

import android.Manifest
import android.content.Intent
import android.content.pm.PackageManager
import android.net.Uri
import android.os.Build
import android.provider.Settings
import android.util.Log
import androidx.core.app.NotificationManagerCompat
import androidx.core.content.ContextCompat
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod

/**
 * 截图记账草稿 JS 桥。
 *
 * 只暴露权限状态、当前账本与悬浮球开关，不直接操作草稿数据。
 */
class QuickBookDraftModule(
    private val reactContext: ReactApplicationContext,
) : ReactContextBaseJavaModule(reactContext) {
    companion object {
        private const val TAG = "QuickBookDraftModule"
        private const val ERROR_STATUS = "QUICK_BOOK_DRAFT_STATUS_FAILED"
    }

    override fun getName(): String = "QuickBookDraft"

    @ReactMethod
    fun getStatus(promise: Promise) {
        try {
            val status =
                Arguments.createMap().apply {
                    putBoolean("overlayPermission", Settings.canDrawOverlays(reactContext))
                    putBoolean("notificationPermission", hasNotificationPermission())
                    putBoolean("floatingBallRunning", FloatingBallService.isRunning())
                    putInt("currentBookId", QuickBookDraftPrefs.getCurrentBookId(reactContext))
                    putBoolean("supported", true)
                }
            promise.resolve(status)
        } catch (error: Exception) {
            promise.reject(ERROR_STATUS, error)
        }
    }

    @ReactMethod
    fun openOverlaySettings() {
        startSettings(
            Intent(Settings.ACTION_MANAGE_OVERLAY_PERMISSION, packageUri()).addFlags(Intent.FLAG_ACTIVITY_NEW_TASK),
        )
    }

    @ReactMethod
    fun openNotificationSettings() {
        val intent =
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                Intent(Settings.ACTION_APP_NOTIFICATION_SETTINGS)
                    .putExtra(Settings.EXTRA_APP_PACKAGE, reactContext.packageName)
            } else {
                Intent(Settings.ACTION_APPLICATION_DETAILS_SETTINGS, packageUri())
            }
        startSettings(intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK))
    }

    @ReactMethod
    fun startFloatingBall(promise: Promise) {
        try {
            promise.resolve(FloatingBallService.start(reactContext))
        } catch (error: Exception) {
            promise.reject(ERROR_STATUS, error)
        }
    }

    @ReactMethod
    fun stopFloatingBall() {
        FloatingBallService.stop(reactContext)
    }

    @ReactMethod
    fun setCurrentBookId(booksId: Double) {
        QuickBookDraftPrefs.setCurrentBookId(reactContext, booksId.toInt())
    }

    @ReactMethod
    fun setFloatingBallEnabled(enabled: Boolean) {
        QuickBookDraftPrefs.setFloatingBallEnabled(reactContext, enabled)
    }

    @ReactMethod
    fun isFloatingBallRunning(promise: Promise) {
        promise.resolve(FloatingBallService.isRunning())
    }

    @ReactMethod
    fun cleanupOrphanImages(promise: Promise) {
        try {
            promise.resolve(QuickBookDraftImageCleaner.cleanup(reactContext))
        } catch (error: Exception) {
            promise.reject(ERROR_STATUS, error)
        }
    }

    private fun hasNotificationPermission(): Boolean {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            val permission =
                ContextCompat.checkSelfPermission(reactContext, Manifest.permission.POST_NOTIFICATIONS)
            if (permission != PackageManager.PERMISSION_GRANTED) {
                return false
            }
        }
        return NotificationManagerCompat.from(reactContext).areNotificationsEnabled()
    }

    private fun packageUri(): Uri = Uri.parse("package:${reactContext.packageName}")

    private fun startSettings(intent: Intent) {
        try {
            reactContext.startActivity(intent)
        } catch (error: Exception) {
            // 部分 OEM 未实现标准设置页，回到应用详情页兜底。
            Log.w(TAG, "打开系统设置失败", error)
            try {
                reactContext.startActivity(
                    Intent(Settings.ACTION_APPLICATION_DETAILS_SETTINGS, packageUri())
                        .addFlags(Intent.FLAG_ACTIVITY_NEW_TASK),
                )
            } catch (fallbackError: Exception) {
                Log.w(TAG, "打开应用详情设置失败", fallbackError)
            }
        }
    }
}
