package com.pennyspring.quickbook.draft

import android.app.Activity
import android.content.Context
import android.content.Intent
import android.graphics.Bitmap
import android.graphics.Color
import android.graphics.RectF
import android.graphics.drawable.ColorDrawable
import android.graphics.drawable.GradientDrawable
import android.net.Uri
import android.os.Build
import android.os.Bundle
import android.os.Handler
import android.os.Looper
import android.view.Gravity
import android.view.View
import android.view.WindowManager
import android.widget.FrameLayout
import android.widget.TextView
import android.widget.Toast
import androidx.core.content.ContextCompat
import androidx.core.view.ViewCompat
import androidx.core.view.WindowCompat
import androidx.core.view.WindowInsetsCompat
import androidx.core.view.updateLayoutParams
import com.pennyspring.R
import java.io.File
import java.io.FileOutputStream
import java.util.UUID
import java.util.concurrent.atomic.AtomicBoolean
import kotlin.math.min
import kotlin.math.roundToInt

/**
 * 透明全屏截图 Activity：通过无障碍服务抓取一帧屏幕后进入手绘选区。
 * 抓帧前不展示任何内容，确保截图包含下层 App 而不是本 Activity UI。
 */
class ScreenCaptureActivity : Activity() {
    private var rootView: FrameLayout? = null
    private var captureOverlayView: CropOverlayView? = null
    private var hintView: TextView? = null
    private var presetBarView: PresetBarView? = null

    private val mainHandler = Handler(Looper.getMainLooper())
    private val hasCapturedFrame = AtomicBoolean(false)
    private val hasCaptureStarted = AtomicBoolean(false)
    private val captureTimeout = Runnable { onCaptureTimeout() }
    private val captureRetry = Runnable { attemptCapture() }

    private var captureAttempts = 0
    private var triggerSource = TRIGGER_FLOATING_BALL
    private var notificationCaptureScheduled = false
    private var isCleanedUp = false

