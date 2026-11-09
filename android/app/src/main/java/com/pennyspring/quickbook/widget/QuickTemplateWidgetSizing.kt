package com.pennyspring.quickbook.widget

/**
 * 小组件尺寸与名称展示的纯计算逻辑。
 *
 * 布局固定为 4×4 个预置格子，运行时按列数/行数显示前 N 个；
 * 名称最多显示 3 个字，第 4 个字起省略。
 */
object QuickTemplateWidgetSizing {
    const val MIN_COLUMNS = 2
    const val MAX_COLUMNS = 4
    const val MIN_ROWS = 1
    const val MAX_ROWS = 4
    const val MAX_NAME_CHARS = 3

    private const val COLUMNS_4_MIN_WIDTH_DP = 320
    private const val COLUMNS_3_MIN_WIDTH_DP = 260
    private const val HEADER_AND_PADDING_DP = 40
    private const val TILE_AND_GAP_DP = 48

    /** 一个可见模板在 4×4 预置布局中的位置。 */
    data class Slot(
        val slotIndex: Int,
        val templateIndex: Int,
    )

    fun columnsForWidth(widthDp: Int): Int =
        when {
            widthDp >= COLUMNS_4_MIN_WIDTH_DP -> 4
            widthDp >= COLUMNS_3_MIN_WIDTH_DP -> 3
            else -> 2
        }

    fun rowsForHeight(heightDp: Int): Int {
        val availableHeight = (heightDp - HEADER_AND_PADDING_DP).coerceAtLeast(0)
        return (availableHeight / TILE_AND_GAP_DP).coerceIn(MIN_ROWS, MAX_ROWS)
    }

    fun capacity(
        widthDp: Int,
        heightDp: Int,
    ): Int = columnsForWidth(widthDp) * rowsForHeight(heightDp)

    /**
     * 把前 N 个模板映射到 4×4 预置格子。
     * 2/3 列时跳过右侧格子，避免把第 4 个模板错位到上一行之外。
     */
    fun slotsForLayout(
        columns: Int,
        rows: Int,
        templateCount: Int,
    ): List<Slot> {
        val safeColumns = columns.coerceIn(MIN_COLUMNS, MAX_COLUMNS)
        val safeRows = rows.coerceIn(MIN_ROWS, MAX_ROWS)
        val count = templateCount.coerceAtLeast(0)
        val slots = mutableListOf<Slot>()
        for (row in 0 until safeRows) {
            for (column in 0 until safeColumns) {
                val templateIndex = row * safeColumns + column
                if (templateIndex >= count) {
                    continue
                }
                slots.add(
                    Slot(
                        slotIndex = row * MAX_COLUMNS + column,
                        templateIndex = templateIndex,
                    ),
                )
            }
        }
        return slots
    }

    fun truncateName(name: String): String {
        val trimmed = name.trim()
        val codePointCount = trimmed.codePointCount(0, trimmed.length)
        if (codePointCount <= MAX_NAME_CHARS) {
            return trimmed
        }
        val endIndex = trimmed.offsetByCodePoints(0, MAX_NAME_CHARS)
        return trimmed.substring(0, endIndex) + "…"
    }
}
