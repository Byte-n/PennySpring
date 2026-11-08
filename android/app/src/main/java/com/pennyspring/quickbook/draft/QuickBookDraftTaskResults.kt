package com.pennyspring.quickbook.draft

import java.util.concurrent.ConcurrentHashMap

/** JS 在 Headless 任务结束前回报的草稿结果，原生据此发通知，不再读取草稿库。 */
object QuickBookDraftTaskResults {
    data class Outcome(
        val draftId: String,
        val succeeded: Boolean,
        val itemCount: Int,
    )

    private val outcomes = ConcurrentHashMap<String, Outcome>()

    fun put(outcome: Outcome) {
        outcomes[outcome.draftId] = outcome
    }

    fun take(draftId: String): Outcome? = outcomes.remove(draftId)

    fun clear() {
        outcomes.clear()
    }
}
