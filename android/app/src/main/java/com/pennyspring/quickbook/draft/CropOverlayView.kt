package com.pennyspring.quickbook.draft

import android.content.Context
import android.graphics.Bitmap
import android.graphics.Canvas
import android.graphics.Paint
import android.graphics.Path
import android.graphics.RectF
import android.view.MotionEvent
import android.view.View
import android.view.ViewConfiguration
import androidx.core.content.ContextCompat
import com.pennyspring.R
import kotlin.math.ceil
import kotlin.math.floor

/**
 * 全屏截图选区控件：截图铺满视图，手指绘制路径，松手后按路径外接矩形裁剪。
 * 不提供预置框、拖拽、缩放或手柄；重新绘制会替换当前选区。
 */
class CropOverlayView(
    context: Context,
) : View(context) {
    var onDrawStart: (() -> Unit)? = null
    var onSelectionCommitted: ((RectF) -> Unit)? = null
    var onSelectionTooSmall: (() -> Unit)? = null
    var onSelectionCancelled: (() -> Unit)? = null
    var onSelectionCleared: (() -> Unit)? = null

    private val minSelectionSize = dp(MIN_SELECTION_SIZE_DP)
    private val drawPadding = dp(DRAW_PADDING_DP)
    private val touchSlop = ViewConfiguration.get(context).scaledTouchSlop

    private val selectionRect = RectF()
    private val previousSelectionRect = RectF()
    private val bitmapDestRect = RectF()
    private val drawPath = Path()
    private val points = mutableListOf<SelectionPoint>()

    private val bitmapPaint =
        Paint(Paint.FILTER_BITMAP_FLAG or Paint.DITHER_FLAG).apply {
            isAntiAlias = true
        }
    private val drawScrimPaint =
        Paint().apply {
            color = ContextCompat.getColor(context, R.color.quick_book_capture_draw_scrim)
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
    private val strokeHaloPaint =
        Paint(Paint.ANTI_ALIAS_FLAG).apply {
            style = Paint.Style.STROKE
            strokeWidth = dp(STROKE_HALO_WIDTH_DP)
            strokeCap = Paint.Cap.ROUND
            strokeJoin = Paint.Join.ROUND
            color = ContextCompat.getColor(context, R.color.quick_book_capture_stroke_halo)
        }
    private val strokePaint =
        Paint(Paint.ANTI_ALIAS_FLAG).apply {
            style = Paint.Style.STROKE
            strokeWidth = dp(STROKE_WIDTH_DP)
            strokeCap = Paint.Cap.ROUND
            strokeJoin = Paint.Join.ROUND
            color = ContextCompat.getColor(context, R.color.quick_book_primary)
        }

    private var bitmap: Bitmap? = null
    private var isDrawing = false
    private var isMovementStarted = false
    private var hasSelection = false
    private var hasPreviousSelection = false
    private var downX = 0f
    private var downY = 0f

    fun setBitmap(value: Bitmap) {
        bitmap = value
        clearSelectionState()
        invalidate()
    }

    /** 释放底层截图，Activity 销毁时调用。 */
    fun release() {
        bitmap?.takeIf { !it.isRecycled }?.recycle()
        bitmap = null
        clearSelectionState()
        invalidate()
    }

    fun hasSelection(): Boolean = hasSelection

    /** 返回当前选区在 View 坐标系中的位置；尚无有效选区时返回 null。 */
    fun selectionRectInView(): RectF? = if (hasSelection) RectF(selectionRect) else null

    /** 按 View 与截图的坐标映射裁出选区，失败返回 null。 */
    fun cropSelectedBitmap(): Bitmap? {
        val source = bitmap ?: return null
        if (!hasSelection || source.isRecycled || width <= 0 || height <= 0) {
            return null
        }
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
        if (w <= 0 || h <= 0) {
            return
        }
        if (oldw > 0 && oldh > 0 && (w != oldw || h != oldh)) {
            clearSelectionState()
            onSelectionCleared?.invoke()
        }
    }

    override fun onDraw(canvas: Canvas) {
        super.onDraw(canvas)
        drawBitmap(canvas)
        if (isDrawing) {
            canvas.drawRect(0f, 0f, width.toFloat(), height.toFloat(), drawScrimPaint)
            canvas.drawPath(drawPath, strokeHaloPaint)
            canvas.drawPath(drawPath, strokePaint)
            return
        }
        if (!hasSelection) {
            canvas.drawRect(0f, 0f, width.toFloat(), height.toFloat(), drawScrimPaint)
            return
        }
        drawDimOutsideSelection(canvas)
        drawBorder(canvas)
    }

    override fun onTouchEvent(event: MotionEvent): Boolean {
        when (event.actionMasked) {
            MotionEvent.ACTION_DOWN -> return handleActionDown(event)
            MotionEvent.ACTION_MOVE -> handleActionMove(event)
            MotionEvent.ACTION_UP -> handleActionUp(event)
            MotionEvent.ACTION_CANCEL -> handleActionCancel()
            else -> return super.onTouchEvent(event)
        }
        return true
    }

    private fun handleActionDown(event: MotionEvent): Boolean {
        downX = event.x.coerceIn(0f, width.toFloat())
        downY = event.y.coerceIn(0f, height.toFloat())
        isDrawing = true
        isMovementStarted = false
        points.clear()
        points.add(SelectionPoint(downX, downY))
        drawPath.reset()
        drawPath.moveTo(downX, downY)
        previousSelectionRect.set(selectionRect)
        hasPreviousSelection = hasSelection
        invalidate()
        return true
    }

    private fun handleActionMove(event: MotionEvent) {
        if (!isDrawing) {
            return
        }
        if (!isMovementStarted) {
            val deltaX = event.x - downX
            val deltaY = event.y - downY
            if (deltaX * deltaX + deltaY * deltaY <= (touchSlop * touchSlop).toFloat()) {
                return
            }
            isMovementStarted = true
            hasSelection = false
            onDrawStart?.invoke()
        }
        for (index in 0 until event.historySize) {
            appendPoint(event.getHistoricalX(index), event.getHistoricalY(index))
        }
        appendPoint(event.x, event.y)
        invalidate()
    }

    private fun appendPoint(
        x: Float,
        y: Float,
    ) {
        val clampedX = x.coerceIn(0f, width.toFloat())
        val clampedY = y.coerceIn(0f, height.toFloat())
        val last = points.lastOrNull()
        if (last != null && last.x == clampedX && last.y == clampedY) {
            return
        }
        points.add(SelectionPoint(clampedX, clampedY))
        drawPath.lineTo(clampedX, clampedY)
    }

    private fun handleActionUp(event: MotionEvent) {
        if (!isDrawing) {
            return
        }
        if (!isMovementStarted) {
            resetDrawing()
            hasPreviousSelection = false
            return
        }
        appendPoint(event.x, event.y)
        val bounds =
            SelectionBoundsCalculator.compute(
                points = points,
                viewWidth = width,
                viewHeight = height,
                padding = drawPadding,
                minSize = minSelectionSize,
            )
        resetDrawing()
        if (bounds == null) {
            restorePreviousSelection()
            onSelectionTooSmall?.invoke()
            invalidate()
            return
        }
        selectionRect.set(bounds.left, bounds.top, bounds.right, bounds.bottom)
        hasSelection = true
        hasPreviousSelection = false
        onSelectionCommitted?.invoke(RectF(selectionRect))
        invalidate()
    }

    private fun handleActionCancel() {
        if (!isDrawing) {
            return
        }
        resetDrawing()
        restorePreviousSelection()
        onSelectionCancelled?.invoke()
        invalidate()
    }

    private fun restorePreviousSelection() {
        if (hasPreviousSelection) {
            selectionRect.set(previousSelectionRect)
            hasSelection = true
        } else {
            selectionRect.setEmpty()
            hasSelection = false
        }
        hasPreviousSelection = false
    }

    private fun resetDrawing() {
        isDrawing = false
        isMovementStarted = false
        points.clear()
        drawPath.reset()
    }

    private fun clearSelectionState() {
        selectionRect.setEmpty()
        previousSelectionRect.setEmpty()
        hasSelection = false
        hasPreviousSelection = false
        resetDrawing()
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

    private fun drawBorder(canvas: Canvas) {
        canvas.drawRect(selectionRect, borderPaint)
    }

    private fun dp(value: Int): Float = value * resources.displayMetrics.density

    private companion object {
        const val MIN_SELECTION_SIZE_DP = 64
        const val DRAW_PADDING_DP = 3
        const val BORDER_WIDTH_DP = 2
        const val STROKE_HALO_WIDTH_DP = 7
        const val STROKE_WIDTH_DP = 3
    }
}
