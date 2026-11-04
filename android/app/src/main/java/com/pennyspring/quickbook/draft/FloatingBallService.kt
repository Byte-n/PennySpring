package com.pennyspring.quickbook.draft

import android.animation.ValueAnimator
import android.annotation.SuppressLint
import android.app.Service
import android.content.Context
import android.content.Intent
import android.content.pm.ServiceInfo
import android.content.res.Configuration
import android.graphics.PixelFormat
import android.graphics.Point
import android.graphics.Rect
import android.net.Uri
import android.os.Build
import android.provider.Settings
import android.util.Log
import android.view.Gravity
import android.view.MotionEvent
import android.view.View
import android.view.ViewConfiguration
import android.view.WindowManager
import android.view.animation.DecelerateInterpolator
import android.widget.FrameLayout
import android.widget.ImageView
import android.widget.PopupWindow
import android.widget.Toast
import androidx.core.app.ServiceCompat
import androidx.core.content.ContextCompat
import com.pennyspring.MainActivity
import com.pennyspring.R
import java.util.concurrent.atomic.AtomicBoolean
import kotlin.math.abs
import kotlin.math.roundToInt

/**
 * 系统级悬浮球：自由截图、打开 App、AI 助手。
 *
 * - 窗口类型：API 26+ TYPE_APPLICATION_OVERLAY，以下 TYPE_PHONE。
 * - Android 12+ 后台启动 Activity 受限：点击动作来自用户直接触摸悬浮窗，
 *   且 App 已持有 SYSTEM_ALERT_WINDOW，属于系统允许的场景；仍对失败做兜底。
 * - OEM 后台限制可能回收服务，用户强行停止 App 后需重新打开 App 才能再启动悬浮球。
 */
class FloatingBallService : Service() {
    companion object {
        private const val TAG = "FloatingBallService"
        private const val NOTIFICATION_ID = QuickBookDraftNotifications.NOTIFICATION_ID_FLOATING

        private const val WINDOW_SIZE_DP = 72
        private const val BALL_SIZE_DP = 48
        private const val ICON_SIZE_DP = 22
        private const val INITIAL_BOTTOM_MARGIN_DP = 52
        private const val BALL_ELEVATION_DP = 10
        private const val SNAP_DURATION_MS = 180L

        private val running = AtomicBoolean(false)
        private val lock = Any()

        @Volatile
        private var instance: FloatingBallService? = null

        /** @return false 表示没有悬浮窗权限；已运行返回 true。 */
        @JvmStatic
        fun start(context: Context): Boolean {
            if (!Settings.canDrawOverlays(context)) {
                return false
            }
            synchronized(lock) {
                if (running.get()) {
                    return true
                }
                running.set(true)
            }
            return try {
                ContextCompat.startForegroundService(context, Intent(context, FloatingBallService::class.java))
                true
            } catch (error: Exception) {
                running.set(false)
                Log.w(TAG, "启动悬浮球失败", error)
                false
            }
        }

        @JvmStatic
        fun stop(context: Context) {
            context.stopService(Intent(context, FloatingBallService::class.java))
            running.set(false)
        }

        @JvmStatic
        fun isRunning(): Boolean = running.get()

        /** 截图 Activity 启动前隐藏悬浮球，避免被 MediaProjection 截入。 */
        @JvmStatic
        fun hideForCapture() {
            instance?.hideOverlay()
        }

        /** 截图 Activity 结束后恢复悬浮球。 */
        @JvmStatic
        fun restoreAfterCapture() {
            instance?.restoreOverlay()
        }
    }

    private lateinit var windowManager: WindowManager
    private var ballView: View? = null
    private var windowParams: WindowManager.LayoutParams? = null
    private var menuPopup: PopupWindow? = null
    private var snapAnimator: ValueAnimator? = null
    private var isOverlayAttached = false

    override fun onBind(intent: Intent?): android.os.IBinder? = null

    override fun onCreate() {
        super.onCreate()
        instance = this
        windowManager = getSystemService(WindowManager::class.java)
        // 服务由 startForegroundService 启动，必须先进入前台，再做权限校验。
        startAsForegroundService()
        if (!Settings.canDrawOverlays(this)) {
            running.set(false)
            stopSelf()
            return
        }
        QuickBookDraftNotifications.ensureChannels(this)
        setupOverlay()
        running.set(true)
    }

    override fun onStartCommand(
        intent: Intent?,
        flags: Int,
        startId: Int,
    ): Int {
        startAsForegroundService()
        if (!Settings.canDrawOverlays(this)) {
            running.set(false)
            stopSelf()
            return START_NOT_STICKY
        }
        if (!isOverlayAttached) {
            setupOverlay()
        }
        running.set(true)
        return START_NOT_STICKY
    }

    override fun onConfigurationChanged(newConfig: Configuration) {
        super.onConfigurationChanged(newConfig)
        dismissMenu()
        val params = windowParams ?: return
        clampToScreen(params)
        updateOverlayLayout()
    }

