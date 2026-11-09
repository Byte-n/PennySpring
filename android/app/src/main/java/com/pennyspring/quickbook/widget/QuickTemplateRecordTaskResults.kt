package com.pennyspring.quickbook.widget

import java.util.concurrent.ConcurrentHashMap

/** JS 在 Headless 任务结束前回报的小组件记账结果，原生据此发 Toast。 */
object QuickTemplateRecordTaskResults {
    data class Outcome(
        val requestId: String,
        val succeeded: Boolean,
        val templateName: String,
        val amountCents: Int,
        val message: String,
    )

    private val outcomes = ConcurrentHashMap<String, Outcome>()

    fun put(outcome: Outcome) {
        outcomes[outcome.requestId] = outcome
    }

    fun take(requestId: String): Outcome? = outcomes.remove(requestId)

    fun clear() {
        outcomes.clear()
    }
}
