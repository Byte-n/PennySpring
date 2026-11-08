package com.pennyspring.quickbook.draft

import android.animation.ValueAnimator
import android.annotation.SuppressLint
import android.app.Service
import android.content.Context
import android.content.Intent
import android.content.pm.ServiceInfo
import android.content.res.ColorStateList
import android.content.res.Configuration
import android.graphics.Color
import android.graphics.PixelFormat
import android.graphics.Point
import android.graphics.Rect
import android.graphics.drawable.GradientDrawable
import android.graphics.drawable.RippleDrawable
import android.os.Build
import android.os.Handler
import android.os.Looper
import android.provider.Settings
import android.util.Log
import android.util.TypedValue
import android.view.Gravity
import android.view.HapticFeedbackConstants
import android.view.MotionEvent
import android.view.View
import android.view.ViewConfiguration
import android.view.WindowManager
import android.view.animation.DecelerateInterpolator
import android.widget.FrameLayout
import android.widget.ImageView
import android.widget.LinearLayout
import android.widget.TextView
import android.widget.Toast
import androidx.core.app.ServiceCompat
import androidx.core.content.ContextCompat
import com.pennyspring.R
import java.util.concurrent.atomic.AtomicBoolean
import kotlin.math.abs
import kotlin.math.roundToInt