    override fun onDestroy() {
        dismissMenu()
        snapAnimator?.cancel()
        snapAnimator = null
        removeOverlayView()
        ballView = null
        windowParams = null
        ServiceCompat.stopForeground(this, ServiceCompat.STOP_FOREGROUND_REMOVE)
        running.set(false)
        if (instance === this) {
            instance = null
        }
        super.onDestroy()
    }

    private fun startAsForegroundService() {
        // Android 13+ 通知权限被拒时通知可能不展示，但前台服务仍必须调用 startForeground。
        // Android 14+ specialUse 类型在此显式传入，manifest 中同时声明了 subtype 说明。
        val notification = QuickBookDraftNotifications.floatingNotification(this)
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

    private fun setupOverlay() {
        if (isOverlayAttached) {
            return
        }
        val size = dp(WINDOW_SIZE_DP)
        val params = windowParams ?: createWindowParams(size)
        params.width = size
        params.height = size
        clampToScreen(params)
        val view = ballView ?: createBallView().also { ballView = it }
        try {
            windowManager.addView(view, params)
            windowParams = params
            isOverlayAttached = true
        } catch (error: Exception) {
            Log.w(TAG, "添加悬浮球窗口失败", error)
            running.set(false)
            stopSelf()
        }
    }

    private fun createWindowParams(size: Int): WindowManager.LayoutParams {
        val bounds = screenBounds()
        return WindowManager
            .LayoutParams(
                size,
                size,
                overlayWindowType(),
                WindowManager.LayoutParams.FLAG_NOT_FOCUSABLE or
                    WindowManager.LayoutParams.FLAG_NOT_TOUCH_MODAL or
                    WindowManager.LayoutParams.FLAG_LAYOUT_IN_SCREEN,
                PixelFormat.TRANSLUCENT,
            ).apply {
                gravity = Gravity.TOP or Gravity.START
                x = bounds.width() - size
                y = bounds.height() - size - dp(INITIAL_BOTTOM_MARGIN_DP) - systemBarHeight("navigation_bar_height")
            }
    }

    private fun createBallView(): View {
        val container = FrameLayout(this)
        val ball =
            FrameLayout(this).apply {
                background = ContextCompat.getDrawable(this@FloatingBallService, R.drawable.bg_quick_book_ball)
                elevation = dp(BALL_ELEVATION_DP).toFloat()
                contentDescription = getString(R.string.quick_book_floating_ball_description)
                layoutParams =
                    FrameLayout.LayoutParams(
                        dp(BALL_SIZE_DP),
                        dp(BALL_SIZE_DP),
                        Gravity.CENTER,
                    )
            }
        val icon =
            ImageView(this).apply {
                setImageResource(R.drawable.ic_quick_book_ball)
                layoutParams =
                    FrameLayout.LayoutParams(
                        dp(ICON_SIZE_DP),
                        dp(ICON_SIZE_DP),
                        Gravity.CENTER,
                    )
            }
        ball.addView(icon)
        container.addView(ball)
        container.setOnTouchListener(BallTouchListener())
        return container
    }

    private fun hideOverlay() {
        dismissMenu()
        removeOverlayView()
    }

    private fun restoreOverlay() {
        if (!Settings.canDrawOverlays(this)) {
            running.set(false)
            stopSelf()
            return
        }
        setupOverlay()
    }

    private fun removeOverlayView() {
        if (!isOverlayAttached) {
            return
        }
        isOverlayAttached = false
        val view = ballView ?: return
        try {
            windowManager.removeView(view)
        } catch (error: IllegalArgumentException) {
            Log.w(TAG, "移除悬浮球窗口失败", error)
        }
    }

    private fun clampToScreen(params: WindowManager.LayoutParams) {
        val bounds = screenBounds()
        val minY = systemBarHeight("status_bar_height")
        val maxX = maxOf(0, bounds.width() - params.width)
        val maxY = maxOf(minY, bounds.height() - params.height - systemBarHeight("navigation_bar_height"))
        params.x = params.x.coerceIn(0, maxX)
        params.y = params.y.coerceIn(minY, maxY)
    }

    private fun updateOverlayLayout() {
        val view = ballView ?: return
        val params = windowParams ?: return
        if (!isOverlayAttached) {
            return
        }
        try {
            windowManager.updateViewLayout(view, params)
        } catch (error: IllegalArgumentException) {
            Log.w(TAG, "更新悬浮球位置失败", error)
        }
    }

    private fun snapToEdge() {
        val params = windowParams ?: return
        val bounds = screenBounds()
        val maxX = maxOf(0, bounds.width() - params.width)
        val targetX = if (params.x + params.width / 2 < bounds.width() / 2) 0 else maxX
        if (params.x == targetX) {
            return
        }
        snapAnimator?.cancel()
        snapAnimator =
            ValueAnimator.ofInt(params.x, targetX).apply {
                duration = SNAP_DURATION_MS
                interpolator = DecelerateInterpolator()
                addUpdateListener { animation ->
                    params.x = animation.animatedValue as Int
                    updateOverlayLayout()
                }
                start()
            }
    }

    private fun toggleMenu() {
        val anchor = ballView ?: return
        if (menuPopup?.isShowing == true) {
            dismissMenu()
            return
        }
        menuPopup =
            try {
                FloatingBallMenu.show(anchor) { action -> handleAction(action) }
            } catch (error: Exception) {
                Log.w(TAG, "展开悬浮球菜单失败", error)
                Toast.makeText(applicationContext, R.string.quick_book_toast_menu_failed, Toast.LENGTH_SHORT).show()
                null
            }
    }

    private fun dismissMenu() {
        menuPopup?.takeIf { it.isShowing }?.dismiss()
        menuPopup = null
    }

    private fun handleAction(action: FloatingBallAction) {
        when (action) {
            FloatingBallAction.CAPTURE -> launchCapture()
            FloatingBallAction.OPEN_APP -> launchMainActivity(null)
            FloatingBallAction.AI_ASSISTANT -> launchMainActivity(Uri.parse(QuickBookDraftTaskContract.AGENT_DEEP_LINK))
        }
    }

    private fun launchCapture() {
        hideOverlay()
        try {
            ScreenCaptureActivity.start(this)
        } catch (error: Exception) {
            Log.w(TAG, "打开自由截图失败", error)
            restoreOverlay()
            Toast.makeText(applicationContext, R.string.quick_book_toast_capture_failed, Toast.LENGTH_SHORT).show()
        }
    }

    private fun launchMainActivity(deepLink: Uri?) {
        val intent =
            Intent(this, MainActivity::class.java).apply {
                flags =
                    Intent.FLAG_ACTIVITY_NEW_TASK or
                    Intent.FLAG_ACTIVITY_SINGLE_TOP or
                    Intent.FLAG_ACTIVITY_CLEAR_TOP
                if (deepLink == null) {
                    action = Intent.ACTION_MAIN
                    addCategory(Intent.CATEGORY_LAUNCHER)
                } else {
                    action = Intent.ACTION_VIEW
                    data = deepLink
                }
            }
        try {
            startActivity(intent)
        } catch (error: Exception) {
            // Android 12+ 后台启动 Activity 受限或 OEM 拦截时给出提示，不崩溃。
            Log.w(TAG, "打开 PennySpring 失败", error)
            Toast.makeText(applicationContext, R.string.quick_book_toast_open_app_failed, Toast.LENGTH_SHORT).show()
        }
    }

    @SuppressLint("ClickableViewAccessibility")
    private inner class BallTouchListener : View.OnTouchListener {
        private val touchSlop = ViewConfiguration.get(this@FloatingBallService).scaledTouchSlop
        private var downRawX = 0f
        private var downRawY = 0f
        private var startX = 0
        private var startY = 0
        private var isDragging = false

        override fun onTouch(
            view: View,
            event: MotionEvent,
        ): Boolean {
            val params = windowParams ?: return false
            when (event.actionMasked) {
                MotionEvent.ACTION_DOWN -> {
                    downRawX = event.rawX
                    downRawY = event.rawY
                    startX = params.x
                    startY = params.y
                    isDragging = false
                    snapAnimator?.cancel()
                    view.isPressed = true
                    return true
                }

                MotionEvent.ACTION_MOVE -> {
                    val deltaX = (event.rawX - downRawX).toInt()
                    val deltaY = (event.rawY - downRawY).toInt()
                    if (!isDragging && (abs(deltaX) > touchSlop || abs(deltaY) > touchSlop)) {
                        isDragging = true
                        dismissMenu()
                    }
                    if (isDragging) {
                        params.x = startX + deltaX
                        params.y = startY + deltaY
                        clampToScreen(params)
                        updateOverlayLayout()
                    }
                    return true
                }

                MotionEvent.ACTION_UP -> {
                    view.isPressed = false
                    if (isDragging) {
                        snapToEdge()
                    } else {
                        view.performClick()
                        toggleMenu()
                    }
                    return true
                }

                MotionEvent.ACTION_CANCEL -> {
                    view.isPressed = false
                    if (isDragging) {
                        snapToEdge()
                    }
                    return true
                }
            }
            return false
        }
    }

    @Suppress("DEPRECATION")
    private fun screenBounds(): Rect =
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R) {
            windowManager.currentWindowMetrics.bounds
        } else {
            val display = windowManager.defaultDisplay
            val point = Point()
            display.getRealSize(point)
            Rect(0, 0, point.x, point.y)
        }

    @Suppress("DEPRECATION")
    private fun overlayWindowType(): Int =
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            WindowManager.LayoutParams.TYPE_APPLICATION_OVERLAY
        } else {
            WindowManager.LayoutParams.TYPE_PHONE
        }

    private fun systemBarHeight(name: String): Int {
        val resourceId = resources.getIdentifier(name, "dimen", "android")
        return if (resourceId > 0) resources.getDimensionPixelSize(resourceId) else 0
    }

    private fun dp(value: Int): Int = (value * resources.displayMetrics.density).roundToInt()
}
