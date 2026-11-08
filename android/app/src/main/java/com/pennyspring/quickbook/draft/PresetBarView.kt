package com.pennyspring.quickbook.draft

import android.content.Context
import android.content.res.ColorStateList
import android.graphics.Canvas
import android.graphics.Color
import android.graphics.Paint
import android.graphics.Path
import android.graphics.Typeface
import android.graphics.drawable.ColorDrawable
import android.graphics.drawable.GradientDrawable
import android.graphics.drawable.RippleDrawable
import android.text.TextUtils
import android.view.Gravity
import android.view.View
import android.widget.FrameLayout
import android.widget.LinearLayout
import android.widget.PopupWindow
import android.widget.ScrollView
import android.widget.TextView
import androidx.core.content.ContextCompat
import com.pennyspring.R
import kotlin.math.max
import kotlin.math.roundToInt

/**
 * 选区下方的单行预设栏：账本 | 资产 | 类型 + 圆形发送按钮。
 * 数据只读取 JS 发布的目录快照，点击分段弹出向上滚动菜单。
 */
class PresetBarView(
    context: Context,
) : LinearLayout(context) {
    /** 预留的取消回调；当前由 Activity 处理选区外点击和返回键。 */
    var onCancel: (() -> Unit)? = null

    private val colorPrimary = ContextCompat.getColor(context, R.color.quick_book_primary)
    private val colorSurface = ContextCompat.getColor(context, R.color.quick_book_bg)
    private val colorText = ContextCompat.getColor(context, R.color.quick_book_text)
    private val colorTextTertiary = ContextCompat.getColor(context, R.color.quick_book_text_tertiary)
    private val colorLine = ContextCompat.getColor(context, R.color.quick_book_line)

    private val bookSegment = SegmentView(context, R.string.quick_book_capture_label_book)
    private val assetSegment = SegmentView(context, R.string.quick_book_capture_label_asset)
    private val typeSegment = SegmentView(context, R.string.quick_book_capture_label_type)
    private val sendButton = FrameLayout(context)

    private var books: List<QuickBookCaptureCatalogStore.Book> = emptyList()
    private var assets: List<QuickBookCaptureCatalogStore.Asset> = emptyList()
    private var types: List<QuickBookCaptureCatalogStore.TypeOption> = emptyList()

    private var selectedBookKey: String? = null
    private var selectedAssetId = NO_SELECTION_ID
    private var selectedTypeId = NO_SELECTION_ID
    private var isSending = false
    private var menuPopup: PopupWindow? = null
    private var onSendListener: ((bookRef: QuickBookCaptureCatalogStore.BookRef, assetId: Int, typeId: Int) -> Unit)? =
        null

    val isMenuShowing: Boolean
        get() = menuPopup?.isShowing == true

    init {
        orientation = HORIZONTAL
        gravity = Gravity.CENTER_VERTICAL
        setPadding(dp(BAR_PADDING_DP), dp(BAR_PADDING_DP), dp(BAR_PADDING_DP), dp(BAR_PADDING_DP))
        background = roundedDrawable(colorSurface, BAR_CORNER_RADIUS_DP.toFloat(), colorLine)
        elevation = dp(BAR_ELEVATION_DP).toFloat()
        minimumHeight = dp(BAR_HEIGHT_DP)
        clipToOutline = true

        addView(bookSegment)
        addView(createDivider())
        addView(assetSegment)
        addView(createDivider())
        addView(typeSegment)
        addView(createSendButton())

        bookSegment.setOnClickListener { showBookMenu() }
        assetSegment.setOnClickListener { showAssetMenu() }
        typeSegment.setOnClickListener { showTypeMenu() }

        reloadData()
    }

    fun setOnSendListener(listener: (bookRef: QuickBookCaptureCatalogStore.BookRef, assetId: Int, typeId: Int) -> Unit) {
        onSendListener = listener
    }

    fun setSending(sending: Boolean) {
        isSending = sending
        refreshSegments()
    }

    fun dismissMenus() {
        menuPopup?.dismiss()
        menuPopup = null
    }

    private fun reloadData() {
        val catalog = QuickBookCaptureCatalogStore.read(context)
        books = catalog?.books?.filter { it.available } ?: emptyList()
        val preferredBookKey = catalog?.currentBookKey
        selectedBookKey = books.firstOrNull { it.key == preferredBookKey }?.key
        selectedAssetId = NO_SELECTION_ID
        selectedTypeId = NO_SELECTION_ID
        loadAssetsAndTypes()
        refreshSegments()
    }

    private fun selectedBook(): QuickBookCaptureCatalogStore.Book? = books.firstOrNull { it.key == selectedBookKey }

    private fun loadAssetsAndTypes() {
        val book = selectedBook()
        if (book == null) {
            assets = emptyList()
            types = emptyList()
            return
        }
        assets = book.assets
        types = book.types.sortedWith(compareBy({ it.sort }, { it.label }))
        if (assets.none { it.id == selectedAssetId }) {
            selectedAssetId = NO_SELECTION_ID
        }
        if (types.none { it.id == selectedTypeId }) {
            selectedTypeId = NO_SELECTION_ID
        }
    }

    private fun refreshSegments() {
        val book = selectedBook()
        val selectedAsset = assets.firstOrNull { it.id == selectedAssetId }
        val selectedTypeLabel = selectedTypeLabel()
        val unspecified = context.getString(R.string.quick_book_capture_unspecified)

        bookSegment.valueView.text = book?.name ?: context.getString(R.string.quick_book_capture_no_books)
        bookSegment.valueView.setTextColor(if (book == null) colorTextTertiary else colorText)
        assetSegment.valueView.text = selectedAsset?.name ?: unspecified
        assetSegment.valueView.setTextColor(if (selectedAsset == null) colorTextTertiary else colorText)
        typeSegment.valueView.text = selectedTypeLabel ?: unspecified
        typeSegment.valueView.setTextColor(if (selectedTypeLabel == null) colorTextTertiary else colorText)

        val hasBook = book != null
        bookSegment.isEnabled = books.isNotEmpty() && !isSending
        assetSegment.isEnabled = hasBook && !isSending
        typeSegment.isEnabled = hasBook && !isSending
        sendButton.isEnabled = hasBook && !isSending
        sendButton.alpha = if (sendButton.isEnabled) 1f else DISABLED_ALPHA
    }

    private fun selectedTypeLabel(): String? {
        if (selectedTypeId == NO_SELECTION_ID) {
            return null
        }
        return types.firstOrNull { it.id == selectedTypeId }?.label
    }

    private fun showBookMenu() {
        if (books.isEmpty() || isSending) {
            return
        }
        val options = books.map { MenuOption(it.ref.booksId, it.name, it.key) }
        showOptionMenu(bookSegment, options, NO_SELECTION_ID, selectedBookKey) { option ->
            if (option.key == selectedBookKey) {
                return@showOptionMenu
            }
            selectedBookKey = option.key
            selectedAssetId = NO_SELECTION_ID
            selectedTypeId = NO_SELECTION_ID
            loadAssetsAndTypes()
            refreshSegments()
        }
    }

    private fun showAssetMenu() {
        if (selectedBook() == null || isSending) {
            return
        }
        val options = assets.map { MenuOption(it.id, it.name) }
        val unspecified = MenuOption(NO_SELECTION_ID, context.getString(R.string.quick_book_capture_unspecified))
        showOptionMenu(assetSegment, options + unspecified, selectedAssetId, null) { option ->
            selectedAssetId = option.id
            refreshSegments()
        }
    }

    private fun showTypeMenu() {
        if (selectedBook() == null || isSending) {
            return
        }
        val options = types.map { MenuOption(it.id, it.label) }
        val unspecified = MenuOption(NO_SELECTION_ID, context.getString(R.string.quick_book_capture_unspecified))
        showOptionMenu(typeSegment, options + unspecified, selectedTypeId, null) { option ->
            selectedTypeId = option.id
            refreshSegments()
        }
    }

    private fun showOptionMenu(
        anchor: View,
        options: List<MenuOption>,
        selectedId: Int,
        selectedKey: String?,
        onSelected: (MenuOption) -> Unit,
    ) {
        dismissMenus()
        if (options.isEmpty()) {
            return
        }
        val menuWidth = max(anchor.width, dp(MENU_MIN_WIDTH_DP)).coerceAtMost(dp(MENU_MAX_WIDTH_DP))
        val column =
            LinearLayout(context).apply {
                orientation = VERTICAL
                setPadding(dp(MENU_PADDING_DP), dp(MENU_PADDING_DP), dp(MENU_PADDING_DP), dp(MENU_PADDING_DP))
            }
        options.forEach { option ->
            val isSelected =
                if (selectedKey != null) {
                    option.key == selectedKey
                } else {
                    option.id == selectedId
                }
            column.addView(
                createMenuRow(option, isSelected) {
                    onSelected(option)
                },
                LayoutParams(LayoutParams.MATCH_PARENT, dp(MENU_OPTION_HEIGHT_DP)),
            )
        }
        val scroll =
            ScrollView(context).apply {
                background = roundedDrawable(colorSurface, MENU_CORNER_RADIUS_DP.toFloat(), colorLine)
                clipToOutline = true
                addView(column, LayoutParams(LayoutParams.MATCH_PARENT, LayoutParams.WRAP_CONTENT))
            }
        val maxHeight = dp(MENU_MAX_HEIGHT_DP)
        scroll.measure(
            View.MeasureSpec.makeMeasureSpec(menuWidth, View.MeasureSpec.AT_MOST),
            View.MeasureSpec.makeMeasureSpec(maxHeight, View.MeasureSpec.AT_MOST),
        )
        val popupHeight = scroll.measuredHeight.coerceAtMost(maxHeight)
        val popup =
            PopupWindow(scroll, menuWidth, popupHeight, true).apply {
                setBackgroundDrawable(ColorDrawable(Color.TRANSPARENT))
                isOutsideTouchable = true
                elevation = dp(MENU_ELEVATION_DP).toFloat()
                setOnDismissListener { if (menuPopup === this) menuPopup = null }
            }
        menuPopup = popup
        showMenuWithVerticalFit(popup, anchor, menuWidth, popupHeight)
    }

    private fun showMenuWithVerticalFit(
        popup: PopupWindow,
        anchor: View,
        menuWidth: Int,
        popupHeight: Int,
    ) {
        val location = IntArray(2)
        anchor.getLocationOnScreen(location)
        val displayMetrics = resources.displayMetrics
        val margin = dp(MENU_MARGIN_DP)
        val spaceAbove = location[1] - margin
        val spaceBelow = displayMetrics.heightPixels - (location[1] + anchor.height) - margin
        val showAbove = spaceAbove >= popupHeight || spaceAbove >= spaceBelow
        val yOffset = if (showAbove) -(anchor.height + popupHeight + margin) else margin
        val overflowsRight = location[0] + menuWidth > displayMetrics.widthPixels - margin
        val xOffset = if (overflowsRight) displayMetrics.widthPixels - margin - menuWidth - location[0] else 0
        popup.showAsDropDown(anchor, xOffset, yOffset)
    }

    private fun createMenuRow(
        option: MenuOption,
        isSelected: Boolean,
        onClick: () -> Unit,
    ): TextView =
        TextView(context).apply {
            text = option.label
            textSize = MENU_TEXT_SP
            gravity = Gravity.CENTER_VERTICAL
            setPadding(dp(MENU_ROW_PADDING_DP), 0, dp(MENU_ROW_PADDING_DP), 0)
            setSingleLine(true)
            ellipsize = TextUtils.TruncateAt.END
            setTextColor(if (isSelected) colorPrimary else colorText)
            if (isSelected) {
                setTypeface(typeface, Typeface.BOLD)
            }
            background =
                RippleDrawable(
                    ColorStateList.valueOf(colorLine),
                    null,
                    null,
                )
            setOnClickListener {
                dismissMenus()
                onClick()
            }
        }

    private fun createDivider(): View =
        View(context).apply {
            setBackgroundColor(colorLine)
            layoutParams =
                LayoutParams(dp(DIVIDER_WIDTH_DP), dp(DIVIDER_HEIGHT_DP)).apply {
                    marginStart = dp(DIVIDER_MARGIN_DP)
                    marginEnd = dp(DIVIDER_MARGIN_DP)
                }
        }

    private fun createSendButton(): FrameLayout {
        sendButton.layoutParams =
            LayoutParams(dp(SEND_BUTTON_SIZE_DP), dp(SEND_BUTTON_SIZE_DP)).apply {
                marginStart = dp(SEND_BUTTON_MARGIN_DP)
            }
        sendButton.background =
            GradientDrawable().apply {
                shape = GradientDrawable.OVAL
                setColor(colorPrimary)
            }
        sendButton.elevation = dp(SEND_BUTTON_ELEVATION_DP).toFloat()
        sendButton.contentDescription = context.getString(R.string.quick_book_capture_send)
        sendButton.isClickable = true
        sendButton.setOnClickListener { handleSendClick() }
        sendButton.addView(
            SendIconView(context),
            FrameLayout.LayoutParams(
                dp(SEND_ICON_SIZE_DP),
                dp(SEND_ICON_SIZE_DP),
                Gravity.CENTER,
            ),
        )
        return sendButton
    }

    private fun handleSendClick() {
        val book = selectedBook()
        if (isSending || book == null) {
            return
        }
        isSending = true
        refreshSegments()
        onSendListener?.invoke(book.ref, selectedAssetId, selectedTypeId)
    }

    private inner class SegmentView(
        context: Context,
        labelResId: Int,
    ) : LinearLayout(context) {
        val valueView: TextView = TextView(context)

        init {
            orientation = VERTICAL
            gravity = Gravity.CENTER_VERTICAL
            setPadding(dp(SEGMENT_PADDING_DP), 0, dp(SEGMENT_PADDING_DP), 0)
            layoutParams = LayoutParams(0, dp(SEGMENT_HEIGHT_DP), 1f)
            isClickable = true
            background =
                RippleDrawable(
                    ColorStateList.valueOf(colorLine),
                    null,
                    null,
                )
            addView(
                TextView(context).apply {
                    setText(labelResId)
                    setTextColor(colorTextTertiary)
                    textSize = LABEL_TEXT_SP
                    setSingleLine(true)
                },
            )
            addView(
                valueView.apply {
                    setTextColor(colorText)
                    textSize = VALUE_TEXT_SP
                    setTypeface(typeface, Typeface.BOLD)
                    setSingleLine(true)
                    ellipsize = TextUtils.TruncateAt.END
                },
                LayoutParams(LayoutParams.MATCH_PARENT, LayoutParams.WRAP_CONTENT),
            )
        }
    }

    private fun roundedDrawable(
        fillColor: Int,
        cornerRadiusDp: Float,
        strokeColor: Int? = null,
    ): GradientDrawable =
        GradientDrawable().apply {
            shape = GradientDrawable.RECTANGLE
            cornerRadius = dp(cornerRadiusDp)
            setColor(fillColor)
            if (strokeColor != null) {
                setStroke(dp(STROKE_WIDTH_DP), strokeColor)
            }
        }

    private fun dp(value: Int): Int = (value * resources.displayMetrics.density).roundToInt()

    private fun dp(value: Float): Float = value * resources.displayMetrics.density

    private data class MenuOption(
        val id: Int,
        val label: String,
        val key: String = "",
    )

    private companion object {
        const val NO_SELECTION_ID = 0
        const val BAR_HEIGHT_DP = 56
        const val BAR_PADDING_DP = 6
        const val BAR_CORNER_RADIUS_DP = 16f
        const val BAR_ELEVATION_DP = 8
        const val SEGMENT_HEIGHT_DP = 44
        const val SEGMENT_PADDING_DP = 8
        const val DIVIDER_WIDTH_DP = 1
        const val DIVIDER_HEIGHT_DP = 24
        const val DIVIDER_MARGIN_DP = 2
        const val SEND_BUTTON_SIZE_DP = 44
        const val SEND_BUTTON_MARGIN_DP = 4
        const val SEND_BUTTON_ELEVATION_DP = 2
        const val SEND_ICON_SIZE_DP = 17
        const val LABEL_TEXT_SP = 10f
        const val VALUE_TEXT_SP = 12f
        const val MENU_TEXT_SP = 14f
        const val MENU_ROW_PADDING_DP = 10
        const val MENU_OPTION_HEIGHT_DP = 40
        const val MENU_PADDING_DP = 5
        const val MENU_CORNER_RADIUS_DP = 12f
        const val MENU_MIN_WIDTH_DP = 160
        const val MENU_MAX_WIDTH_DP = 240
        const val MENU_MAX_HEIGHT_DP = 240
        const val MENU_MARGIN_DP = 8
        const val MENU_ELEVATION_DP = 12
        const val STROKE_WIDTH_DP = 1
        const val DISABLED_ALPHA = 0.65f
    }
}

