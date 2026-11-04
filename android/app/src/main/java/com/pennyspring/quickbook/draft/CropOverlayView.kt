package com.pennyspring.quickbook.draft

import android.content.Context
import android.graphics.Bitmap
import android.graphics.Canvas
import android.graphics.Paint
import android.graphics.RectF
import android.view.MotionEvent
import android.view.View
import android.view.ViewConfiguration
import androidx.core.content.ContextCompat
import com.pennyspring.R
import kotlin.math.abs
import kotlin.math.ceil
import kotlin.math.floor
import kotlin.math.max

/**
 * 全屏截图选区控件：截图铺满视图，选区外暗色遮罩，支持拖动选区和四角缩放。
 * 锁定后只保留选区边框，供预设栏阶段使用。
 */
class CropOverlayView(
    context: Context,
) : View(context) {
    var onOutsideTap: (() -> Unit)? = null

    private val minSelectionSize = dp(MIN_SELECTION_SIZE_DP)
    private val handleRadius = dp(HANDLE_RADIUS_DP)
    private val cornerTouchRadius = dp(CORNER_TOUCH_RADIUS_DP)
    private val touchSlop = ViewConfiguration.get(context).scaledTouchSlop

    private val selectionRect = RectF()
    private val downRect = RectF()
    private val bitmapDestRect = RectF()

    private val bitmapPaint =
        Paint(Paint.FILTER_BITMAP_FLAG or Paint.DITHER_FLAG).apply {
            isAntiAlias = true
        }
    private val dimPaint =
        Paint().apply {
            color = ContextCompat.getColor(context, R.color.quick_book_dim)
        }
    private val borderPaint =
        Paint(Paint.ANTI_ALIAS_FLAG).apply {
            style = Paint.Style.STROKE
            strokeWidth = dp(BORDER_WIDTH_DP)
            color = ContextCompat.getColor(context, R.color.quick_book_capture_on_primary)
        }
    private val guidePaint =
        Paint(Paint.ANTI_ALIAS_FLAG).apply {
            style = Paint.Style.STROKE
            strokeWidth = dp(GUIDE_WIDTH_DP)
            color = ContextCompat.getColor(context, R.color.quick_book_capture_guide)
        }
    private val handlePaint =
        Paint(Paint.ANTI_ALIAS_FLAG).apply {
            style = Paint.Style.FILL
            color = ContextCompat.getColor(context, R.color.quick_book_capture_on_primary)
        }

    private var bitmap: Bitmap? = null
    private var isSelectionInitialized = false
    private var isLocked = false

    private var gestureMode = GestureMode.NONE
    private var activeCorner: Corner? = null
    private var downX = 0f
    private var downY = 0f
    private var isGestureMoved = false

    fun setBitmap(value: Bitmap) {
        bitmap = value
        initializeSelectionIfNeeded()
        invalidate()
    }

    /** 释放底层截图，Activity 销毁时调用。 */
    fun release() {
        if (bitmap?.isRecycled == false) {
            bitmap?.recycle()
        }
        bitmap = null
        isSelectionInitialized = false
        resetGesture()
        invalidate()
    }

    /** 锁定后选区不可拖动、不可缩放，只响应选区外点击。 */
    fun lockSelection() {
        isLocked = true
        resetGesture()
        invalidate()
    }

    /** 返回选区在 View 坐标系中的位置，供预设栏定位。 */
    fun selectionRectInView(): RectF {
        initializeSelectionIfNeeded()
        return RectF(selectionRect)
    }

    /** 按 View 与截图的坐标映射裁出选区，失败返回 null。 */
    fun cropSelectedBitmap(): Bitmap? {
        val source = bitmap ?: return null
        if (source.isRecycled || width <= 0 || height <= 0) {
            return null
        }
        initializeSelectionIfNeeded()
        if (selectionRect.width() < 1f || selectionRect.height() < 1f) {
            return null
        }
        val scaleX = source.width.toFloat() / width
        val scaleY = source.height.toFloat() / height
        val left = floor(selectionRect.left * scaleX).toInt().coerceIn(0, source.width - 1)
        val top = floor(selectionRect.top * scaleY).toInt().coerceIn(0, source.height - 1)
        val right = ceil(selectionRect.right * scaleX).toInt().coerceIn(left + 1, source.width)
        val bottom = ceil(selectionRect.bottom * scaleY).toInt().coerceIn(top + 1, source.height)
        return try {
            Bitmap.createBitmap(source, left, top, right - left, bottom - top)
        } catch (_: IllegalArgumentException) {
            null
        }
    }

    override fun onSizeChanged(
        w: Int,
        h: Int,
        oldw: Int,
        oldh: Int,
    ) {
        super.onSizeChanged(w, h, oldw, oldh)
        initializeSelectionIfNeeded()
    }

    override fun onDraw(canvas: Canvas) {
        super.onDraw(canvas)
        drawBitmap(canvas)
        if (!isSelectionInitialized) {
            return
        }
        drawDimOutsideSelection(canvas)
        if (!isLocked) {
            drawGuides(canvas)
        }
        drawBorder(canvas)
        if (!isLocked) {
            drawHandles(canvas)
        }
    }

    override fun onTouchEvent(event: MotionEvent): Boolean {
        if (!isSelectionInitialized) {
            return false
        }
        when (event.actionMasked) {
            MotionEvent.ACTION_DOWN -> return handleActionDown(event)
            MotionEvent.ACTION_MOVE -> handleActionMove(event)
            MotionEvent.ACTION_UP -> handleActionUp(event)
            MotionEvent.ACTION_CANCEL -> resetGesture()
            else -> return super.onTouchEvent(event)
        }
        return true
    }

    private fun handleActionDown(event: MotionEvent): Boolean {
        downX = event.x
        downY = event.y
        downRect.set(selectionRect)
        isGestureMoved = false
        activeCorner = if (isLocked) null else findCorner(event.x, event.y)
        gestureMode =
            when {
                activeCorner != null -> GestureMode.RESIZE
                selectionRect.contains(event.x, event.y) -> if (isLocked) GestureMode.NONE else GestureMode.MOVE
                else -> GestureMode.OUTSIDE
            }
        return true
    }

    private fun handleActionMove(event: MotionEvent) {
        if (gestureMode == GestureMode.NONE) {
            return
        }
        val dx = event.x - downX
        val dy = event.y - downY
        if (abs(dx) > touchSlop || abs(dy) > touchSlop) {
            isGestureMoved = true
        }
        if (gestureMode == GestureMode.OUTSIDE) {
            return
        }
        when (gestureMode) {
            GestureMode.RESIZE -> resizeSelection(dx, dy)
            GestureMode.MOVE -> moveSelection(dx, dy)
            else -> Unit
        }
        invalidate()
    }

    private fun handleActionUp(event: MotionEvent) {
        if (gestureMode == GestureMode.OUTSIDE && !isGestureMoved && !isPointInsideSelection(event.x, event.y)) {
            onOutsideTap?.invoke()
        }
        resetGesture()
    }

    private fun resizeSelection(
        dx: Float,
        dy: Float,
    ) {
        val corner = activeCorner ?: return
        val left =
            if (corner == Corner.TOP_LEFT || corner == Corner.BOTTOM_LEFT) {
                (downRect.left + dx).coerceIn(0f, downRect.right - minSelectionSize)
            } else {
                downRect.left
            }
        val right =
            if (corner == Corner.TOP_RIGHT || corner == Corner.BOTTOM_RIGHT) {
                (downRect.right + dx).coerceIn(downRect.left + minSelectionSize, width.toFloat())
            } else {
                downRect.right
            }
        val top =
            if (corner == Corner.TOP_LEFT || corner == Corner.TOP_RIGHT) {
                (downRect.top + dy).coerceIn(0f, downRect.bottom - minSelectionSize)
            } else {
                downRect.top
            }
        val bottom =
            if (corner == Corner.BOTTOM_LEFT || corner == Corner.BOTTOM_RIGHT) {
                (downRect.bottom + dy).coerceIn(downRect.top + minSelectionSize, height.toFloat())
            } else {
                downRect.bottom
            }
        selectionRect.set(left, top, right, bottom)
    }

    private fun moveSelection(
        dx: Float,
        dy: Float,
    ) {
        val offsetX = dx.coerceIn(-downRect.left, width - downRect.right)
        val offsetY = dy.coerceIn(-downRect.top, height - downRect.bottom)
        selectionRect.set(
            downRect.left + offsetX,
            downRect.top + offsetY,
            downRect.right + offsetX,
            downRect.bottom + offsetY,
        )
    }

    private fun findCorner(
        x: Float,
        y: Float,
    ): Corner? {
        val corners =
            listOf(
                Corner.TOP_LEFT to (selectionRect.left to selectionRect.top),
                Corner.TOP_RIGHT to (selectionRect.right to selectionRect.top),
                Corner.BOTTOM_LEFT to (selectionRect.left to selectionRect.bottom),
                Corner.BOTTOM_RIGHT to (selectionRect.right to selectionRect.bottom),
            )
        return corners
            .filter { (_, point) ->
                val distanceX = x - point.first
                val distanceY = y - point.second
                distanceX * distanceX + distanceY * distanceY <= cornerTouchRadius * cornerTouchRadius
            }.minByOrNull { (_, point) ->
                val distanceX = x - point.first
                val distanceY = y - point.second
                distanceX * distanceX + distanceY * distanceY
            }?.first
    }

    private fun isPointInsideSelection(
        x: Float,
        y: Float,
    ): Boolean = selectionRect.contains(x, y)

    private fun initializeSelectionIfNeeded() {
        if (isSelectionInitialized || width <= 0 || height <= 0) {
            return
        }
        val selectionWidth = max(width * INITIAL_WIDTH_RATIO, minSelectionSize).coerceAtMost(width.toFloat())
        val selectionHeight = max(height * INITIAL_HEIGHT_RATIO, minSelectionSize).coerceAtMost(height.toFloat())
        val left = (width - selectionWidth) / 2f
        val top = (height - selectionHeight) / 2f
        selectionRect.set(left, top, left + selectionWidth, top + selectionHeight)
        isSelectionInitialized = true
    }

    private fun drawBitmap(canvas: Canvas) {
        val source = bitmap ?: return
        if (source.isRecycled || width <= 0 || height <= 0) {
            return
        }
        bitmapDestRect.set(0f, 0f, width.toFloat(), height.toFloat())
        canvas.drawBitmap(source, null, bitmapDestRect, bitmapPaint)
    }

    private fun drawDimOutsideSelection(canvas: Canvas) {
        val viewWidth = width.toFloat()
        val viewHeight = height.toFloat()
        canvas.drawRect(0f, 0f, viewWidth, selectionRect.top, dimPaint)
        canvas.drawRect(0f, selectionRect.bottom, viewWidth, viewHeight, dimPaint)
        canvas.drawRect(0f, selectionRect.top, selectionRect.left, selectionRect.bottom, dimPaint)
        canvas.drawRect(selectionRect.right, selectionRect.top, viewWidth, selectionRect.bottom, dimPaint)
    }

    private fun drawGuides(canvas: Canvas) {
        val thirdWidth = selectionRect.width() / GUIDE_GRID_DIVISIONS
        val thirdHeight = selectionRect.height() / GUIDE_GRID_DIVISIONS
        for (index in 1 until GUIDE_GRID_DIVISIONS) {
            val x = selectionRect.left + thirdWidth * index
            val y = selectionRect.top + thirdHeight * index
            canvas.drawLine(x, selectionRect.top, x, selectionRect.bottom, guidePaint)
            canvas.drawLine(selectionRect.left, y, selectionRect.right, y, guidePaint)
        }
    }

    private fun drawBorder(canvas: Canvas) {
        canvas.drawRect(selectionRect, borderPaint)
    }

    private fun drawHandles(canvas: Canvas) {
        drawHandle(canvas, selectionRect.left, selectionRect.top)
        drawHandle(canvas, selectionRect.right, selectionRect.top)
        drawHandle(canvas, selectionRect.left, selectionRect.bottom)
        drawHandle(canvas, selectionRect.right, selectionRect.bottom)
    }

    private fun drawHandle(
        canvas: Canvas,
        x: Float,
        y: Float,
    ) {
        canvas.drawCircle(x, y, handleRadius, handlePaint)
    }

    private fun resetGesture() {
        gestureMode = GestureMode.NONE
        activeCorner = null
        isGestureMoved = false
    }

    private fun dp(value: Int): Float = value * resources.displayMetrics.density

    private enum class GestureMode {
        NONE,
        MOVE,
        RESIZE,
        OUTSIDE,
    }

    private enum class Corner {
        TOP_LEFT,
        TOP_RIGHT,
        BOTTOM_LEFT,
        BOTTOM_RIGHT,
    }

    private companion object {
        const val INITIAL_WIDTH_RATIO = 0.8f
        const val INITIAL_HEIGHT_RATIO = 0.4f
        const val MIN_SELECTION_SIZE_DP = 64
        const val HANDLE_RADIUS_DP = 5
        const val CORNER_TOUCH_RADIUS_DP = 24
        const val BORDER_WIDTH_DP = 2
        const val GUIDE_WIDTH_DP = 1
        const val GUIDE_GRID_DIVISIONS = 3
    }
}
