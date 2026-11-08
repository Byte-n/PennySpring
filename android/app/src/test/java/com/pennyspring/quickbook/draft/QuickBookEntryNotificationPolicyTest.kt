package com.pennyspring.quickbook.draft

import org.junit.Assert.assertFalse
import org.junit.Assert.assertTrue
import org.junit.Test

class QuickBookEntryNotificationPolicyTest {
    @Test
    fun repostsWhenNotificationModeIsEnabledAndNotificationsAreAllowed() {
        assertTrue(
            QuickBookEntryNotificationPolicy.shouldRepost(
                entryEnabled = true,
                entryMode = QuickBookEntryMode.NOTIFICATION.wireValue,
                notificationsAllowed = true,
                disabledByUser = false,
            ),
        )
    }

    @Test
    fun skipsWhenEntryIsDisabled() {
        assertFalse(
            QuickBookEntryNotificationPolicy.shouldRepost(
                entryEnabled = false,
                entryMode = QuickBookEntryMode.NOTIFICATION.wireValue,
                notificationsAllowed = true,
                disabledByUser = false,
            ),
        )
    }

    @Test
    fun skipsWhenUserJustClosedTheEntry() {
        assertFalse(
            QuickBookEntryNotificationPolicy.shouldRepost(
                entryEnabled = true,
                entryMode = QuickBookEntryMode.NOTIFICATION.wireValue,
                notificationsAllowed = true,
                disabledByUser = true,
            ),
        )
    }

    @Test
    fun skipsWhenFloatingBallModeIsActive() {
        assertFalse(
            QuickBookEntryNotificationPolicy.shouldRepost(
                entryEnabled = true,
                entryMode = QuickBookEntryMode.FLOATING_BALL.wireValue,
                notificationsAllowed = true,
                disabledByUser = false,
            ),
        )
    }

    @Test
    fun skipsWhenEntryModeIsMissing() {
        assertFalse(
            QuickBookEntryNotificationPolicy.shouldRepost(
                entryEnabled = true,
                entryMode = null,
                notificationsAllowed = true,
                disabledByUser = false,
            ),
        )
    }

    @Test
    fun skipsWhenNotificationsAreDisabled() {
        assertFalse(
            QuickBookEntryNotificationPolicy.shouldRepost(
                entryEnabled = true,
                entryMode = QuickBookEntryMode.NOTIFICATION.wireValue,
                notificationsAllowed = false,
                disabledByUser = false,
            ),
        )
    }
}
