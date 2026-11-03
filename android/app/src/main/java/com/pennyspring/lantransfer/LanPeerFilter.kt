package com.pennyspring.lantransfer

internal object LanPeerFilter {
    fun isSelf(
        id: String,
        host: String,
        currentSessionId: String,
        localHosts: Set<String>,
    ): Boolean = id == currentSessionId || host in localHosts
}