/** 白色发送箭头，避免新增 drawable 资源。 */
private class SendIconView(
    context: Context,
) : View(context) {
    private val paint =
        Paint(Paint.ANTI_ALIAS_FLAG).apply {
            style = Paint.Style.STROKE
            strokeWidth = resources.displayMetrics.density * STROKE_WIDTH_DP
            strokeCap = Paint.Cap.ROUND
            strokeJoin = Paint.Join.ROUND
            color = ContextCompat.getColor(context, R.color.quick_book_capture_on_primary)
        }
    private val path = Path()

    override fun onDraw(canvas: Canvas) {
        super.onDraw(canvas)
        val inset = width * INSET_RATIO
        val arrowHead = width * HEAD_RATIO
        val centerY = height / 2f
        val tipX = width - inset
        path.reset()
        path.moveTo(inset, centerY)
        path.lineTo(tipX, centerY)
        path.moveTo(tipX - arrowHead, centerY - arrowHead)
        path.lineTo(tipX, centerY)
        path.lineTo(tipX - arrowHead, centerY + arrowHead)
        canvas.drawPath(path, paint)
    }

    private companion object {
        const val STROKE_WIDTH_DP = 1.8f
        const val INSET_RATIO = 0.17f
        const val HEAD_RATIO = 0.2f
    }
}
