package com.pennyspring.quickbook.draft

import android.app.Activity
import android.content.Context
import android.content.Intent
import android.graphics.Bitmap
import android.graphics.Color
import android.graphics.PixelFormat
import android.graphics.Point
import android.graphics.Typeface
import android.graphics.drawable.ColorDrawable
import android.graphics.drawable.GradientDrawable
import android.hardware.display.DisplayManager
import android.hardware.display.VirtualDisplay
import android.media.Image
import android.media.ImageReader
import android.media.projection.MediaProjection
import android.media.projection.MediaProjectionManager
import android.net.Uri
import android.os.Build
import android.os.Bundle
import android.os.Handler
import android.os.HandlerThread
import android.os.Looper
import android.util.DisplayMetrics
import android.view.Gravity
import android.view.View
import android.view.WindowManager
import android.widget.FrameLayout
import android.widget.LinearLayout
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
 * 透明全屏截图 Activity：申请 MediaProjection，抓取一帧屏幕后进入框选和预设栏。
 * 抓帧前不展示任何内容，确保截图包含下层 App 而不是本 Activity UI。
 */
class ScreenCaptureActivity : Activity() {
    private var rootView: FrameLayout? = null
    private var cropOverlayView: CropOverlayView? = null
    private var presetBarView: PresetBarView? = null
    private var hintView: TextView? = null
    private var actionBarView: View? = null

    private val mainHandler = Handler(Looper.getMainLooper())
    private val hasCapturedFrame = AtomicBoolean(false)
    private val captureTimeout = Runnable { onCaptureTimeout() }

    private var mediaProjectionManager: MediaProjectionManager? = null
    private var projectionResultCode = 0
    private var projectionData: Intent? = null
    private var mediaProjection: MediaProjection? = null
    private var mediaProjectionCallback: MediaProjection.Callback? = null
    private var imageReader: ImageReader? = null
    private var virtualDisplay: VirtualDisplay? = null
    private var captureThread: HandlerThread? = null
    private var captureHandler: Handler? = null

    private var screenBitmap: Bitmap? = null
    private var isProjectionServiceStarted = false

    @Volatile
    private var isPipelineStopped = false

    private var isPresetStage = false
    private var isCleanedUp = false

