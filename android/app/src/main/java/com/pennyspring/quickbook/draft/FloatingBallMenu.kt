package com.pennyspring.quickbook.draft

import android.content.Context
import android.graphics.Color
import android.graphics.drawable.ColorDrawable
import android.graphics.drawable.Drawable
import android.os.Build
import android.view.Gravity
import android.view.View
import android.view.WindowManager
import android.widget.ImageView
import android.widget.LinearLayout
import android.widget.PopupWindow
import android.widget.TextView
import androidx.core.content.ContextCompat
import com.pennyspring.R
import kotlin.math.roundToInt

internal enum class FloatingBallAction {
    CAPTURE,
    OPEN_APP,
    AI_ASSISTANT,
}

/**
 * 悬浮球展开的白色圆角动作卡片。
 *
 * 使用 PopupWindow 向上弹出，避免在悬浮窗内部再叠加一层全屏布局。
 */
internal object FloatingBallMenu {
    private const val WIDTH_DP = 176
    private const val ITEM_HEIGHT_DP = 44
    private const val CARD_PADDING_DP = 6
    private const val ICON_SIZE_DP = 20
    private const val ICON_MARGIN_DP = 10
    private const val ITEM_HORIZONTAL_PADDING_DP = 10
    private const val MARGIN_DP = 8
    private const val ELEVATION_DP = 12

    private data class MenuItem(
        val iconRes: Int,
        val labelRes: Int,
        val action: FloatingBallAction,
    )

    private val menuItems =
        listOf(
            MenuItem(R.drawable.ic_quick_book_capture, R.string.quick_book_action_capture, FloatingBallAction.CAPTURE),
            MenuItem(R.drawable.ic_quick_book_open, R.string.quick_book_action_open_app, FloatingBallAction.OPEN_APP),
            MenuItem(R.drawable.ic_quick_book_ai, R.string.quick_book_action_ai, FloatingBallAction.AI_ASSISTANT),
        )

    fun show(
        anchor: View,
        onAction: (FloatingBallAction) -> Unit,
    ): PopupWindow {
        val context = anchor.context
        val content =
            LinearLayout(context).apply {
                orientation = LinearLayout.VERTICAL
                background = ContextCompat.getDrawable(context, R.drawable.bg_quick_book_menu)
                val padding = dp(context, CARD_PADDING_DP)
                setPadding(padding, padding, padding, padding)
            }
        lateinit var popup: PopupWindow
        menuItems.forEach { item ->
            content.addView(
                createItem(context, item) {
                    popup.dismiss()
                    onAction(item.action)
                },
            )
        }
        popup =
            PopupWindow(
                content,
                dp(context, WIDTH_DP),
                WindowManager.LayoutParams.WRAP_CONTENT,
                true,
            ).apply {
                setBackgroundDrawable(ColorDrawable(Color.TRANSPARENT))
                isOutsideTouchable = true
                elevation = dp(context, ELEVATION_DP).toFloat()
                inputMethodMode = PopupWindow.INPUT_METHOD_NOT_NEEDED
                // 悬浮球本身是 TYPE_APPLICATION_OVERLAY 窗口，菜单也使用 overlay 类型，
                // 避免部分机型不允许在非 Activity 窗口上添加应用子面板。
                setWindowLayoutType(overlayWindowType())
            }
        showAboveAnchor(popup, content, anchor)
        return popup
    }

    private fun createItem(
        context: Context,
        item: MenuItem,
        onClick: () -> Unit,
    ): View {
        val row =
            LinearLayout(context).apply {
                orientation = LinearLayout.HORIZONTAL
                gravity = Gravity.CENTER_VERTICAL
                layoutParams =
                    LinearLayout.LayoutParams(
                        LinearLayout.LayoutParams.MATCH_PARENT,
                        dp(context, ITEM_HEIGHT_DP),
                    )
                val horizontalPadding = dp(context, ITEM_HORIZONTAL_PADDING_DP)
                setPadding(horizontalPadding, 0, horizontalPadding, 0)
                background = selectableItemBackground(context)
                isClickable = true
                isFocusable = true
                setOnClickListener { onClick() }
            }
        val icon =
            ImageView(context).apply {
                setImageResource(item.iconRes)
                setColorFilter(ContextCompat.getColor(context, R.color.quick_book_text_secondary))
                layoutParams =
                    LinearLayout
                        .LayoutParams(
                            dp(context, ICON_SIZE_DP),
                            dp(context, ICON_SIZE_DP),
                        ).apply {
                            marginEnd = dp(context, ICON_MARGIN_DP)
                        }
            }
        val label =
            TextView(context).apply {
                setText(item.labelRes)
                setTextColor(ContextCompat.getColor(context, R.color.quick_book_text))
                textSize = 13f
            }
        row.addView(icon)
        row.addView(label)
        return row
    }

    private fun showAboveAnchor(
        popup: PopupWindow,
        content: View,
        anchor: View,
    ) {
        val context = anchor.context
        val width = dp(context, WIDTH_DP)
        content.measure(
            View.MeasureSpec.makeMeasureSpec(width, View.MeasureSpec.EXACTLY),
            View.MeasureSpec.makeMeasureSpec(0, View.MeasureSpec.UNSPECIFIED),
        )
        val popupWidth = content.measuredWidth
        val popupHeight = content.measuredHeight
        val anchorLocation = IntArray(2)
        anchor.getLocationOnScreen(anchorLocation)
        val screenWidth = context.resources.displayMetrics.widthPixels
        val statusBarHeight = getStatusBarHeight(context)
        val margin = dp(context, MARGIN_DP)
        val offsetX = calculateOffsetX(anchor, anchorLocation[0], popupWidth, screenWidth, margin)
        val aboveOffsetY = -(anchor.height + popupHeight + margin)
        val hasRoomAbove = anchorLocation[1] + aboveOffsetY >= statusBarHeight
        val offsetY = if (hasRoomAbove) aboveOffsetY else margin
        popup.showAsDropDown(anchor, offsetX, offsetY)
    }

    private fun calculateOffsetX(
        anchor: View,
        anchorScreenX: Int,
        popupWidth: Int,
        screenWidth: Int,
        margin: Int,
    ): Int {
        var offsetX = anchor.width - popupWidth
        if (anchorScreenX + offsetX < margin) {
            offsetX = margin - anchorScreenX
        }
        if (anchorScreenX + offsetX + popupWidth > screenWidth - margin) {
            offsetX = screenWidth - margin - popupWidth - anchorScreenX
        }
        return offsetX
    }

    private fun selectableItemBackground(context: Context): Drawable? {
        val attributes = intArrayOf(android.R.attr.selectableItemBackground)
        val typedArray = context.obtainStyledAttributes(attributes)
        return try {
            typedArray.getDrawable(0)
        } finally {
            typedArray.recycle()
        }
    }

    private fun getStatusBarHeight(context: Context): Int {
        val resourceId = context.resources.getIdentifier("status_bar_height", "dimen", "android")
        return if (resourceId > 0) context.resources.getDimensionPixelSize(resourceId) else 0
    }

    @Suppress("DEPRECATION")
    private fun overlayWindowType(): Int =
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            WindowManager.LayoutParams.TYPE_APPLICATION_OVERLAY
        } else {
            WindowManager.LayoutParams.TYPE_PHONE
        }

    private fun dp(
        context: Context,
        value: Int,
    ): Int = (value * context.resources.displayMetrics.density).roundToInt()
}
