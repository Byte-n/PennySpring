package com.pennyspring.quickbook.draft

import org.junit.Assert.assertEquals
import org.junit.Assert.assertNotNull
import org.junit.Assert.assertNull
import org.junit.Test

class SelectionBoundsCalculatorTest {
    private val padding = 3f
    private val minSize = 64f
    private val viewWidth = 375
    private val viewHeight = 812

    @Test
    fun returnsBoundingBoxWithPadding() {
        val bounds =
            SelectionBoundsCalculator.compute(
                points = listOf(SelectionPoint(100f, 200f), SelectionPoint(300f, 400f)),
                viewWidth = viewWidth,
                viewHeight = viewHeight,
                padding = padding,
                minSize = minSize,
            )

        assertNotNull(bounds)
        assertEquals(97f, bounds!!.left, DELTA)
        assertEquals(197f, bounds.top, DELTA)
        assertEquals(303f, bounds.right, DELTA)
        assertEquals(403f, bounds.bottom, DELTA)
    }

    @Test
    fun clampsBoundingBoxToViewBounds() {
        val bounds =
            SelectionBoundsCalculator.compute(
                points = listOf(SelectionPoint(-20f, -10f), SelectionPoint(500f, 900f)),
                viewWidth = viewWidth,
                viewHeight = viewHeight,
                padding = padding,
                minSize = minSize,
            )

        assertNotNull(bounds)
        assertEquals(0f, bounds!!.left, DELTA)
        assertEquals(0f, bounds.top, DELTA)
        assertEquals(viewWidth.toFloat(), bounds.right, DELTA)
        assertEquals(viewHeight.toFloat(), bounds.bottom, DELTA)
    }

    @Test
    fun returnsNullWhenEitherSideIsSmallerThanMinimum() {
        val bounds =
            SelectionBoundsCalculator.compute(
                points = listOf(SelectionPoint(100f, 200f), SelectionPoint(130f, 400f)),
                viewWidth = viewWidth,
                viewHeight = viewHeight,
                padding = padding,
                minSize = minSize,
            )

        assertNull(bounds)
    }

    @Test
    fun acceptsBoundsExactlyAtMinimumSize() {
        val bounds =
            SelectionBoundsCalculator.compute(
                points = listOf(SelectionPoint(100f, 200f), SelectionPoint(158f, 258f)),
                viewWidth = viewWidth,
                viewHeight = viewHeight,
                padding = padding,
                minSize = minSize,
            )

        assertNotNull(bounds)
        assertEquals(64f, bounds!!.width, DELTA)
        assertEquals(64f, bounds.height, DELTA)
    }

    @Test
    fun returnsNullForEmptyPoints() {
        val bounds =
            SelectionBoundsCalculator.compute(
                points = emptyList(),
                viewWidth = viewWidth,
                viewHeight = viewHeight,
                padding = padding,
                minSize = minSize,
            )

        assertNull(bounds)
    }

    @Test
    fun returnsNullForUnmeasuredView() {
        val bounds =
            SelectionBoundsCalculator.compute(
                points = listOf(SelectionPoint(100f, 200f), SelectionPoint(300f, 400f)),
                viewWidth = 0,
                viewHeight = viewHeight,
                padding = padding,
                minSize = minSize,
            )

        assertNull(bounds)
    }

    private companion object {
        const val DELTA = 0.001f
    }
}
