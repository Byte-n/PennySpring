package com.pennyspring.quickbook.draft

import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertNull
import org.junit.Assert.assertTrue
import org.junit.Test

class QuickBookTaskRegistryTest {
    private var now = 0L

    private fun createRegistry(
        maxConcurrent: Int = 2,
        staleAfterMs: Long = 1_000L,
    ): QuickBookTaskRegistry =
        QuickBookTaskRegistry(
            maxConcurrent = maxConcurrent,
            staleAfterMs = staleAfterMs,
            now = { now },
        )

    @Test
    fun rejectsTaskWhenConcurrencyLimitReached() {
        val registry = createRegistry(maxConcurrent = 2)

        assertTrue(registry.tryAcquire("draft-1"))
        assertTrue(registry.tryAcquire("draft-2"))
        assertFalse(registry.tryAcquire("draft-3"))
        assertEquals(2, registry.activeCount())
    }

    @Test
    fun releasesSlotAfterTaskCompletes() {
        val registry = createRegistry(maxConcurrent = 1)
        registry.tryAcquire("draft-1")
        registry.expectTask("draft-1")
        assertEquals("draft-1", registry.bindTask(1))

        assertEquals("draft-1", registry.completeTask(1))
        assertEquals(0, registry.activeCount())
        assertTrue(registry.tryAcquire("draft-2"))
    }

    @Test
    fun bindsTaskIdsToPendingDraftsInOrder() {
        val registry = createRegistry()
        registry.tryAcquire("draft-1")
        registry.tryAcquire("draft-2")
        registry.expectTask("draft-1")
        registry.expectTask("draft-2")

        assertEquals("draft-1", registry.bindTask(1))
        assertEquals("draft-2", registry.bindTask(2))
    }

    @Test
    fun ignoresReplayedTaskIds() {
        val registry = createRegistry()
        registry.tryAcquire("draft-1")
        registry.tryAcquire("draft-2")
        registry.expectTask("draft-1")
        registry.expectTask("draft-2")
        assertEquals("draft-1", registry.bindTask(2))

        assertNull(registry.bindTask(2))
        assertNull(registry.bindTask(1))
        assertEquals("draft-2", registry.bindTask(3))
    }

    @Test
    fun returnsNullWhenCompletingUnknownTask() {
        val registry = createRegistry()
        registry.tryAcquire("draft-1")

        assertNull(registry.completeTask(99))
        assertEquals(1, registry.activeCount())
    }

    @Test
    fun expiresStaleActiveDrafts() {
        val registry = createRegistry(maxConcurrent = 1, staleAfterMs = 1_000L)
        registry.tryAcquire("draft-1")

        now += 1_001L

        assertEquals(0, registry.activeCount())
        assertTrue(registry.tryAcquire("draft-2"))
    }

    @Test
    fun dropsStalePendingDraftsBeforeBinding() {
        val registry = createRegistry(staleAfterMs = 1_000L)
        registry.tryAcquire("draft-1")
        registry.expectTask("draft-1")

        now += 1_001L
        registry.tryAcquire("draft-2")
        registry.expectTask("draft-2")

        assertEquals("draft-2", registry.bindTask(1))
        assertEquals(1, registry.activeCount())
    }

    @Test
    fun cancelsExpectedTaskWithoutReleasingActiveDraft() {
        val registry = createRegistry()
        registry.tryAcquire("draft-1")
        registry.expectTask("draft-1")

        registry.cancelExpectedTask("draft-1")

        assertNull(registry.bindTask(1))
        assertEquals(1, registry.activeCount())
    }

    @Test
    fun findsTaskIdByDraftId() {
        val registry = createRegistry()
        registry.tryAcquire("draft-1")
        registry.expectTask("draft-1")
        assertEquals("draft-1", registry.bindTask(7))

        assertEquals(7, registry.findTaskId("draft-1"))
        assertNull(registry.findTaskId("draft-2"))
    }

    @Test
    fun activeDraftIdsKeepsBoundTasksThatAreRunning() {
        val registry = createRegistry()
        registry.tryAcquire("draft-1")
        registry.expectTask("draft-1")
        assertEquals("draft-1", registry.bindTask(1))

        assertEquals(setOf("draft-1"), registry.activeDraftIds { true })
    }

    @Test
    fun activeDraftIdsDropsBoundTasksThatAreNoLongerRunning() {
        val registry = createRegistry(maxConcurrent = 1)
        registry.tryAcquire("draft-1")
        registry.expectTask("draft-1")
        assertEquals("draft-1", registry.bindTask(1))

        assertTrue(registry.activeDraftIds { false }.isEmpty())
        // 查询不能解绑 taskId，否则任务结束回调会丢结果。
        assertEquals("draft-1", registry.completeTask(1))
        assertEquals(0, registry.activeCount())
    }

    @Test
    fun activeDraftIdsKeepsPendingDraftsWithoutBoundTask() {
        val registry = createRegistry()
        registry.tryAcquire("draft-1")
        registry.expectTask("draft-1")

        assertEquals(setOf("draft-1"), registry.activeDraftIds { false })
    }

    @Test
    fun resetTaskMappingsReleasesDraftsAndRestartsTaskIds() {
        val registry = createRegistry()
        registry.tryAcquire("draft-1")
        registry.expectTask("draft-1")
        assertEquals("draft-1", registry.bindTask(3))

        registry.resetTaskMappings()

        assertEquals(0, registry.activeCount())
        registry.tryAcquire("draft-2")
        registry.expectTask("draft-2")
        assertEquals("draft-2", registry.bindTask(1))
    }
}