/**
 * 系统级悬浮球：点按直接进入自由截图，拖动只负责移动，长按弹出操作菜单。
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

        private const val WINDOW_SIZE_DP = 48
        private const val BALL_SIZE_DP = 48
        private const val INITIAL_BOTTOM_MARGIN_DP = 52
        private const val SNAP_DURATION_MS = 180L

        private const val MENU_WIDTH_DP = 196
        private const val MENU_ITEM_HEIGHT_DP = 48
        private const val MENU_ITEM_TEXT_SP = 15f
        private const val MENU_ITEM_HORIZONTAL_PADDING_DP = 16
        private const val MENU_CARD_PADDING_DP = 4
        private const val MENU_CORNER_RADIUS_DP = 12
        private const val MENU_ELEVATION_DP = 8
        private const val MENU_DIVIDER_DP = 1
        private const val MENU_MARGIN_DP = 8

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

        /** 截图 Activity 启动前隐藏悬浮球，避免被无障碍截图抓入。 */
        @JvmStatic
        fun hideForCapture() {
            instance?.hideOverlay()
        }

        /** 截图 Activity 结束后恢复悬浮球。 */
        @JvmStatic
        fun restoreAfterCapture() {
            instance?.restoreOverlay()
        }

        /** JS 侧排除列表变化；服务未运行时只依赖已落盘的偏好。 */
        @JvmStatic
        fun updateExcludedPackages(packages: Set<String>) {
            instance?.applyExcludedPackages(packages)
        }

        /** 无障碍服务报告前台应用变化。 */
        @JvmStatic
        fun onForegroundPackageChanged(packageName: String) {
            instance?.applyForegroundPackage(packageName)
        }
    }

    private lateinit var windowManager: WindowManager
    private var ballView: View? = null
    private var actionMenuView: View? = null
    private var windowParams: WindowManager.LayoutParams? = null
    private var snapAnimator: ValueAnimator? = null
    private var isOverlayAttached = false
    private val mainHandler = Handler(Looper.getMainLooper())
    private var excludedPackages: Set<String> = emptySet()
    private var foregroundPackage: String? = null
    private var isCaptureHidden = false
    private var isDestroyed = false

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
        excludedPackages = QuickBookDraftPrefs.getExcludedPackages(this)
        foregroundPackage = ScreenshotAccessibilityService.currentForegroundPackage
        syncOverlayVisibility()
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
            syncOverlayVisibility()
        }
        running.set(true)
        return START_NOT_STICKY
    }

    override fun onConfigurationChanged(newConfig: Configuration) {
        super.onConfigurationChanged(newConfig)
        dismissActionMenu()
        val params = windowParams ?: return
        clampToScreen(params)
        updateOverlayLayout()
        snapToEdge()
    }

    override fun onDestroy() {
        isDestroyed = true
        mainHandler.removeCallbacksAndMessages(null)
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
                        dp(BALL_SIZE_DP),
                        dp(BALL_SIZE_DP),
                        Gravity.CENTER,
                    )
            }
        ball.addView(icon)
        container.addView(ball)
        container.setOnTouchListener(BallTouchListener())
        return container
    }

    private fun hideOverlay() {
        isCaptureHidden = true
        syncOverlayVisibility()
    }

    private fun restoreOverlay() {
        if (!Settings.canDrawOverlays(this)) {
            running.set(false)
            stopSelf()
            return
        }
        isCaptureHidden = false
        syncOverlayVisibility()
    }

    private fun syncOverlayVisibility() {
        if (isDestroyed) {
            return
        }
        if (FloatingBallPolicy.shouldShow(foregroundPackage, excludedPackages, isCaptureHidden)) {
            setupOverlay()
        } else {
            removeOverlayView()
        }
    }

    private fun applyExcludedPackages(packages: Set<String>) {
        mainHandler.post {
            if (excludedPackages == packages) {
                return@post
            }
            excludedPackages = packages
            syncOverlayVisibility()
        }
    }

    private fun applyForegroundPackage(packageName: String) {
        mainHandler.post {
            if (foregroundPackage == packageName) {
                return@post
            }
            foregroundPackage = packageName
            dismissActionMenu()
            syncOverlayVisibility()
        }
    }

    private fun removeOverlayView() {
        dismissActionMenu()
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
        if (!isOverlayAttached) {
            return
        }
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

    /**
     * 长按菜单：全屏遮罩 + 贴靠悬浮球的圆角卡片。
     * 菜单窗口不可聚焦，避免抢占前台窗口、污染无障碍服务的前台包名判断。
     */
    private fun showActionMenu() {
        if (isDestroyed || !isOverlayAttached || actionMenuView != null) {
            return
        }
        val ballParams = windowParams ?: return
        val bounds = screenBounds()
        val margin = dp(MENU_MARGIN_DP)
        val menuWidth = dp(MENU_WIDTH_DP)
        val card = createActionMenuCard()
        card.measure(
            View.MeasureSpec.makeMeasureSpec(menuWidth, View.MeasureSpec.EXACTLY),
            View.MeasureSpec.makeMeasureSpec(0, View.MeasureSpec.UNSPECIFIED),
        )
        val menuHeight = card.measuredHeight
        val menuX =
            if (ballParams.x + ballParams.width / 2 < bounds.width() / 2) {
                ballParams.x
            } else {
                ballParams.x + ballParams.width - menuWidth
            }.coerceIn(margin, maxOf(margin, bounds.width() - menuWidth - margin))
        val minMenuY = systemBarHeight("status_bar_height") + margin
        val maxMenuY =
            bounds.height() - systemBarHeight("navigation_bar_height") - menuHeight - margin
        val menuY =
            if (ballParams.y + ballParams.height / 2 < bounds.height() / 2) {
                ballParams.y + ballParams.height + margin
            } else {
                ballParams.y - menuHeight - margin
            }.coerceIn(minMenuY, maxOf(minMenuY, maxMenuY))
        val root =
            FrameLayout(this).apply {
                setBackgroundColor(ContextCompat.getColor(this@FloatingBallService, R.color.quick_book_menu_scrim))
                setOnClickListener { dismissActionMenu() }
            }
        root.addView(
            card,
            FrameLayout.LayoutParams(menuWidth, FrameLayout.LayoutParams.WRAP_CONTENT).apply {
                gravity = Gravity.TOP or Gravity.START
                leftMargin = menuX
                topMargin = menuY
            },
        )
        val menuParams =
            WindowManager
                .LayoutParams(
                    WindowManager.LayoutParams.MATCH_PARENT,
                    WindowManager.LayoutParams.MATCH_PARENT,
                    overlayWindowType(),
                    WindowManager.LayoutParams.FLAG_NOT_FOCUSABLE or
                        WindowManager.LayoutParams.FLAG_LAYOUT_IN_SCREEN,
                    PixelFormat.TRANSLUCENT,
                ).apply {
                    gravity = Gravity.TOP or Gravity.START
                }
        try {
            windowManager.addView(root, menuParams)
            actionMenuView = root
        } catch (error: Exception) {
            Log.w(TAG, "添加悬浮球菜单失败", error)
        }
    }

    private fun createActionMenuCard(): LinearLayout {
        val card =
            LinearLayout(this).apply {
                orientation = LinearLayout.VERTICAL
                setPadding(0, dp(MENU_CARD_PADDING_DP), 0, dp(MENU_CARD_PADDING_DP))
                background =
                    GradientDrawable().apply {
                        shape = GradientDrawable.RECTANGLE
                        cornerRadius = dp(MENU_CORNER_RADIUS_DP).toFloat()
                        setColor(ContextCompat.getColor(this@FloatingBallService, R.color.quick_book_bg))
                    }
                clipToOutline = true
                elevation = dp(MENU_ELEVATION_DP).toFloat()
                isClickable = true
            }
        card.addView(
            createActionMenuItem(R.string.quick_book_floating_menu_capture) {
                dismissActionMenu()
                launchCapture()
            },
        )
        card.addView(createActionMenuDivider())
        card.addView(
            createActionMenuItem(R.string.quick_book_floating_menu_hide_in_app) {
                dismissActionMenu()
                excludeCurrentPackage()
            },
        )
        return card
    }

    private fun createActionMenuItem(
        textRes: Int,
        onClick: () -> Unit,
    ): TextView =
        TextView(this).apply {
            text = getString(textRes)
            setTextColor(ContextCompat.getColor(this@FloatingBallService, R.color.quick_book_text))
            setTextSize(TypedValue.COMPLEX_UNIT_SP, MENU_ITEM_TEXT_SP)
            gravity = Gravity.CENTER_VERTICAL
            setPadding(
                dp(MENU_ITEM_HORIZONTAL_PADDING_DP),
                0,
                dp(MENU_ITEM_HORIZONTAL_PADDING_DP),
                0,
            )
            layoutParams =
                LinearLayout.LayoutParams(
                    LinearLayout.LayoutParams.MATCH_PARENT,
                    dp(MENU_ITEM_HEIGHT_DP),
                )
            background = createMenuItemRipple()
            isClickable = true
            setOnClickListener { onClick() }
        }

    private fun createMenuItemRipple(): RippleDrawable {
        val mask =
            GradientDrawable().apply {
                shape = GradientDrawable.RECTANGLE
                cornerRadius = dp(MENU_CORNER_RADIUS_DP).toFloat()
                setColor(Color.WHITE)
            }
        return RippleDrawable(
            ColorStateList.valueOf(ContextCompat.getColor(this, R.color.quick_book_line)),
            null,
            mask,
        )
    }

    private fun createActionMenuDivider(): View =
        View(this).apply {
            setBackgroundColor(ContextCompat.getColor(this@FloatingBallService, R.color.quick_book_line))
            val dividerParams =
                LinearLayout.LayoutParams(
                    LinearLayout.LayoutParams.MATCH_PARENT,
                    dp(MENU_DIVIDER_DP),
                )
            dividerParams.leftMargin = dp(MENU_ITEM_HORIZONTAL_PADDING_DP)
            dividerParams.rightMargin = dp(MENU_ITEM_HORIZONTAL_PADDING_DP)
            layoutParams = dividerParams
        }

    private fun dismissActionMenu() {
        val view = actionMenuView ?: return
        actionMenuView = null
        try {
            windowManager.removeView(view)
        } catch (error: IllegalArgumentException) {
            Log.w(TAG, "移除悬浮球菜单失败", error)
        }
    }

    private fun excludeCurrentPackage() {
        val packageName =
            (foregroundPackage ?: ScreenshotAccessibilityService.currentForegroundPackage)
                ?.trim()
                .orEmpty()
        if (packageName.isEmpty()) {
            Toast.makeText(applicationContext, R.string.quick_book_toast_exclude_unavailable, Toast.LENGTH_SHORT).show()
            return
        }
        if (packageName !in excludedPackages) {
            val updated = excludedPackages + packageName
            excludedPackages = updated
            QuickBookDraftPrefs.setExcludedPackages(this, updated)
            QuickBookDraftEvents.emitExcludedPackageAdded(packageName)
        }
        syncOverlayVisibility()
        Toast.makeText(applicationContext, R.string.quick_book_toast_hidden_in_app, Toast.LENGTH_LONG).show()
    }

    @SuppressLint("ClickableViewAccessibility")
    private inner class BallTouchListener : View.OnTouchListener {
        private val touchSlop = ViewConfiguration.get(this@FloatingBallService).scaledTouchSlop
        private var downRawX = 0f
        private var downRawY = 0f
        private var startX = 0
        private var startY = 0
        private var isDragging = false
        private var isLongPressTriggered = false
        private val longPressRunnable =
            Runnable {
                if (isDragging) {
                    return@Runnable
                }
                isLongPressTriggered = true
                ballView?.isPressed = false
                ballView?.performHapticFeedback(HapticFeedbackConstants.LONG_PRESS)
                showActionMenu()
            }

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
                    isLongPressTriggered = false
                    snapAnimator?.cancel()
                    mainHandler.removeCallbacks(longPressRunnable)
                    mainHandler.postDelayed(longPressRunnable, ViewConfiguration.getLongPressTimeout().toLong())
                    view.isPressed = true
                    return true
                }

                MotionEvent.ACTION_MOVE -> {
                    if (isLongPressTriggered) {
                        return true
                    }
                    val deltaX = (event.rawX - downRawX).toInt()
                    val deltaY = (event.rawY - downRawY).toInt()
                    if (!isDragging && (abs(deltaX) > touchSlop || abs(deltaY) > touchSlop)) {
                        isDragging = true
                        mainHandler.removeCallbacks(longPressRunnable)
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
                    mainHandler.removeCallbacks(longPressRunnable)
                    view.isPressed = false
                    if (isLongPressTriggered) {
                        isLongPressTriggered = false
                    } else if (isDragging) {
                        snapToEdge()
                    } else {
                        view.performClick()
                        launchCapture()
                    }
                    return true
                }

                MotionEvent.ACTION_CANCEL -> {
                    mainHandler.removeCallbacks(longPressRunnable)
                    view.isPressed = false
                    if (isLongPressTriggered) {
                        isLongPressTriggered = false
                    } else if (isDragging) {
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
