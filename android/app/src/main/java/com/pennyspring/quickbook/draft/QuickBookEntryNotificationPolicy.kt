package com.pennyspring.quickbook.draft

internal object QuickBookEntryNotificationPolicy {
    fun shouldRepost(
        entryEnabled: Boolean,
        entryMode: String?,
        notificationsAllowed: Boolean,
        disabledByUser: Boolean,
    ): Boolean =
        entryEnabled &&
            !disabledByUser &&
            entryMode == QuickBookEntryMode.NOTIFICATION.wireValue &&
            notificationsAllowed
}
