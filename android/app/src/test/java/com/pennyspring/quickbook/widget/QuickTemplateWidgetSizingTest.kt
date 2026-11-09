package com.pennyspring.quickbook.widget

import org.junit.Assert.assertEquals
import org.junit.Test

class QuickTemplateWidgetSizingTest {
    @Test
    fun `width 343 uses four columns`() {
        assertEquals(4, QuickTemplateWidgetSizing.columnsForWidth(343))
    }

    @Test
    fun `width between 320 and 259 uses three columns`() {
        assertEquals(4, QuickTemplateWidgetSizing.columnsForWidth(320))
        assertEquals(3, QuickTemplateWidgetSizing.columnsForWidth(319))
        assertEquals(3, QuickTemplateWidgetSizing.columnsForWidth(260))
        assertEquals(2, QuickTemplateWidgetSizing.columnsForWidth(259))
    }

    @Test
    fun `height 136 uses two rows`() {
        assertEquals(2, QuickTemplateWidgetSizing.rowsForHeight(136))
    }

    @Test
    fun `height 184 uses three rows`() {
        assertEquals(3, QuickTemplateWidgetSizing.rowsForHeight(184))
    }

    @Test
    fun `height 232 uses four rows`() {
        assertEquals(4, QuickTemplateWidgetSizing.rowsForHeight(232))
    }

    @Test
    fun `height below one row is clamped to one row`() {
        assertEquals(1, QuickTemplateWidgetSizing.rowsForHeight(60))
    }

    @Test
    fun `height above four rows is clamped to four rows`() {
        assertEquals(4, QuickTemplateWidgetSizing.rowsForHeight(400))
    }

    @Test
    fun `capacity for 343 by 136 is eight`() {
        assertEquals(8, QuickTemplateWidgetSizing.capacity(343, 136))
    }

    @Test
    fun `capacity for 250 by 136 is four`() {
        assertEquals(4, QuickTemplateWidgetSizing.capacity(250, 136))
    }

    @Test
    fun `slots for two columns skip the right side of the preset grid`() {
        val slots = QuickTemplateWidgetSizing.slotsForLayout(columns = 2, rows = 2, templateCount = 4)

        assertEquals(
            listOf(
                QuickTemplateWidgetSizing.Slot(slotIndex = 0, templateIndex = 0),
                QuickTemplateWidgetSizing.Slot(slotIndex = 1, templateIndex = 1),
                QuickTemplateWidgetSizing.Slot(slotIndex = 4, templateIndex = 2),
                QuickTemplateWidgetSizing.Slot(slotIndex = 5, templateIndex = 3),
            ),
            slots,
        )
    }

    @Test
    fun `slots for three columns stay inside the preset grid`() {
        val slots = QuickTemplateWidgetSizing.slotsForLayout(columns = 3, rows = 2, templateCount = 6)

        assertEquals(
            listOf(0, 1, 2, 4, 5, 6),
            slots.map { it.slotIndex },
        )
        assertEquals(
            listOf(0, 1, 2, 3, 4, 5),
            slots.map { it.templateIndex },
        )
    }

    @Test
    fun `slots only include available templates`() {
        val slots = QuickTemplateWidgetSizing.slotsForLayout(columns = 4, rows = 4, templateCount = 3)

        assertEquals(3, slots.size)
        assertEquals(0, slots[0].slotIndex)
        assertEquals(2, slots[2].slotIndex)
    }

    @Test
    fun `slots clamp invalid column and row values`() {
        val slots = QuickTemplateWidgetSizing.slotsForLayout(columns = 99, rows = 99, templateCount = 20)

        assertEquals(16, slots.size)
        assertEquals(15, slots.last().slotIndex)
    }

    @Test
    fun `name with three characters is not truncated`() {
        assertEquals("早餐店", QuickTemplateWidgetSizing.truncateName("早餐店"))
    }

    @Test
    fun `name with four characters is truncated to three plus ellipsis`() {
        assertEquals("还信用…", QuickTemplateWidgetSizing.truncateName("还信用卡"))
    }

    @Test
    fun `blank name stays blank`() {
        assertEquals("", QuickTemplateWidgetSizing.truncateName("  "))
    }
}
