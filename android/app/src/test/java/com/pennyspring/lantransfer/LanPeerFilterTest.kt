package com.pennyspring.lantransfer

import org.junit.Assert.assertFalse
import org.junit.Assert.assertTrue
import org.junit.Test

class LanPeerFilterTest {
    private val localHosts = setOf("192.168.1.23")

    @Test
    fun treatsCurrentSessionAsSelf() {
        assertTrue(
            LanPeerFilter.isSelf(
                id = "current-session",
                host = "192.168.1.23",
                currentSessionId = "current-session",
                localHosts = localHosts,
            ),
        )
    }

    @Test
    fun treatsLocalHostAsSelfEvenWithStaleSessionId() {
        assertTrue(
            LanPeerFilter.isSelf(
                id = "previous-session",
                host = "192.168.1.23",
                currentSessionId = "current-session",
                localHosts = localHosts,
            ),
        )
    }

    @Test
    fun acceptsPeerFromAnotherDevice() {
        assertFalse(
            LanPeerFilter.isSelf(
                id = "other-device",
                host = "192.168.1.42",
                currentSessionId = "current-session",
                localHosts = localHosts,
            ),
        )
    }
}
