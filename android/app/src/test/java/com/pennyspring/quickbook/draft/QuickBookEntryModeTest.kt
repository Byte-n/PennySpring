package com.pennyspring.quickbook.draft

import org.junit.Assert.assertEquals
import org.junit.Assert.assertNull
import org.junit.Test

class QuickBookEntryModeTest {
    @Test
    fun parsesFloatingBallMode() {
        assertEquals(QuickBookEntryMode.FLOATING_BALL, QuickBookEntryMode.fromWire("floatingBall"))
    }

    @Test
    fun parsesNotificationMode() {
        assertEquals(QuickBookEntryMode.NOTIFICATION, QuickBookEntryMode.fromWire("notification"))
    }

    @Test
    fun rejectsUnknownOrMissingMode() {
        assertNull(QuickBookEntryMode.fromWire("other"))
        assertNull(QuickBookEntryMode.fromWire(null))
    }
}
