package com.pennyspring.quickbook.draft

internal data class SelectionPoint(
    val x: Float,
    val y: Float,
)

internal data class SelectionBounds(
    val left: Float,
    val top: Float,
    val right: Float,
    val bottom: Float,
) {
    val width: Float
        get() = right - left

    val height: Float
        get() = bottom - top
}

/**
 * 把一条手绘路径的外接矩形夹到视图内，并按最小尺寸判定是否有效。
 */
internal object SelectionBoundsCalculator {
    fun compute(
        points: List<SelectionPoint>,
        viewWidth: Int,
        viewHeight: Int,
        padding: Float,
        minSize: Float,
    ): SelectionBounds? {
        if (points.isEmpty() || viewWidth <= 0 || viewHeight <= 0) {
            return null
        }
        val maxWidth = viewWidth.toFloat()
        val maxHeight = viewHeight.toFloat()
        var minX = Float.POSITIVE_INFINITY
        var minY = Float.POSITIVE_INFINITY
        var maxX = Float.NEGATIVE_INFINITY
        var maxY = Float.NEGATIVE_INFINITY
        points.forEach { point ->
            minX = minOf(minX, point.x)
            minY = minOf(minY, point.y)
            maxX = maxOf(maxX, point.x)
            maxY = maxOf(maxY, point.y)
        }
        val bounds =
            SelectionBounds(
                left = (minX - padding).coerceIn(0f, maxWidth),
                top = (minY - padding).coerceIn(0f, maxHeight),
                right = (maxX + padding).coerceIn(0f, maxWidth),
                bottom = (maxY + padding).coerceIn(0f, maxHeight),
            )
        if (bounds.width < minSize || bounds.height < minSize) {
            return null
        }
        return bounds
    }
}
