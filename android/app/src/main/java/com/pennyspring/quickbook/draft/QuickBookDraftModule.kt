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
import com.facebook.react.bridge.ReadableArray
import com.facebook.react.bridge.ReadableMap
import java.util.concurrent.Executors

/**
 * 截图记账草稿 JS 桥。
 *
 * 只暴露权限状态、当前账本与截图记账入口开关，不直接操作草稿数据。
 */
class QuickBookDraftModule(
    private val reactContext: ReactApplicationContext,
) : ReactContextBaseJavaModule(reactContext) {
    companion object {
        private const val TAG = "QuickBookDraftModule"
        private const val ERROR_STATUS = "QUICK_BOOK_DRAFT_STATUS_FAILED"
        private const val ERROR_APPS = "QUICK_BOOK_DRAFT_APPS_FAILED"
    }

    private val appListExecutor = Executors.newSingleThreadExecutor()

    override fun getName(): String = "QuickBookDraft"

    override fun initialize() {
        super.initialize()
        QuickBookDraftEvents.attach(reactApplicationContext)
    }

    override fun invalidate() {
        QuickBookDraftEvents.detach(reactApplicationContext)
        super.invalidate()
    }

    @ReactMethod
    fun getStatus(promise: Promise) {
        try {
            val status =
                Arguments.createMap().apply {
                    putBoolean("overlayPermission", Settings.canDrawOverlays(reactContext))
                    putBoolean("notificationPermission", hasNotificationPermission())
                    putBoolean(
                        "accessibilityPermission",
                        ScreenshotAccessibilityService.isEnabled(reactContext),
                    )
                    putBoolean("floatingBallRunning", FloatingBallService.isRunning())
                    putBoolean(
                        "notificationTriggerActive",
                        QuickBookDraftNotifications.isEntryTriggerActive(reactContext),
                    )
                    putBoolean(
                        "entryDisabledByUser",
                        QuickBookDraftPrefs.isEntryDisabledByUser(reactContext),
                    )
                    putBoolean("supported", ScreenshotAccessibilityService.isSupported())
                    putArray(
                        "excludedPackages",
                        Arguments.createArray().apply {
                            QuickBookDraftPrefs.getExcludedPackages(reactContext).forEach { pushString(it) }
                        },
                    )
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
    fun openAccessibilitySettings() {
        startSettings(
            Intent(Settings.ACTION_ACCESSIBILITY_SETTINGS).addFlags(Intent.FLAG_ACTIVITY_NEW_TASK),
        )
    }

    @ReactMethod
    fun getInstalledApps(promise: Promise) {
        appListExecutor.execute {
            try {
                val apps = QuickBookAppCatalog.list(reactContext)
                val result = Arguments.createArray()
                apps.forEach { app ->
                    result.pushMap(
                        Arguments.createMap().apply {
                            putString("packageName", app.packageName)
                            putString("label", app.label)
                            putString("icon", app.iconDataUrl)
                        },
                    )
                }
                promise.resolve(result)
            } catch (error: Exception) {
                Log.w(TAG, "读取应用列表失败", error)
                promise.reject(ERROR_APPS, error)
            }
        }
    }

    @ReactMethod
    fun setExcludedPackages(packages: ReadableArray) {
        val normalized = HashSet<String>()
        for (index in 0 until packages.size()) {
            val packageName = packages.getString(index)?.trim().orEmpty()
            if (packageName.isNotEmpty()) {
                normalized.add(packageName)
            }
        }
        QuickBookDraftPrefs.setExcludedPackages(reactContext, normalized)
        FloatingBallService.updateExcludedPackages(normalized)
    }

    @ReactMethod
    fun startEntry(
        mode: String,
        userInitiated: Boolean,
        promise: Promise,
    ) {
        val entryMode = QuickBookEntryMode.fromWire(mode)
        if (entryMode == null) {
            promise.resolve(false)
            return
        }
        if (QuickBookCaptureCatalogStore.currentBook(reactContext) == null) {
            promise.resolve(false)
            return
        }
        if (!userInitiated) {
            if (QuickBookDraftPrefs.isEntryDisabledByUser(reactContext)) {
                QuickBookDraftPrefs.setFloatingBallEnabled(reactContext, false)
                promise.resolve(false)
                return
            }
            if (!QuickBookDraftPrefs.isFloatingBallEnabled(reactContext)) {
                promise.resolve(false)
                return
            }
        } else {
            QuickBookDraftPrefs.setEntryDisabledByUser(reactContext, false)
        }
        try {
            val started =
                when (entryMode) {
                    QuickBookEntryMode.FLOATING_BALL -> startFloatingBallEntry()
                    QuickBookEntryMode.NOTIFICATION -> startNotificationEntry()
                }
            promise.resolve(started)
        } catch (error: Exception) {
            promise.reject(ERROR_STATUS, error)
        }
    }

    private fun startFloatingBallEntry(): Boolean {
        val started = FloatingBallService.start(reactContext)
        if (started) {
            QuickBookDraftPrefs.setFloatingBallEnabled(reactContext, true)
            QuickBookDraftPrefs.setEntryMode(reactContext, QuickBookEntryMode.FLOATING_BALL.wireValue)
            QuickBookDraftPrefs.setEntryDisabledByUser(reactContext, false)
            QuickBookDraftNotifications.cancelEntryTrigger(reactContext)
        }
        return started
    }

    private fun startNotificationEntry(): Boolean {
        val previousEnabled = QuickBookDraftPrefs.isFloatingBallEnabled(reactContext)
        val previousMode = QuickBookDraftPrefs.getEntryMode(reactContext)
        QuickBookDraftPrefs.setFloatingBallEnabled(reactContext, true)
        QuickBookDraftPrefs.setEntryMode(reactContext, QuickBookEntryMode.NOTIFICATION.wireValue)
        QuickBookDraftPrefs.setEntryDisabledByUser(reactContext, false)
        val posted = QuickBookDraftNotifications.postEntryTrigger(reactContext)
        if (posted) {
            FloatingBallService.stop(reactContext)
            return true
        }
        QuickBookDraftPrefs.setFloatingBallEnabled(reactContext, previousEnabled)
        QuickBookDraftPrefs.setEntryMode(reactContext, previousMode)
        return false
    }

    @ReactMethod
    fun stopEntry() {
        QuickBookDraftPrefs.setFloatingBallEnabled(reactContext, false)
        QuickBookDraftPrefs.setEntryDisabledByUser(reactContext, false)
        FloatingBallService.stop(reactContext)
        QuickBookDraftNotifications.cancelEntryTrigger(reactContext)
    }

    @ReactMethod
    fun setFloatingBallEnabled(enabled: Boolean) {
        QuickBookDraftPrefs.setFloatingBallEnabled(reactContext, enabled)
    }

    @ReactMethod
    fun consumeEntryDisabledByUser(promise: Promise) {
        try {
            promise.resolve(QuickBookDraftPrefs.consumeEntryDisabledByUser(reactContext))
        } catch (error: Exception) {
            promise.reject(ERROR_STATUS, error)
        }
    }

    @ReactMethod
    fun setCaptureCatalog(
        catalogJson: String,
        promise: Promise,
    ) {
        try {
            promise.resolve(QuickBookCaptureCatalogStore.write(reactContext, catalogJson))
        } catch (error: Exception) {
            promise.reject(ERROR_STATUS, error)
        }
    }

    @ReactMethod
    fun reportDraftOutcome(
        outcome: ReadableMap,
        promise: Promise,
    ) {
        try {
            val draftId = outcome.getString("draftId")?.trim().orEmpty()
            if (draftId.isEmpty()) {
                throw IllegalArgumentException("草稿 id 不能为空")
            }
            val status = outcome.getString("status")
            if (status != "success" && status != "failed") {
                throw IllegalArgumentException("草稿结果状态不合法")
            }
            val itemCount = if (outcome.hasKey("itemCount")) outcome.getInt("itemCount") else 0
            QuickBookDraftTaskResults.put(
                QuickBookDraftTaskResults.Outcome(
                    draftId = draftId,
                    succeeded = status == "success",
                    itemCount = itemCount.coerceAtLeast(0),
                ),
            )
            promise.resolve(null)
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