    private var systemTopInset = 0
    private var systemBottomInset = 0

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        configureWindow()
        triggerSource = intent?.getStringExtra(EXTRA_TRIGGER_SOURCE) ?: TRIGGER_FLOATING_BALL
        runCatching { FloatingBallService.hideForCapture() }
        if (triggerSource == TRIGGER_NOTIFICATION) {
            runCatching { ScreenshotAccessibilityService.dismissNotificationShade() }
            // 通知栏收起前不抓帧；等待 Activity 获得焦点后再延迟抓取。
            mainHandler.postDelayed({ onNotificationCaptureTimeout() }, NOTIFICATION_FOCUS_TIMEOUT_MS)
        } else {
            // 等待悬浮球窗口从合成层移除后再抓帧，避免把悬浮球截进画面。
            mainHandler.postDelayed({ captureScreen() }, CAPTURE_DELAY_MS)
        }
    }

    override fun onWindowFocusChanged(hasFocus: Boolean) {
        super.onWindowFocusChanged(hasFocus)
        if (
            !hasFocus ||
            triggerSource != TRIGGER_NOTIFICATION ||
            notificationCaptureScheduled ||
            isFinishing ||
            isDestroyed
        ) {
            return
        }
        notificationCaptureScheduled = true
        mainHandler.postDelayed({ captureScreen() }, NOTIFICATION_CAPTURE_DELAY_MS)
    }

    @Suppress("DEPRECATION")
    override fun onBackPressed() {
        if (presetBarView?.isMenuShowing == true) {
            presetBarView?.dismissMenus()
            return
        }
        finish()
    }

    override fun onDestroy() {
        cleanupResources()
        super.onDestroy()
    }

    @Suppress("DEPRECATION")
    private fun configureWindow() {
        WindowCompat.setDecorFitsSystemWindows(window, false)
        window.setBackgroundDrawable(ColorDrawable(Color.TRANSPARENT))
        window.clearFlags(WindowManager.LayoutParams.FLAG_DIM_BEHIND)
        window.statusBarColor = Color.TRANSPARENT
        window.navigationBarColor = Color.TRANSPARENT
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.P) {
            window.attributes =
                window.attributes.apply {
                    layoutInDisplayCutoutMode =
                        WindowManager.LayoutParams.LAYOUT_IN_DISPLAY_CUTOUT_MODE_SHORT_EDGES
                }
        }
    }

    private fun onNotificationCaptureTimeout() {
        if (notificationCaptureScheduled || hasCapturedFrame.get()) {
            return
        }
        failCapture(R.string.quick_book_capture_timeout)
    }

    private fun captureScreen() {
        if (!hasCaptureStarted.compareAndSet(false, true)) {
            return
        }
        if (isFinishing || isDestroyed || isCleanedUp) {
            return
        }
        mainHandler.postDelayed(captureTimeout, CAPTURE_TIMEOUT_MS)
        attemptCapture()
    }

    /** 通知冷启动时无障碍服务可能尚未连接，短暂重试而不是立即失败。 */
    private fun attemptCapture() {
        if (isFinishing || isDestroyed || isCleanedUp || hasCapturedFrame.get()) {
            return
        }
        val requested =
            ScreenshotAccessibilityService.capture { bitmap ->
                if (!hasCapturedFrame.compareAndSet(false, true)) {
                    bitmap?.recycle()
                    return@capture
                }
                handleCapturedBitmap(bitmap)
            }
        if (requested) {
            return
        }
        if (captureAttempts >= CAPTURE_MAX_RETRIES) {
            failCapture(R.string.quick_book_capture_accessibility_required)
            return
        }
        captureAttempts++
        mainHandler.postDelayed(captureRetry, CAPTURE_RETRY_INTERVAL_MS)
    }

    private fun onCaptureTimeout() {
        mainHandler.removeCallbacks(captureRetry)
        if (hasCapturedFrame.get()) {
            return
        }
        failCapture(R.string.quick_book_capture_timeout)
    }

    private fun handleCapturedBitmap(bitmap: Bitmap?) {
        mainHandler.removeCallbacks(captureTimeout)
        mainHandler.removeCallbacks(captureRetry)
        if (isFinishing || isDestroyed) {
            bitmap?.recycle()
            return
        }
        if (bitmap == null) {
            failCapture(R.string.quick_book_capture_failed)
            return
        }
        if (isBlankBitmap(bitmap)) {
            bitmap.recycle()
            failCapture(R.string.quick_book_capture_blank)
            return
        }
        showDrawUi(bitmap)
    }

    private fun showDrawUi(bitmap: Bitmap) {
        val root =
            FrameLayout(this).apply {
                setBackgroundColor(Color.TRANSPARENT)
            }
        val overlay =
            CropOverlayView(this).apply {
                setBitmap(bitmap)
                onDrawStart = { showDrawingHint() }
                onSelectionCommitted = { selection -> showPresetBar(selection) }
                onSelectionTooSmall = { onSelectionTooSmall() }
                onSelectionCancelled = { restoreSelectionUi() }
                onSelectionCleared = {
                    hidePresetBar()
                    showHint(R.string.quick_book_capture_hint)
                }
            }
        root.addView(
            overlay,
            FrameLayout.LayoutParams(
                FrameLayout.LayoutParams.MATCH_PARENT,
                FrameLayout.LayoutParams.MATCH_PARENT,
            ),
        )
        val hint = createHintView()
        val hintParams =
            FrameLayout.LayoutParams(
                FrameLayout.LayoutParams.WRAP_CONTENT,
                FrameLayout.LayoutParams.WRAP_CONTENT,
            )
        hintParams.gravity = Gravity.TOP or Gravity.CENTER_HORIZONTAL
        hintParams.topMargin = dp(HINT_TOP_MARGIN_DP)
        root.addView(hint, hintParams)
        val closeButton = createCloseButton()
        val closeParams =
            FrameLayout.LayoutParams(
                dp(CLOSE_BUTTON_SIZE_DP),
                dp(CLOSE_BUTTON_SIZE_DP),
            )
        closeParams.gravity = Gravity.TOP or Gravity.END
        closeParams.topMargin = dp(CLOSE_BUTTON_TOP_MARGIN_DP)
        closeParams.marginEnd = dp(CLOSE_BUTTON_END_MARGIN_DP)
        root.addView(closeButton, closeParams)
        rootView = root
        captureOverlayView = overlay
        hintView = hint
        setContentView(root)
        applyWindowInsets(root, hint, closeButton)
    }

    private fun createHintView(): TextView =
        TextView(this).apply {
            setText(R.string.quick_book_capture_hint)
            setTextColor(onPrimaryColor)
            textSize = HINT_TEXT_SP
            gravity = Gravity.CENTER
            setPadding(
                dp(HINT_HORIZONTAL_PADDING_DP),
                dp(HINT_VERTICAL_PADDING_DP),
                dp(HINT_HORIZONTAL_PADDING_DP),
                dp(HINT_VERTICAL_PADDING_DP),
            )
            background = roundedBackground(tipBackgroundColor, HINT_CORNER_RADIUS_DP)
            elevation = dp(HINT_ELEVATION_DP).toFloat()
        }

    private fun createCloseButton(): TextView =
        TextView(this).apply {
            text = CLOSE_TEXT
            setTextColor(onPrimaryColor)
            textSize = CLOSE_TEXT_SP
            gravity = Gravity.CENTER
            background = roundedBackground(actionBackgroundColor, CLOSE_CORNER_RADIUS_DP)
            contentDescription = getString(R.string.quick_book_capture_close)
            isClickable = true
            setOnClickListener { finish() }
        }

    private fun applyWindowInsets(
        root: FrameLayout,
        hint: TextView,
        closeButton: TextView,
    ) {
        ViewCompat.setOnApplyWindowInsetsListener(root) { _, insets ->
            val bars = insets.getInsets(WindowInsetsCompat.Type.systemBars())
            systemTopInset = bars.top
            systemBottomInset = bars.bottom
            hint.updateLayoutParams<FrameLayout.LayoutParams> {
                topMargin = bars.top + dp(HINT_TOP_MARGIN_DP)
            }
            closeButton.updateLayoutParams<FrameLayout.LayoutParams> {
                topMargin = bars.top + dp(CLOSE_BUTTON_TOP_MARGIN_DP)
            }
            insets
        }
        ViewCompat.requestApplyInsets(root)
    }

    private fun showDrawingHint() {
        hidePresetBar()
        showHint(R.string.quick_book_capture_hint_release)
    }

    private fun onSelectionTooSmall() {
        val selection = captureOverlayView?.selectionRectInView()
        if (selection != null) {
            showPresetBar(selection)
        } else {
            hidePresetBar()
        }
        showHint(R.string.quick_book_capture_too_small, isWarning = true)
    }

    private fun restoreSelectionUi() {
        val selection = captureOverlayView?.selectionRectInView()
        if (selection != null) {
            showPresetBar(selection)
        } else {
            hidePresetBar()
            showHint(R.string.quick_book_capture_hint)
        }
    }

    private fun showHint(
        textResId: Int,
        isWarning: Boolean = false,
    ) {
        val hint = hintView ?: return
        hint.setText(textResId)
        hint.setTextColor(if (isWarning) warningColor else onPrimaryColor)
        hint.visibility = View.VISIBLE
    }

    private fun hidePresetBar() {
        val bar = presetBarView ?: return
        bar.animate().cancel()
        if (bar.visibility != View.VISIBLE) {
            bar.visibility = View.GONE
            return
        }
        bar
            .animate()
            .alpha(0f)
            .setDuration(PRESET_BAR_EXIT_ANIMATION_MS)
            .withEndAction {
                if (bar.visibility == View.VISIBLE && bar.alpha == 0f) {
                    bar.visibility = View.GONE
                }
            }.start()
    }

    private fun showPresetBar(selection: RectF) {
        if (isFinishing || isDestroyed) {
            return
        }
        val root = rootView ?: return
        if (root.width <= 0 || root.height <= 0) {
            root.post { showPresetBar(selection) }
            return
        }
        val bar = ensurePresetBar()
        hintView?.visibility = View.GONE
        positionPresetBar(bar, selection)
        bar.animate().cancel()
        bar.visibility = View.VISIBLE
        bar.alpha = 0f
        bar.translationY = dp(PRESET_BAR_ENTER_OFFSET_DP).toFloat()
        bar
            .animate()
            .alpha(1f)
            .translationY(0f)
            .setDuration(PRESET_BAR_ANIMATION_MS)
            .start()
        bar.post { positionPresetBar(bar, selection) }
    }

    private fun ensurePresetBar(): PresetBarView {
        presetBarView?.let { return it }
        val root = rootView ?: error("root view missing")
        val bar =
            PresetBarView(this).apply {
                setOnSendListener { bookId, assetId, typeId -> handleSend(bookId, assetId, typeId) }
                visibility = View.INVISIBLE
            }
        val availableWidth = (root.width - dp(PRESET_BAR_SIDE_MARGIN_DP) * 2).coerceAtLeast(0)
        val barWidth =
            min(availableWidth, dp(PRESET_BAR_MAX_WIDTH_DP))
                .coerceAtLeast(min(availableWidth, dp(PRESET_BAR_MIN_WIDTH_DP)))
        val params =
            FrameLayout.LayoutParams(barWidth, FrameLayout.LayoutParams.WRAP_CONTENT).apply {
                gravity = Gravity.TOP or Gravity.START
            }
        root.addView(bar, params)
        presetBarView = bar
        return bar
    }

    private fun positionPresetBar(
        bar: PresetBarView,
        selection: RectF,
    ) {
        val root = rootView ?: return
        if (root.width <= 0 || root.height <= 0) {
            return
        }
        val params = bar.layoutParams as FrameLayout.LayoutParams
        val barWidth = if (bar.width > 0) bar.width else params.width
        val barHeight = if (bar.height > 0) bar.height else dp(ESTIMATED_PRESET_BAR_HEIGHT_DP)
        params.leftMargin = ((root.width - barWidth) / 2).coerceAtLeast(0)
        params.topMargin = calculatePresetBarTop(selection, barHeight)
        bar.layoutParams = params
        bar.bringToFront()
    }

    private fun calculatePresetBarTop(
        selection: RectF,
        barHeight: Int,
    ): Int {
        val root = rootView ?: return dp(PRESET_BAR_GAP_DP)
        if (root.width <= 0 || root.height <= 0) {
            return dp(PRESET_BAR_GAP_DP)
        }
        val margin = dp(PRESET_BAR_GAP_DP)
        val bottomLimit = root.height - systemBottomInset - dp(SCREEN_EDGE_MARGIN_DP)
        // 预设栏几乎横贯屏幕，顶部安全线放到关闭按钮下方，避免遮住关闭入口。
        val topLimit =
            systemTopInset +
                dp(CLOSE_BUTTON_TOP_MARGIN_DP) +
                dp(CLOSE_BUTTON_SIZE_DP) +
                dp(PRESET_BAR_GAP_DP)
        val belowTop = selection.bottom.roundToInt() + margin
        val aboveTop = selection.top.roundToInt() - margin - barHeight
        val targetTop =
            if (belowTop + barHeight <= bottomLimit) {
                belowTop
            } else {
                aboveTop.coerceAtLeast(topLimit)
            }
        return targetTop.coerceIn(topLimit, (bottomLimit - barHeight).coerceAtLeast(topLimit))
    }

    private fun handleSend(
        bookId: Int,
        assetId: Int,
        typeId: Int,
    ) {
        val overlay = captureOverlayView ?: return
        presetBarView?.setSending(true)
        presetBarView?.dismissMenus()
        val cropped = overlay.cropSelectedBitmap()
        rootView?.visibility = View.GONE
        if (cropped == null) {
            Toast.makeText(this, R.string.quick_book_capture_saving_failed, Toast.LENGTH_SHORT).show()
            finish()
            return
        }
        val draftId = UUID.randomUUID().toString()
        val file = saveDraftImage(cropped, draftId)
        cropped.recycle()
        if (file == null) {
            Toast.makeText(this, R.string.quick_book_capture_saving_failed, Toast.LENGTH_SHORT).show()
            finish()
            return
        }
        val started =
            try {
                QuickBookJobService.start(
                    this,
                    draftId,
                    Uri.fromFile(file).toString(),
                    bookId,
                    assetId,
                    typeId,
                    QuickBookDraftTaskContract.SOURCE_FLOATING_CAPTURE,
                )
            } catch (_: Exception) {
                false
            }
        if (!started) {
            file.delete()
            Toast.makeText(this, R.string.quick_book_capture_send_failed, Toast.LENGTH_SHORT).show()
        }
        finish()
    }

    private fun saveDraftImage(
        bitmap: Bitmap,
        draftId: String,
    ): File? {
        val directory = File(filesDir, DRAFT_DIRECTORY)
        if (!directory.exists() && !directory.mkdirs()) {
            return null
        }
        val file = File(directory, "$draftId.jpg")
        return try {
            var isSaved = false
            FileOutputStream(file).use { output ->
                isSaved = bitmap.compress(Bitmap.CompressFormat.JPEG, JPEG_QUALITY, output)
            }
            if (isSaved) {
                file
            } else {
                file.delete()
                null
            }
        } catch (_: Exception) {
            file.delete()
            null
        }
    }

    private fun isBlankBitmap(bitmap: Bitmap): Boolean {
        val stepX = (bitmap.width / BLANK_SAMPLE_GRID).coerceAtLeast(1)
        val stepY = (bitmap.height / BLANK_SAMPLE_GRID).coerceAtLeast(1)
        var y = 0
        while (y < bitmap.height) {
            var x = 0
            while (x < bitmap.width) {
                val pixel = bitmap.getPixel(x, y)
                val hasAlpha = Color.alpha(pixel) > BLANK_COLOR_THRESHOLD
                val hasColor =
                    Color.red(pixel) > BLANK_COLOR_THRESHOLD ||
                        Color.green(pixel) > BLANK_COLOR_THRESHOLD ||
                        Color.blue(pixel) > BLANK_COLOR_THRESHOLD
                if (hasAlpha || hasColor) {
                    return false
                }
                x += stepX
            }
            y += stepY
        }
        return true
    }

    private fun failCapture(messageResId: Int) {
        mainHandler.removeCallbacks(captureTimeout)
        mainHandler.removeCallbacks(captureRetry)
        if (isFinishing || isDestroyed || isCleanedUp) {
            return
        }
        Toast.makeText(this, messageResId, Toast.LENGTH_SHORT).show()
        finish()
    }

    private fun cleanupResources() {
        if (isCleanedUp) {
            return
        }
        isCleanedUp = true
        presetBarView?.dismissMenus()
        presetBarView = null
        captureOverlayView?.release()
        captureOverlayView = null
        hintView = null
        rootView = null
        mainHandler.removeCallbacksAndMessages(null)
        runCatching { FloatingBallService.restoreAfterCapture() }
    }

    private fun roundedBackground(
        fillColor: Int,
        radiusDp: Int,
    ): GradientDrawable =
        GradientDrawable().apply {
            shape = GradientDrawable.RECTANGLE
            cornerRadius = dp(radiusDp).toFloat()
            setColor(fillColor)
        }

    private fun dp(value: Int): Int = (value * resources.displayMetrics.density).roundToInt()

    private val onPrimaryColor: Int
        get() = ContextCompat.getColor(this, R.color.quick_book_capture_on_primary)

    private val tipBackgroundColor: Int
        get() = ContextCompat.getColor(this, R.color.quick_book_capture_tip_bg)

    private val actionBackgroundColor: Int
        get() = ContextCompat.getColor(this, R.color.quick_book_capture_action_bg)

    private val warningColor: Int
        get() = ContextCompat.getColor(this, R.color.quick_book_capture_warning)

    companion object {
        private const val CAPTURE_DELAY_MS = 180L
        private const val NOTIFICATION_CAPTURE_DELAY_MS = 350L
        private const val NOTIFICATION_FOCUS_TIMEOUT_MS = 3000L
        private const val CAPTURE_TIMEOUT_MS = 3000L
        private const val CAPTURE_RETRY_INTERVAL_MS = 100L
        private const val CAPTURE_MAX_RETRIES = 20
        const val EXTRA_TRIGGER_SOURCE = "com.pennyspring.quickbook.EXTRA_TRIGGER_SOURCE"
        const val TRIGGER_FLOATING_BALL = "floating_ball"
        const val TRIGGER_NOTIFICATION = "notification"
        private const val JPEG_QUALITY = 92
        private const val DRAFT_DIRECTORY = "quick-book-drafts"
        private const val BLANK_SAMPLE_GRID = 24
        private const val BLANK_COLOR_THRESHOLD = 6
        private const val HINT_TEXT_SP = 13f
        private const val HINT_CORNER_RADIUS_DP = 18
        private const val HINT_TOP_MARGIN_DP = 12
        private const val HINT_HORIZONTAL_PADDING_DP = 14
        private const val HINT_VERTICAL_PADDING_DP = 9
        private const val HINT_ELEVATION_DP = 4
        private const val CLOSE_TEXT = "×"
        private const val CLOSE_TEXT_SP = 22f
        private const val CLOSE_BUTTON_SIZE_DP = 44
        private const val CLOSE_BUTTON_TOP_MARGIN_DP = 6
        private const val CLOSE_BUTTON_END_MARGIN_DP = 16
        private const val CLOSE_CORNER_RADIUS_DP = 22
        private const val SCREEN_EDGE_MARGIN_DP = 8
        private const val PRESET_BAR_SIDE_MARGIN_DP = 24
        private const val PRESET_BAR_MIN_WIDTH_DP = 240
        private const val PRESET_BAR_MAX_WIDTH_DP = 420
        private const val PRESET_BAR_GAP_DP = 12
        private const val ESTIMATED_PRESET_BAR_HEIGHT_DP = 56
        private const val PRESET_BAR_ENTER_OFFSET_DP = 8
        private const val PRESET_BAR_ANIMATION_MS = 160L
        private const val PRESET_BAR_EXIT_ANIMATION_MS = 120L

        fun createIntent(
            context: Context,
            trigger: String,
        ): Intent =
            Intent(context, ScreenCaptureActivity::class.java).apply {
                addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
                putExtra(EXTRA_TRIGGER_SOURCE, trigger)
            }

        fun start(context: Context) {
            context.startActivity(createIntent(context, TRIGGER_FLOATING_BALL))
        }
    }
}
