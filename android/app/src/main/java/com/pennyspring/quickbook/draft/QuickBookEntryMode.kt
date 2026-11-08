package com.pennyspring.quickbook.draft

internal enum class QuickBookEntryMode(
    val wireValue: String,
) {
    FLOATING_BALL("floatingBall"),
    NOTIFICATION("notification"),
    ;

    companion object {
        fun fromWire(value: String?): QuickBookEntryMode? = values().firstOrNull { it.wireValue == value }
    }
}
