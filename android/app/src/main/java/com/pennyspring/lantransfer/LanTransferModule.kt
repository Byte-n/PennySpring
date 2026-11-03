package com.pennyspring.lantransfer

import android.content.Context
import android.net.Uri
import android.net.nsd.NsdManager
import android.net.nsd.NsdServiceInfo
import android.os.Build
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.ReadableArray
import org.json.JSONObject
import java.io.BufferedInputStream
import java.io.BufferedOutputStream
import java.io.File
import java.io.FileInputStream
import java.io.InputStream
import java.io.OutputStream
import java.net.Inet4Address
import java.net.InetSocketAddress
import java.net.ServerSocket
import java.net.Socket
import java.net.URLDecoder
import java.nio.charset.StandardCharsets
import java.security.SecureRandom

class LanTransferModule(
    private val reactContext: ReactApplicationContext,
) : ReactContextBaseJavaModule(reactContext) {
    companion object {
        private const val DEFAULT_TIMEOUT_MS = 30 * 60 * 1000L
        private const val MIN_TIMEOUT_MS = 60 * 1000L
        private const val MAX_TIMEOUT_MS = 60 * 60 * 1000L
        private const val MAX_MESSAGES = 100
        private const val COPY_BUFFER = 64 * 1024
        private const val CLIENT_READ_TIMEOUT_MS = 10_000
        private const val SERVICE_TYPE = "_pennyspring._tcp."
        private const val SERVICE_PREFIX = "PennySpring-"
        private const val PEER_TTL_MS = 15_000L
    }

    private data class Peer(
        val id: String,
        val name: String,
        val platform: String,
        val nonce: String,
        val host: String,
        val port: Int,
        val lastSeen: Long,
    )

    private data class Envelope(
        val id: String,
        val body: String,
        val receivedAt: Long,
    )

    private data class Source(
        val stream: InputStream,
        val length: Long,
    )

    private val lock = Any()
    private val random = SecureRandom()

    private var serverSession: LanServerSession? = null

    @Volatile
    private var state = "idle"

    @Volatile
    private var errorText = ""

    @Volatile
    private var servedAt = 0L

    private val peers = linkedMapOf<String, Peer>()
    private val messages = mutableListOf<Envelope>()
    private val resolving = mutableSetOf<String>()
    private var messageSequence = 0L

    private var packageUri: String? = null
    private var packageToken = ""
    private var localHosts: Set<String> = emptySet()

    private var nsdManager: NsdManager? = null
    private var registrationListener: NsdManager.RegistrationListener? = null
    private var discoveryListener: NsdManager.DiscoveryListener? = null

    override fun getName(): String = "LanTransfer"

    @ReactMethod
    fun startSession(
        timeoutMs: Double,
        promise: Promise,
    ) {
        val timeout =
            timeoutMs.toLong().takeIf {
                it in MIN_TIMEOUT_MS..MAX_TIMEOUT_MS
            } ?: DEFAULT_TIMEOUT_MS

        synchronized(lock) {
            closeSessionLocked()
            resetLocked()

            try {
                val addresses = localAddresses()
                localHosts = addresses.toSet()
                val socket =
                    ServerSocket().apply {
                        reuseAddress = true
                        bind(InetSocketAddress(0))
                    }
                val info =
                    LanSessionInfo(
                        id = randomHex(8),
                        name = deviceName(),
                        nonce = randomHex(16),
                        port = socket.localPort,
                    )
                val created =
                    LanServerSession(
                        serverSocket = socket,
                        info = info,
                        timeoutMs = timeout,
                        handler = ::handleClient,
                        listener = ::onSessionFinished,
                    )
                serverSession = created
                state = "serving"
                errorText = ""
                servedAt = 0L

                created.start()
                startNsd(created)

                val urls = Arguments.createArray()
                addresses.forEach { host ->
                    urls.pushString("http://$host:${info.port}")
                }
                promise.resolve(
                    Arguments.createMap().apply {
                        putString("id", info.id)
                        putString("name", info.name)
                        putString("platform", "android")
                        putString("nonce", info.nonce)
                        putString("host", addresses.firstOrNull() ?: "127.0.0.1")
                        putInt("port", info.port)
                        putArray("urls", urls)
                    },
                )
            } catch (error: Exception) {
                closeSessionLocked()
                resetLocked()
                state = "error"
                errorText = error.message ?: "无法启动局域网服务"
                promise.reject(
                    "E_START_SESSION",
                    error.message ?: "无法启动局域网服务",
                    error,
                )
            }
        }
    }

    @ReactMethod
    fun stopSession(promise: Promise) {
        synchronized(lock) {
            closeSessionLocked()
            resetLocked()
        }
        promise.resolve(null)
    }

    @ReactMethod
    fun getNearby(promise: Promise) {
        val now = System.currentTimeMillis()
        val result = Arguments.createArray()
        synchronized(lock) {
            peers.values
                .filter { now - it.lastSeen <= PEER_TTL_MS }
                .forEach { peer ->
                    result.pushMap(
                        Arguments.createMap().apply {
                            putString("id", peer.id)
                            putString("name", peer.name)
                            putString("platform", peer.platform)
                            putString("nonce", peer.nonce)
                            putString("host", peer.host)
                            putInt("port", peer.port)
                        },
                    )
                }
        }
        promise.resolve(result)
    }

    @ReactMethod
    fun getMessages(promise: Promise) {
        val result = Arguments.createArray()
        synchronized(lock) {
            messages.forEach { message ->
                result.pushMap(
                    Arguments.createMap().apply {
                        putString("id", message.id)
                        putString("body", message.body)
                        putDouble("receivedAt", message.receivedAt.toDouble())
                    },
                )
            }
        }
        promise.resolve(result)
    }

    @ReactMethod
    fun clearMessages(
        ids: ReadableArray,
        promise: Promise,
    ) {
        val removeIds = mutableSetOf<String>()
        for (index in 0 until ids.size()) {
            ids.getString(index)?.let { removeIds.add(it) }
        }
        synchronized(lock) {
            messages.removeAll { envelope -> removeIds.contains(envelope.id) }
        }
        promise.resolve(null)
    }

    @ReactMethod
    fun setPackage(
        fileUri: String,
        fileName: String,
        token: String,
        promise: Promise,
    ) {
        try {
            if (fileName.isBlank()) {
                throw IllegalStateException("备份文件名不能为空")
            }
            openSource(fileUri).stream.use {
                synchronized(lock) {
                    packageUri = fileUri
                    packageToken = token
                }
            }
            promise.resolve(null)
        } catch (error: Exception) {
            promise.reject(
                "E_PACKAGE",
                error.message ?: "无法读取待发送的备份文件",
                error,
            )
        }
    }

    @ReactMethod
    fun getStatus(promise: Promise) {
        promise.resolve(
            Arguments.createMap().apply {
                putString("state", state)
                putString("error", errorText)
                putDouble("servedAt", servedAt.toDouble())
            },
        )
    }

    @ReactMethod
    fun randomToken(promise: Promise) {
        promise.resolve(randomHex(16))
    }

    private fun onSessionFinished(
        finished: LanServerSession,
        reason: LanServerSession.FinishReason,
    ) {
        synchronized(lock) {
            if (serverSession !== finished) return
            serverSession = null
            stopNsdLocked()
            when (reason) {
                LanServerSession.FinishReason.Stopped -> {
                    state = "idle"
                    errorText = ""
                    servedAt = 0L
                }
                LanServerSession.FinishReason.TimedOut -> {
                    state = "error"
                    errorText = "局域网会话已超时"
                }
                is LanServerSession.FinishReason.Failed -> {
                    state = "error"
                    errorText = reason.error.message ?: "局域网服务异常"
                }
            }
        }
    }

    private fun closeSessionLocked() {
        val current = serverSession
        serverSession = null
        current?.close()
        stopNsdLocked()
    }

    private fun resetLocked() {
        state = "idle"
        errorText = ""
        servedAt = 0L
        messageSequence = 0L
        messages.clear()
        packageUri = null
        packageToken = ""
        localHosts = emptySet()
    }

    private fun isActiveSession(owner: LanServerSession): Boolean =
        synchronized(lock) {
            serverSession === owner
        }

    private fun handleClient(
        owner: LanServerSession,
        client: Socket,
    ) {
        client.use { connection ->
            try {
                connection.soTimeout = CLIENT_READ_TIMEOUT_MS
                val input = BufferedInputStream(connection.getInputStream())
                val output = BufferedOutputStream(connection.getOutputStream())
                try {
                    val request = LanHttp.readRequest(input)
                    if (request == null) {
                        LanHttp.writeText(output, "400 Bad Request", "请求格式不正确")
                        return
                    }
                    routeRequest(owner, request, output)
                } catch (_: Exception) {
                    try {
                        LanHttp.writeText(output, "500 Internal Server Error", "传输失败")
                    } catch (_: Exception) {
                        // 连接已断开。
                    }
                } finally {
                    try {
                        output.flush()
                    } catch (_: Exception) {
                        // 连接已断开。
                    }
                }
            } catch (_: Exception) {
                // 连接已断开。
            }
        }
    }

    private fun routeRequest(
        owner: LanServerSession,
        request: HttpRequest,
        output: OutputStream,
    ) {
        if (!isActiveSession(owner)) {
            LanHttp.writeText(output, "503 Service Unavailable", "局域网会话已结束")
            return
        }

        val path = request.target.substringBefore('?')
        when {
            request.method == "OPTIONS" -> {
                LanHttp.writeText(output, "204 No Content", "")
            }
            request.method == "GET" && path == "/health" -> {
                val info = owner.info
                val body =
                    JSONObject()
                        .put("id", info.id)
                        .put("name", info.name)
                        .put("platform", "android")
                        .put("nonce", info.nonce)
                        .put("port", info.port)
                        .toString()
                LanHttp.writeJson(output, "200 OK", body)
            }
            request.method == "POST" && path == "/message" -> {
                handleMessagePost(owner, request, output)
            }
            request.method == "GET" && path == "/package" -> {
                servePackage(owner, request.target, output)
            }
            else -> {
                LanHttp.writeText(output, "404 Not Found", "未找到传输内容")
            }
        }
    }

    private fun handleMessagePost(
        owner: LanServerSession,
        request: HttpRequest,
        output: OutputStream,
    ) {
        if (request.body.isEmpty()) {
            LanHttp.writeText(output, "400 Bad Request", "消息不能为空")
            return
        }

        val rejection =
            synchronized(lock) {
                when {
                    serverSession !== owner -> "局域网会话已结束"
                    messages.size >= MAX_MESSAGES -> "消息队列已满"
                    else -> {
                        messageSequence += 1
                        messages.add(
                            Envelope(
                                id = "m-$messageSequence-${System.currentTimeMillis()}",
                                body = request.body,
                                receivedAt = System.currentTimeMillis(),
                            ),
                        )
                        null
                    }
                }
            }

        if (rejection != null) {
            LanHttp.writeText(output, "503 Service Unavailable", rejection)
            return
        }
        LanHttp.writeJson(output, "200 OK", "{\"ok\":true}")
    }

    private fun servePackage(
        owner: LanServerSession,
        target: String,
        output: OutputStream,
    ) {
        val query = target.substringAfter('?', "")
        val token =
            query
                .split('&')
                .firstOrNull { it.startsWith("token=") }
                ?.substringAfter('=')
                ?.let { URLDecoder.decode(it, StandardCharsets.UTF_8.name()) }

        var failure: Pair<String, String>? = null
        var fileUri: String? = null
        synchronized(lock) {
            val currentUri = packageUri
            when {
                serverSession !== owner -> failure = "503 Service Unavailable" to "局域网会话已结束"
                token.isNullOrEmpty() || token != packageToken -> failure = "403 Forbidden" to "传输会话已失效"
                currentUri == null -> failure = "404 Not Found" to "没有待发送的文件"
                else -> fileUri = currentUri
            }
        }

        val currentUri = fileUri
        if (currentUri == null) {
            failure?.let { (status, message) -> LanHttp.writeText(output, status, message) }
            return
        }

        val source =
            try {
                openSource(currentUri)
            } catch (_: Exception) {
                LanHttp.writeText(output, "500 Internal Server Error", "无法读取待发送文件")
                return
            }

        source.stream.use { stream ->
            val headers =
                buildString {
                    append("HTTP/1.1 200 OK\r\n")
                    append("Content-Type: application/zip\r\n")
                    append("Content-Length: ${source.length}\r\n")
                    append("Content-Disposition: attachment; filename=\"pennyspring-backup.psb\"\r\n")
                    append("Connection: close\r\n")
                    append("\r\n")
                }
            output.write(headers.toByteArray(StandardCharsets.ISO_8859_1))
            val buffer = ByteArray(COPY_BUFFER)
            while (true) {
                val read = stream.read(buffer)
                if (read <= 0) break
                output.write(buffer, 0, read)
            }
            output.flush()
        }

        synchronized(lock) {
            if (serverSession === owner) {
                servedAt = System.currentTimeMillis()
            }
        }
    }

    private fun openSource(raw: String): Source {
        if (raw.startsWith("content://")) {
            val uri = Uri.parse(raw)
            val descriptor =
                reactContext.contentResolver.openAssetFileDescriptor(uri, "r")
                    ?: throw IllegalStateException("无法读取待发送的备份文件")
            val stream =
                descriptor.createInputStream()
                    ?: throw IllegalStateException("无法读取待发送的备份文件")
            return Source(stream, descriptor.length)
        }

        val path =
            if (raw.startsWith("file://")) {
                Uri.decode(raw.removePrefix("file://"))
            } else {
                raw
            }
        val file = File(path)
        if (!file.isFile) {
            throw IllegalStateException("待发送的备份文件不存在")
        }
        return Source(FileInputStream(file), file.length())
    }

    private fun deviceName(): String = Build.MODEL?.trim()?.takeIf { it.isNotEmpty() } ?: "Android 设备"

    private fun randomHex(bytes: Int): String {
        val data = ByteArray(bytes)
        random.nextBytes(data)
        return data.joinToString("") { "%02x".format(it) }
    }

    private fun localAddresses(): List<String> {
        val addresses = mutableListOf<String>()
        try {
            val interfaces = java.net.NetworkInterface.getNetworkInterfaces()
            if (interfaces != null) {
                for (networkInterface in interfaces) {
                    if (!networkInterface.isUp || networkInterface.isLoopback) continue
                    for (address in networkInterface.inetAddresses) {
                        if (address is Inet4Address &&
                            !address.isLoopbackAddress &&
                            address.isSiteLocalAddress
                        ) {
                            val host = address.hostAddress ?: continue
                            if (!addresses.contains(host)) addresses.add(host)
                        }
                    }
                }
            }
        } catch (_: Exception) {
            // 没有可枚举的网卡时回退到本机地址。
        }
        if (addresses.isEmpty()) addresses.add("127.0.0.1")
        return addresses
    }

    private fun startNsd(owner: LanServerSession) {
        val manager =
            reactContext.getSystemService(Context.NSD_SERVICE) as? NsdManager
                ?: return
        nsdManager = manager
        val info = owner.info

        val serviceInfo =
            NsdServiceInfo().apply {
                serviceName = "$SERVICE_PREFIX${info.id}"
                serviceType = SERVICE_TYPE
                setPort(info.port)
                setAttribute("id", info.id)
                setAttribute("name", info.name)
                setAttribute("platform", "android")
                setAttribute("nonce", info.nonce)
            }

        registrationListener =
            object : NsdManager.RegistrationListener {
                override fun onServiceRegistered(serviceInfo: NsdServiceInfo) = Unit

                override fun onRegistrationFailed(
                    serviceInfo: NsdServiceInfo,
                    errorCode: Int,
                ) = Unit

                override fun onServiceUnregistered(serviceInfo: NsdServiceInfo) = Unit

                override fun onUnregistrationFailed(
                    serviceInfo: NsdServiceInfo,
                    errorCode: Int,
                ) = Unit
            }

        try {
            manager.registerService(
                serviceInfo,
                NsdManager.PROTOCOL_DNS_SD,
                registrationListener,
            )
        } catch (_: Exception) {
            // 注册失败时仍保留手动/同网段回退能力。
        }

        discoveryListener =
            object : NsdManager.DiscoveryListener {
                override fun onDiscoveryStarted(serviceType: String) = Unit

                override fun onStartDiscoveryFailed(
                    serviceType: String,
                    errorCode: Int,
                ) {
                    try {
                        manager.stopServiceDiscovery(this)
                    } catch (_: Exception) {
                        // 已停止。
                    }
                }

                override fun onDiscoveryStopped(serviceType: String) = Unit

                override fun onStopDiscoveryFailed(
                    serviceType: String,
                    errorCode: Int,
                ) = Unit

                override fun onServiceFound(info: NsdServiceInfo) {
                    if (!info.serviceName.startsWith(SERVICE_PREFIX)) return
                    if (!isActiveSession(owner)) return
                    resolveService(owner, manager, info)
                }

                override fun onServiceLost(info: NsdServiceInfo) {
                    val id = info.serviceName.removePrefix(SERVICE_PREFIX)
                    synchronized(lock) {
                        if (serverSession === owner) {
                            peers.remove(id)
                        }
                    }
                }
            }

        try {
            manager.discoverServices(
                SERVICE_TYPE,
                NsdManager.PROTOCOL_DNS_SD,
                discoveryListener,
            )
        } catch (_: Exception) {
            // 发现失败不阻塞本机服务。
        }
    }

    private fun resolveService(
        owner: LanServerSession,
        manager: NsdManager,
        info: NsdServiceInfo,
    ) {
        val key = info.serviceName
        synchronized(lock) {
            if (serverSession !== owner) return
            if (!resolving.add(key)) return
        }

        try {
            manager.resolveService(
                info,
                object : NsdManager.ResolveListener {
                    override fun onResolveFailed(
                        serviceInfo: NsdServiceInfo,
                        errorCode: Int,
                    ) {
                        synchronized(lock) {
                            resolving.remove(key)
                        }
                    }

                    override fun onServiceResolved(serviceInfo: NsdServiceInfo) {
                        synchronized(lock) {
                            resolving.remove(key)
                        }
                        addPeer(owner, serviceInfo)
                    }
                },
            )
        } catch (_: Exception) {
            synchronized(lock) {
                resolving.remove(key)
            }
        }
    }

    private fun addPeer(
        owner: LanServerSession,
        info: NsdServiceInfo,
    ) {
        if (!isActiveSession(owner)) return
        val attributes = info.attributes ?: emptyMap()

        fun attribute(name: String): String? = attributes[name]?.let { String(it, StandardCharsets.UTF_8) }

        val id = attribute("id") ?: info.serviceName.removePrefix(SERVICE_PREFIX)
        val host = info.host ?: return
        if (host !is Inet4Address) return
        val hostAddress = host.hostAddress ?: return
        val port = info.port
        if (port <= 0) return

        val peer =
            Peer(
                id = id,
                name = attribute("name") ?: "附近设备",
                platform = attribute("platform") ?: "android",
                nonce = attribute("nonce") ?: "",
                host = hostAddress,
                port = port,
                lastSeen = System.currentTimeMillis(),
            )
        if (peer.nonce.isEmpty()) return

        synchronized(lock) {
            if (serverSession !== owner) return
            if (LanPeerFilter.isSelf(id, hostAddress, owner.info.id, localHosts)) return
            peers[id] = peer
        }
    }

    private fun stopNsdLocked() {
        nsdManager?.let { manager ->
            discoveryListener?.let { listener ->
                try {
                    manager.stopServiceDiscovery(listener)
                } catch (_: Exception) {
                    // 已停止。
                }
            }
            registrationListener?.let { listener ->
                try {
                    manager.unregisterService(listener)
                } catch (_: Exception) {
                    // 已注销。
                }
            }
        }
        discoveryListener = null
        registrationListener = null
        nsdManager = null
        peers.clear()
        resolving.clear()
    }
}
