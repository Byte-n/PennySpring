package com.pennyspring.quickbook.draft

/**
 * 进程级草稿任务登记表：限制并发任务数，并把 RN Headless taskId 关联到 draftId。
 *
 * RN 每次启动 Headless 任务都会重放当前所有活跃 taskId，
 * 因此只有大于历史最大值的 taskId 才会被绑定，重放事件直接忽略。
 */
class QuickBookTaskRegistry(
    private val maxConcurrent: Int,
    private val staleAfterMs: Long,
    private val now: () -> Long = System::currentTimeMillis,
) {
    private data class PendingTask(
        val draftId: String,
        val enqueuedAt: Long,
    )

    private val lock = Any()
    private val activeDrafts = LinkedHashMap<String, Long>()
    private val pendingTasks = ArrayDeque<PendingTask>()
    private val taskIdToDraftId = HashMap<Int, String>()
    private var lastTaskId = 0

    /** 占用一个并发槽位；超过上限返回 false。 */
    fun tryAcquire(draftId: String): Boolean {
        synchronized(lock) {
            removeStaleLocked()
            if (activeDrafts.size >= maxConcurrent) {
                return false
            }
            activeDrafts[draftId] = now()
            return true
        }
    }

    /** 任务尚未真正启动时的回滚释放。 */
    fun release(draftId: String) {
        synchronized(lock) {
            activeDrafts.remove(draftId)
        }
    }

    /** 记录一次待启动任务，等待 onHeadlessJsTaskStart 绑定 taskId。 */
    fun expectTask(draftId: String) {
        synchronized(lock) {
            pendingTasks.addLast(PendingTask(draftId, now()))
        }
    }

    /** 启动失败时撤销待绑定记录。 */
    fun cancelExpectedTask(draftId: String) {
        synchronized(lock) {
            pendingTasks.removeAll { it.draftId == draftId }
        }
    }

    /** 把新 taskId 绑定到最早等待的 draftId；重放或未知 taskId 返回 null。 */
    fun bindTask(taskId: Int): String? {
        synchronized(lock) {
            if (taskId <= lastTaskId || taskIdToDraftId.containsKey(taskId)) {
                return null
            }
            lastTaskId = taskId
            removeStaleLocked()
            removeStalePendingLocked()
            val pending = pendingTasks.removeFirstOrNull() ?: return null
            taskIdToDraftId[taskId] = pending.draftId
            return pending.draftId
        }
    }

    /** 任务结束时解绑并释放槽位，返回对应 draftId；未知 taskId 返回 null。 */
    fun completeTask(taskId: Int): String? {
        synchronized(lock) {
            val draftId = taskIdToDraftId.remove(taskId) ?: return null
            activeDrafts.remove(draftId)
            return draftId
        }
    }

    /** 根据草稿 id 查已绑定的 RN taskId；未绑定返回 null。 */
    fun findTaskId(draftId: String): Int? {
        synchronized(lock) {
            return taskIdToDraftId.entries.firstOrNull { it.value == draftId }?.key
        }
    }

    /** ReactContext 重建后 RN taskId 会从头计数，需要清空旧映射并释放对应槽位。 */
    fun resetTaskMappings() {
        synchronized(lock) {
            val mappedDraftIds = taskIdToDraftId.values.toSet()
            taskIdToDraftId.clear()
            pendingTasks.clear()
            lastTaskId = 0
            mappedDraftIds.forEach { activeDrafts.remove(it) }
        }
    }

    fun activeCount(): Int {
        synchronized(lock) {
            removeStaleLocked()
            return activeDrafts.size
        }
    }

    private fun removeStaleLocked() {
        val timestamp = now()
        val iterator = activeDrafts.entries.iterator()
        while (iterator.hasNext()) {
            val entry = iterator.next()
            if (timestamp - entry.value > staleAfterMs) {
                iterator.remove()
            }
        }
    }

    private fun removeStalePendingLocked() {
        val timestamp = now()
        while (pendingTasks.isNotEmpty() && timestamp - pendingTasks.first().enqueuedAt > staleAfterMs) {
            val stale = pendingTasks.removeFirst()
            activeDrafts.remove(stale.draftId)
        }
    }
}
