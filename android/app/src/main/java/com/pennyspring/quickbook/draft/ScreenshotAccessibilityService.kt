package com.pennyspring.quickbook.draft

import android.accessibilityservice.AccessibilityService
import android.accessibilityservice.AccessibilityServiceInfo
import android.content.Context
import android.content.Intent
import android.graphics.Bitmap
import android.os.Build
import android.os.Handler
import android.os.Looper
import android.util.Log
import android.view.Display
import android.view.accessibility.AccessibilityEvent
import android.view.accessibility.AccessibilityManager
import android.view.inputmethod.InputMethodManager
import androidx.annotation.RequiresApi
import java.util.concurrent.ExecutorService
import java.util.concurrent.Executors
import java.util.concurrent.atomic.AtomicBoolean

/**
 * 无障碍截图服务：通过 AccessibilityService#takeScreenshot 抓取一帧屏幕。
 *
 * 与 MediaProjection 相比，用户只需在系统设置中手动启用一次本服务，
 * 之后每次自由截图不再弹出屏幕录制授权；代价是需要无障碍权限。
 */
class ScreenshotAccessibilityService : AccessibilityService() {
    companion object {
        private const val TAG = "QuickBookScreenshot"
        private const val SYSTEM_UI_PACKAGE = "com.android.systemui"

        @Volatile
        private var instance: ScreenshotAccessibilityService? = null

        private val captureExecutor: ExecutorService = Executors.newSingleThreadExecutor()

        /** 最近一次前台应用包名；临时系统窗口与输入法不会覆盖它。 */
        @Volatile
        var currentForegroundPackage: String? = null
            private set

        /** takeScreenshot 从 Android 11 开始提供。 */
        fun isSupported(): Boolean = Build.VERSION.SDK_INT >= Build.VERSION_CODES.R

        fun isEnabled(context: Context): Boolean {
            if (!isSupported()) {
                return false
            }
            val manager = context.getSystemService(Context.ACCESSIBILITY_SERVICE) as? AccessibilityManager ?: return false
            if (!manager.isEnabled) {
                return false
            }
            return manager
                .getEnabledAccessibilityServiceList(AccessibilityServiceInfo.FEEDBACK_ALL_MASK)
                .any { info ->
                    val serviceInfo = info.resolveInfo?.serviceInfo ?: return@any false
                    serviceInfo.packageName == context.packageName &&
                        serviceInfo.name == ScreenshotAccessibilityService::class.java.name
                }
        }

        /**
         * 抓取当前屏幕。回调在主线程触发。
         *
         * @return false 表示服务未连接或系统版本不支持，此时不会触发回调。
         */
        fun capture(callback: (Bitmap?) -> Unit): Boolean {
            val service = instance ?: return false
            return service.requestCapture(callback)
        }
    }

    private val mainHandler = Handler(Looper.getMainLooper())
    private var transientPackages: Set<String> = setOf(SYSTEM_UI_PACKAGE)

    override fun onServiceConnected() {
        super.onServiceConnected()
        instance = this
        transientPackages = buildTransientPackages()
    }

    override fun onAccessibilityEvent(event: AccessibilityEvent?) {
        if (event?.eventType != AccessibilityEvent.TYPE_WINDOW_STATE_CHANGED) {
            return
        }
        val packageName = event.packageName?.toString()?.takeIf { it.isNotBlank() } ?: return
        if (packageName in transientPackages || packageName == currentForegroundPackage) {
            return
        }
        currentForegroundPackage = packageName
        FloatingBallService.onForegroundPackageChanged(packageName)
    }

    override fun onInterrupt() {
        // 无持续反馈，忽略中断。
    }

    override fun onUnbind(intent: Intent?): Boolean {
        instance = null
        return super.onUnbind(intent)
    }

    override fun onDestroy() {
        instance = null
        super.onDestroy()
    }

    /** 输入法、系统弹层会触发窗口事件，不能据此判断前台应用。 */
    private fun buildTransientPackages(): Set<String> {
        val packages = mutableSetOf(SYSTEM_UI_PACKAGE)
        val inputMethodManager = getSystemService(InputMethodManager::class.java)
        inputMethodManager?.enabledInputMethodList?.forEach { method ->
            method.packageName?.takeIf { it.isNotBlank() }?.let(packages::add)
        }
        return packages
    }

    @RequiresApi(Build.VERSION_CODES.R)
    private fun requestCapture(callback: (Bitmap?) -> Unit): Boolean {
        val handled = AtomicBoolean(false)
        return try {
            takeScreenshot(
                Display.DEFAULT_DISPLAY,
                captureExecutor,
                object : TakeScreenshotCallback {
                    override fun onSuccess(screenshot: ScreenshotResult) {
                        if (!handled.compareAndSet(false, true)) {
                            return
                        }
                        val bitmap = screenshot.toSoftwareBitmap()
                        mainHandler.post { callback(bitmap) }
                    }

                    override fun onFailure(errorCode: Int) {
                        if (!handled.compareAndSet(false, true)) {
                            return
                        }
                        Log.w(TAG, "无障碍截图失败，错误码 $errorCode")
                        mainHandler.post { callback(null) }
                    }
                },
            )
            true
        } catch (error: Exception) {
            Log.w(TAG, "发起无障碍截图失败", error)
            false
        }
    }

    @RequiresApi(Build.VERSION_CODES.R)
    private fun ScreenshotResult.toSoftwareBitmap(): Bitmap? {
        val buffer = hardwareBuffer
        return try {
            val wrapped = Bitmap.wrapHardwareBuffer(buffer, colorSpace) ?: return null
            val software = wrapped.copy(Bitmap.Config.ARGB_8888, false)
            if (software !== wrapped) {
                wrapped.recycle()
            }
            software
        } catch (error: Exception) {
            Log.w(TAG, "转换无障碍截图失败", error)
            null
        } finally {
            buffer.close()
        }
    }
}