    private var systemTopInset = 0
    private var systemBottomInset = 0

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        configureWindow()
        runCatching { FloatingBallService.hideForCapture() }
        requestScreenCapture()
    }

    @Suppress("DEPRECATION")
    override fun onActivityResult(
        requestCode: Int,
        resultCode: Int,
        data: Intent?,
    ) {
        super.onActivityResult(requestCode, resultCode, data)
        if (requestCode != REQUEST_MEDIA_PROJECTION) {
            return
        }
        if (resultCode != RESULT_OK || data == null) {
            failCapture(R.string.quick_book_capture_projection_denied)
            return
        }
        projectionResultCode = resultCode
        projectionData = data
        startProjectionServiceThenCapture()
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

    private fun requestScreenCapture() {
        val manager = getSystemService(Context.MEDIA_PROJECTION_SERVICE) as? MediaProjectionManager
        if (manager == null) {
            failCapture(R.string.quick_book_capture_failed)
            return
        }
        mediaProjectionManager = manager
        startActivityForResult(manager.createScreenCaptureIntent(), REQUEST_MEDIA_PROJECTION)
    }

    private fun startProjectionServiceThenCapture() {
        try {
            MediaProjectionService.start(this)
            isProjectionServiceStarted = true
        } catch (_: Exception) {
            failCapture(R.string.quick_book_capture_failed)
            return
        }
        mainHandler.postDelayed({ startCaptureSession() }, PROJECTION_WARM_UP_MS)
    }

    private fun startCaptureSession() {
        if (isFinishing || isDestroyed || isPipelineStopped) {
            return
        }
        val manager = mediaProjectionManager
        val data = projectionData
        if (manager == null || data == null) {
            failCapture(R.string.quick_book_capture_failed)
            return
        }
        val projection =
            try {
                manager.getMediaProjection(projectionResultCode, data)
            } catch (_: Exception) {
                null
            }
        if (projection == null) {
            failCapture(R.string.quick_book_capture_failed)
            return
        }
        mediaProjection = projection
        val screenSize = resolveScreenSize()
        if (screenSize.x <= 0 || screenSize.y <= 0) {
            failCapture(R.string.quick_book_capture_failed)
            return
        }
        val reader =
            try {
                ImageReader.newInstance(
                    screenSize.x,
                    screenSize.y,
                    PixelFormat.RGBA_8888,
                    MAX_IMAGES,
                )
            } catch (_: Exception) {
                null
            }
        if (reader == null) {
            failCapture(R.string.quick_book_capture_failed)
            return
        }
        imageReader = reader
        val thread = HandlerThread(CAPTURE_THREAD_NAME).apply { start() }
        captureThread = thread
        val handler = Handler(thread.looper)
        captureHandler = handler
        val callback =
            object : MediaProjection.Callback() {
                override fun onStop() {
                    if (!isPipelineStopped && !hasCapturedFrame.get()) {
                        mainHandler.post { failCapture(R.string.quick_book_capture_failed) }
                    }
                }
            }
        mediaProjectionCallback = callback
        projection.registerCallback(callback, handler)
        reader.setOnImageAvailableListener({ activeReader -> onImageAvailable(activeReader) }, handler)
        virtualDisplay =
            projection.createVirtualDisplay(
                CAPTURE_DISPLAY_NAME,
                screenSize.x,
                screenSize.y,
                resources.displayMetrics.densityDpi,
                DisplayManager.VIRTUAL_DISPLAY_FLAG_AUTO_MIRROR,
                reader.surface,
                null,
                null,
            )
        mainHandler.postDelayed(captureTimeout, CAPTURE_TIMEOUT_MS)
    }

    private fun onImageAvailable(reader: ImageReader) {
        if (!hasCapturedFrame.compareAndSet(false, true)) {
            return
        }
        val image =
            try {
                reader.acquireLatestImage()
            } catch (_: Exception) {
                null
            }
        val bitmap =
            if (image == null) {
                null
            } else {
                try {
                    imageToBitmap(image)
                } catch (_: Exception) {
                    null
                } finally {
                    image.close()
                }
            }
        mainHandler.post { handleCapturedBitmap(bitmap) }
    }

    private fun imageToBitmap(image: Image): Bitmap? {
        val plane = image.planes.firstOrNull() ?: return null
        if (plane.pixelStride <= 0 || image.width <= 0 || image.height <= 0) {
            return null
        }
        val rowPadding = plane.rowStride - plane.pixelStride * image.width
        val paddedWidth = image.width + rowPadding / plane.pixelStride
        val padded = Bitmap.createBitmap(paddedWidth, image.height, Bitmap.Config.ARGB_8888)
        padded.copyPixelsFromBuffer(plane.buffer)
        if (paddedWidth == image.width) {
            return padded
        }
        val cropped = Bitmap.createBitmap(padded, 0, 0, image.width, image.height)
        padded.recycle()
        return cropped
    }

    private fun onCaptureTimeout() {
        if (hasCapturedFrame.get()) {
            return
        }
        failCapture(R.string.quick_book_capture_timeout)
    }

    private fun handleCapturedBitmap(bitmap: Bitmap?) {
        mainHandler.removeCallbacks(captureTimeout)
        stopCapturePipeline()
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
        screenBitmap = bitmap
        showCropUi(bitmap)
    }

    private fun showCropUi(bitmap: Bitmap) {
        val root =
            FrameLayout(this).apply {
                setBackgroundColor(Color.TRANSPARENT)
            }
        val overlay =
            CropOverlayView(this).apply {
                setBitmap(bitmap)
                onOutsideTap = { onCropOutsideTap() }
            }
        root.addView(
            overlay,
            FrameLayout.LayoutParams(FrameLayout.LayoutParams.MATCH_PARENT, FrameLayout.LayoutParams.MATCH_PARENT),
        )
        val hint =
            TextView(this).apply {
                setText(R.string.quick_book_capture_hint)
                setTextColor(onPrimaryColor)
                textSize = HINT_TEXT_SP
                gravity = Gravity.CENTER
                setPadding(dp(14), dp(8), dp(14), dp(8))
                background = roundedBackground(tipBackgroundColor, HINT_CORNER_RADIUS_DP)
                elevation = dp(4).toFloat()
            }
        val hintParams =
            FrameLayout.LayoutParams(
                FrameLayout.LayoutParams.WRAP_CONTENT,
                FrameLayout.LayoutParams.WRAP_CONTENT,
            )
        hintParams.gravity = Gravity.TOP or Gravity.CENTER_HORIZONTAL
        hintParams.topMargin = dp(HINT_TOP_MARGIN_DP)
        root.addView(hint, hintParams)
        val actions = createActionBar()
        val actionParams =
            FrameLayout.LayoutParams(
                FrameLayout.LayoutParams.MATCH_PARENT,
                FrameLayout.LayoutParams.WRAP_CONTENT,
            )
        actionParams.gravity = Gravity.BOTTOM
        actionParams.marginStart = dp(ACTION_SIDE_MARGIN_DP)
        actionParams.marginEnd = dp(ACTION_SIDE_MARGIN_DP)
        actionParams.bottomMargin = dp(ACTION_BOTTOM_MARGIN_DP)
        root.addView(actions, actionParams)
        rootView = root
        cropOverlayView = overlay
        hintView = hint
        actionBarView = actions
        setContentView(root)
        applyWindowInsets(root, hint, actions)
    }

    private fun createActionBar(): LinearLayout {
        val actions =
            LinearLayout(this).apply {
                orientation = LinearLayout.HORIZONTAL
                gravity = Gravity.CENTER
            }
        val cancelButton =
            createActionButton(R.string.quick_book_capture_cancel, actionBackgroundColor) {
                finish()
            }
        val nextButton =
            createActionButton(R.string.quick_book_capture_next, primaryColor) {
                enterPresetStage()
            }
        actions.addView(
            cancelButton,
            LinearLayout.LayoutParams(0, dp(ACTION_BUTTON_HEIGHT_DP), 1f).apply {
                marginEnd = dp(ACTION_BUTTON_GAP_DP)
            },
        )
        actions.addView(nextButton, LinearLayout.LayoutParams(0, dp(ACTION_BUTTON_HEIGHT_DP), 1f))
        return actions
    }

    private fun createActionButton(
        textResId: Int,
        backgroundColor: Int,
        onClick: () -> Unit,
    ): TextView =
        TextView(this).apply {
            setText(textResId)
            setTextColor(onPrimaryColor)
            textSize = ACTION_TEXT_SP
            gravity = Gravity.CENTER
            setTypeface(typeface, Typeface.BOLD)
            background = roundedBackground(backgroundColor, ACTION_CORNER_RADIUS_DP)
            isClickable = true
            setOnClickListener { onClick() }
        }

    private fun applyWindowInsets(
        root: FrameLayout,
        hint: TextView,
        actions: View,
    ) {
        ViewCompat.setOnApplyWindowInsetsListener(root) { _, insets ->
            val bars = insets.getInsets(WindowInsetsCompat.Type.systemBars())
            systemTopInset = bars.top
            systemBottomInset = bars.bottom
            hint.updateLayoutParams<FrameLayout.LayoutParams> {
                topMargin = bars.top + dp(HINT_TOP_MARGIN_DP)
            }
            actions.updateLayoutParams<FrameLayout.LayoutParams> {
                bottomMargin = bars.bottom + dp(ACTION_BOTTOM_MARGIN_DP)
            }
            insets
        }
        ViewCompat.requestApplyInsets(root)
    }

    private fun enterPresetStage() {
        if (isPresetStage) {
            return
        }
        val root = rootView ?: return
        val overlay = cropOverlayView ?: return
        isPresetStage = true
        overlay.lockSelection()
        hintView?.visibility = View.GONE
        actionBarView?.visibility = View.GONE
        val bar =
            PresetBarView(this).apply {
                setOnSendListener { bookId, assetId, typeId -> handleSend(bookId, assetId, typeId) }
            }
        presetBarView = bar
        val availableWidth = (root.width - dp(PRESET_BAR_SIDE_MARGIN_DP)).coerceAtLeast(0)
        val barWidth = min(availableWidth, dp(PRESET_BAR_MAX_WIDTH_DP)).coerceAtLeast(min(availableWidth, dp(PRESET_BAR_MIN_WIDTH_DP)))
        root.addView(
            bar,
            FrameLayout.LayoutParams(barWidth, FrameLayout.LayoutParams.WRAP_CONTENT).apply {
                gravity = Gravity.TOP or Gravity.START
                leftMargin = (root.width - barWidth) / 2
                topMargin = calculatePresetBarTop(dp(ESTIMATED_PRESET_BAR_HEIGHT_DP))
            },
        )
        bar.post { positionPresetBar(bar) }
    }

    private fun positionPresetBar(bar: PresetBarView) {
        val root = rootView ?: return
        if (root.width <= 0 || root.height <= 0) {
            return
        }
        val params = bar.layoutParams as FrameLayout.LayoutParams
        val barHeight = if (bar.height > 0) bar.height else dp(ESTIMATED_PRESET_BAR_HEIGHT_DP)
        params.topMargin = calculatePresetBarTop(barHeight)
        params.leftMargin = ((root.width - bar.width) / 2).coerceAtLeast(0)
        bar.layoutParams = params
        bar.bringToFront()
    }

    private fun calculatePresetBarTop(barHeight: Int): Int {
        val root = rootView ?: return dp(PRESET_BAR_GAP_DP)
        val overlay = cropOverlayView ?: return dp(PRESET_BAR_GAP_DP)
        if (root.width <= 0 || root.height <= 0) {
            return dp(PRESET_BAR_GAP_DP)
        }
        val selection = overlay.selectionRectInView()
        val margin = dp(PRESET_BAR_GAP_DP)
        val bottomLimit = root.height - systemBottomInset - dp(SCREEN_EDGE_MARGIN_DP)
        val topLimit = systemTopInset + dp(SCREEN_EDGE_MARGIN_DP)
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

    private fun onCropOutsideTap() {
        if (!isPresetStage) {
            return
        }
        if (presetBarView?.isMenuShowing == true) {
            return
        }
        presetBarView?.dismissMenus()
        finish()
    }

    private fun handleSend(
        bookId: Int,
        assetId: Int,
        typeId: Int,
    ) {
        val overlay = cropOverlayView ?: return
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

    @Suppress("DEPRECATION")
    private fun resolveScreenSize(): Point {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R) {
            val bounds = windowManager.currentWindowMetrics.bounds
            return Point(bounds.width(), bounds.height())
        }
        val metrics = DisplayMetrics()
        windowManager.defaultDisplay.getRealMetrics(metrics)
        return Point(metrics.widthPixels, metrics.heightPixels)
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
        stopCapturePipeline()
        if (isFinishing || isDestroyed || isCleanedUp) {
            return
        }
        Toast.makeText(this, messageResId, Toast.LENGTH_SHORT).show()
        finish()
    }

    private fun stopCapturePipeline() {
        if (isPipelineStopped) {
            return
        }
        isPipelineStopped = true
        mainHandler.removeCallbacks(captureTimeout)
        imageReader?.setOnImageAvailableListener(null, null)
        runCatching { imageReader?.close() }
        imageReader = null
        runCatching { virtualDisplay?.release() }
        virtualDisplay = null
        val callback = mediaProjectionCallback
        if (callback != null) {
            runCatching { mediaProjection?.unregisterCallback(callback) }
        }
        mediaProjectionCallback = null
        runCatching { mediaProjection?.stop() }
        mediaProjection = null
        captureHandler?.removeCallbacksAndMessages(null)
        captureHandler = null
        captureThread?.quitSafely()
        captureThread = null
        if (isProjectionServiceStarted) {
            runCatching { MediaProjectionService.stop(this) }
            isProjectionServiceStarted = false
        }
    }

    private fun cleanupResources() {
        if (isCleanedUp) {
            return
        }
        isCleanedUp = true
        presetBarView?.dismissMenus()
        presetBarView = null
        cropOverlayView?.release()
        cropOverlayView = null
        screenBitmap?.let { bitmap ->
            if (!bitmap.isRecycled) {
                bitmap.recycle()
            }
        }
        screenBitmap = null
        stopCapturePipeline()
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

    private fun dp(value: Int): Int = (value * resources.displayMetrics.density).toInt()

    private val primaryColor: Int
        get() = ContextCompat.getColor(this, R.color.quick_book_primary)

    private val onPrimaryColor: Int
        get() = ContextCompat.getColor(this, R.color.quick_book_capture_on_primary)

    private val tipBackgroundColor: Int
        get() = ContextCompat.getColor(this, R.color.quick_book_capture_tip_bg)

    private val actionBackgroundColor: Int
        get() = ContextCompat.getColor(this, R.color.quick_book_capture_action_bg)

    companion object {
        private const val REQUEST_MEDIA_PROJECTION = 4101
        private const val PROJECTION_WARM_UP_MS = 500L
        private const val CAPTURE_TIMEOUT_MS = 3000L
        private const val MAX_IMAGES = 2
        private const val CAPTURE_THREAD_NAME = "QuickBookScreenCapture"
        private const val CAPTURE_DISPLAY_NAME = "QuickBookScreenCapture"
        private const val JPEG_QUALITY = 92
        private const val DRAFT_DIRECTORY = "quick-book-drafts"
        private const val BLANK_SAMPLE_GRID = 24
        private const val BLANK_COLOR_THRESHOLD = 6
        private const val HINT_TEXT_SP = 13f
        private const val HINT_CORNER_RADIUS_DP = 18
        private const val HINT_TOP_MARGIN_DP = 12
        private const val ACTION_TEXT_SP = 15f
        private const val ACTION_CORNER_RADIUS_DP = 14
        private const val ACTION_BUTTON_HEIGHT_DP = 46
        private const val ACTION_BUTTON_GAP_DP = 10
        private const val ACTION_SIDE_MARGIN_DP = 24
        private const val ACTION_BOTTOM_MARGIN_DP = 28
        private const val SCREEN_EDGE_MARGIN_DP = 8
        private const val PRESET_BAR_SIDE_MARGIN_DP = 24
        private const val PRESET_BAR_MIN_WIDTH_DP = 240
        private const val PRESET_BAR_MAX_WIDTH_DP = 420
        private const val PRESET_BAR_GAP_DP = 12
        private const val ESTIMATED_PRESET_BAR_HEIGHT_DP = 56

        fun start(context: Context) {
            val intent =
                Intent(context, ScreenCaptureActivity::class.java).apply {
                    addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
                }
            context.startActivity(intent)
        }
    }
}
