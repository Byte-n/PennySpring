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
import java.io.ByteArrayOutputStream
import java.io.File
import java.io.FileInputStream
import java.io.InputStream
import java.io.OutputStream
import java.net.Inet4Address
import java.net.InetSocketAddress
import java.net.ServerSocket
import java.net.SocketTimeoutException
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
        private const val MAX_HEADER_BYTES = 8192
        private const val MAX_MESSAGE_BYTES = 64 * 1024
        private const val MAX_MESSAGES = 100
        private const val COPY_BUFFER = 64 * 1024
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

    private data class HttpRequest(
        val method: String,
        val target: String,
        val body: String,
    )

    private val lock = Any()
    private val random = SecureRandom()

    @Volatile
    private var running = false

    @Volatile
    private var state = "idle"

    @Volatile
    private var errorText = ""

    @Volatile
    private var servedAt = 0L

    private var serverSocket: ServerSocket? = null
    private var acceptThread: Thread? = null

    private var sessionId = ""
    private var sessionName = ""
    private var sessionNonce = ""
    private var sessionPort = 0

    private val peers = linkedMapOf<String, Peer>()
    private val messages = mutableListOf<Envelope>()
    private val resolving = mutableSetOf<String>()
    private var messageSequence = 0L

    private var packageUri: String? = null
    private var packageToken = ""
    private var packageLength = 0L

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
            stopInternal()
            try {
                val socket = ServerSocket()
                socket.reuseAddress = true
                socket.bind(InetSocketAddress(0))
                socket.soTimeout = 1000
                serverSocket = socket
                sessionPort = socket.localPort
                sessionId = randomHex(8)
                sessionName = deviceName()
                sessionNonce = randomHex(16)
                state = "serving"
                errorText = ""
                servedAt = 0L
                running = true

                acceptThread =
                    Thread(
                        { acceptLoop(socket, timeout) },
                        "PennySpringLanAccept",
                    ).apply { start() }

                startNsd(sessionPort)

                val urls = Arguments.createArray()
                localAddresses().forEach { host ->
                    urls.pushString("http://$host:$sessionPort")
                }
                promise.resolve(
                    Arguments.createMap().apply {
                        putString("id", sessionId)
                        putString("name", sessionName)
                        putString("platform", "android")
                        putString("nonce", sessionNonce)
                        putString("host", localAddresses().firstOrNull() ?: "127.0.0.1")
                        putInt("port", sessionPort)
                        putArray("urls", urls)
                    },
                )
            } catch (error: Exception) {
                stopInternal()
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
            stopInternal()
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
            val source = openSource(fileUri)
            try {
                synchronized(lock) {
                    packageUri = fileUri
                    packageToken = token
                    packageLength = source.length
                }
            } finally {
                source.stream.close()
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

    private fun acceptLoop(
        socket: ServerSocket,
        timeoutMs: Long,
    ) {
        val deadline = System.currentTimeMillis() + timeoutMs
        try {
            while (
                running &&
                System.currentTimeMillis() < deadline &&
                !socket.isClosed
            ) {
                val client =
                    try {
                        socket.accept()
                    } catch (_: SocketTimeoutException) {
                        continue
                    }
                Thread(
                    { handleClient(client) },
                    "PennySpringLanClient",
                ).start()
            }
            if (running) {
                synchronized(lock) {
                    state = "error"
                    errorText = "局域网会话已超时"
                }
            }
        } finally {
            try {
                socket.close()
            } catch (_: Exception) {
                // 已关闭。
            }
        }
    }

    private fun handleClient(client: java.net.Socket) {
        client.use { connection ->
            try {
                connection.soTimeout = 10_000
                val input = BufferedInputStream(connection.getInputStream())
                val output = BufferedOutputStream(connection.getOutputStream())
                val request = readRequest(input)
                if (request == null) {
                    writeText(output, "400 Bad Request", "请求格式不正确")
                    return
                }
                routeRequest(request, output)
                output.flush()
            } catch (error: Exception) {
                try {
                    writeText(
                        BufferedOutputStream(connection.getOutputStream()),
                        "500 Internal Server Error",
                        "传输失败",
                    )
                } catch (_: Exception) {
                    // 连接已断开。
                }
            }
        }
    }

    private fun routeRequest(
        request: HttpRequest,
        output: OutputStream,
    ) {
        val path = request.target.substringBefore('?')
        when {
            request.method == "OPTIONS" -> {
                writeText(output, "204 No Content", "")
            }
            request.method == "GET" && path == "/health" -> {
                val body =
                    JSONObject()
                        .put("id", sessionId)
                        .put("name", sessionName)
                        .put("platform", "android")
                        .put("nonce", sessionNonce)
                        .put("port", sessionPort)
                        .toString()
                writeJson(output, "200 OK", body)
            }
            request.method == "POST" && path == "/message" -> {
                if (request.body.isEmpty()) {
                    writeText(output, "400 Bad Request", "消息不能为空")
                    return
                }
                synchronized(lock) {
                    if (messages.size >= MAX_MESSAGES) {
                        writeText(output, "503 Service Unavailable", "消息队列已满")
                        return
                    }
                    messageSequence += 1
                    messages.add(
                        Envelope(
                            id = "m-$messageSequence-${System.currentTimeMillis()}",
                            body = request.body,
                            receivedAt = System.currentTimeMillis(),
                        ),
                    )
                }
                writeJson(output, "200 OK", "{\"ok\":true}")
            }
            request.method == "GET" && path == "/package" -> {
                servePackage(request.target, output)
            }
            else -> {
                writeText(output, "404 Not Found", "未找到传输内容")
            }
        }
    }

    private fun servePackage(
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

        val currentUri: String?
        val currentLength: Long
        synchronized(lock) {
            if (token.isNullOrEmpty() || token != packageToken) {
                writeText(output, "403 Forbidden", "传输会话已失效")
                return
            }
            currentUri = packageUri
            currentLength = packageLength
        }

        if (currentUri == null) {
            writeText(output, "404 Not Found", "没有待发送的文件")
            return
        }

        val source =
            try {
                openSource(currentUri)
            } catch (error: Exception) {
                writeText(output, "500 Internal Server Error", "无法读取待发送文件")
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
            servedAt = System.currentTimeMillis()
            if (currentLength >= 0) {
                packageLength = currentLength
            }
        }
    }

    private fun readRequest(input: InputStream): HttpRequest? {
        val buffer = ByteArrayOutputStream()
        var tail = 0
        while (buffer.size() < MAX_HEADER_BYTES) {
            val next = input.read()
            if (next == -1) return null
            buffer.write(next)
            tail = (tail shl 8) or next
            if (tail == 0x0D0A0D0A) {
                val headerText = buffer.toString(StandardCharsets.ISO_8859_1.name())
                return parseRequest(headerText, input)
            }
        }
        throw IllegalArgumentException("请求头过大")
    }

    private fun parseRequest(
        headerText: String,
        input: InputStream,
    ): HttpRequest {
        val lines = headerText.split("\r\n")
        val requestLine = lines.firstOrNull().orEmpty()
        val parts = requestLine.split(" ")
        if (parts.size < 2) {
            throw IllegalArgumentException("请求格式不正确")
        }

        val headers =
            lines
                .drop(1)
                .filter { it.contains(":") }
                .associate {
                    val index = it.indexOf(':')
                    it.substring(0, index).trim().lowercase() to
                        it.substring(index + 1).trim()
                }
        val contentLength = headers["content-length"]?.toIntOrNull() ?: 0
        if (contentLength < 0 || contentLength > MAX_MESSAGE_BYTES) {
            throw IllegalArgumentException("请求体过大")
        }

        val body = ByteArray(contentLength)
        var read = 0
        while (read < contentLength) {
            val count = input.read(body, read, contentLength - read)
            if (count <= 0) break
            read += count
        }

        val bodyText =
            if (contentLength == 0) {
                ""
            } else {
                String(body, 0, read, StandardCharsets.UTF_8)
            }

        return HttpRequest(
            method = parts[0].uppercase(),
            target = parts[1],
            body = bodyText,
        )
    }

    private fun writeJson(
        output: OutputStream,
        status: String,
        json: String,
    ) {
        val body = json.toByteArray(StandardCharsets.UTF_8)
        val headers =
            buildString {
                append("HTTP/1.1 $status\r\n")
                append("Content-Type: application/json; charset=utf-8\r\n")
                append("Content-Length: ${body.size}\r\n")
                append("Connection: close\r\n")
                append("\r\n")
            }
        output.write(headers.toByteArray(StandardCharsets.ISO_8859_1))
        output.write(body)
    }

    private fun writeText(
        output: OutputStream,
        status: String,
        message: String,
    ) {
        val body = message.toByteArray(StandardCharsets.UTF_8)
        val headers =
            buildString {
                append("HTTP/1.1 $status\r\n")
                append("Content-Type: text/plain; charset=utf-8\r\n")
                append("Content-Length: ${body.size}\r\n")
                append("Connection: close\r\n")
                append("\r\n")
            }
        output.write(headers.toByteArray(StandardCharsets.ISO_8859_1))
        output.write(body)
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

    private fun startNsd(port: Int) {
        val manager =
            reactContext.getSystemService(Context.NSD_SERVICE) as? NsdManager
                ?: return
        nsdManager = manager

        val serviceInfo =
            NsdServiceInfo().apply {
                serviceName = "$SERVICE_PREFIX$sessionId"
                serviceType = SERVICE_TYPE
                setPort(port)
                setAttribute("id", sessionId)
                setAttribute("name", sessionName)
                setAttribute("platform", "android")
                setAttribute("nonce", sessionNonce)
            }

        registrationListener =
            object : NsdManager.RegistrationListener {
                override fun onServiceRegistered(info: NsdServiceInfo) = Unit

                override fun onRegistrationFailed(
                    info: NsdServiceInfo,
                    errorCode: Int,
                ) = Unit

                override fun onServiceUnregistered(info: NsdServiceInfo) = Unit

                override fun onUnregistrationFailed(
                    info: NsdServiceInfo,
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
                    resolveService(manager, info)
                }

                override fun onServiceLost(info: NsdServiceInfo) {
                    val id = info.serviceName.removePrefix(SERVICE_PREFIX)
                    synchronized(lock) {
                        peers.remove(id)
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
        manager: NsdManager,
        info: NsdServiceInfo,
    ) {
        val key = info.serviceName
        synchronized(lock) {
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
                        addPeer(serviceInfo)
                    }
                },
            )
        } catch (_: Exception) {
            synchronized(lock) {
                resolving.remove(key)
            }
        }
    }

    private fun addPeer(info: NsdServiceInfo) {
        if (!running) return
        val attributes = info.attributes ?: emptyMap()

        fun attribute(name: String): String? = attributes[name]?.let { String(it, StandardCharsets.UTF_8) }

        val id = attribute("id") ?: info.serviceName.removePrefix(SERVICE_PREFIX)
        val host = info.host ?: return
        if (host !is Inet4Address) return
        val hostAddress = host.hostAddress ?: return
        val port = info.port
        if (port <= 0) return
        if (id == sessionId) return

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
            peers[id] = peer
        }
    }

    private fun stopNsd() {
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
        synchronized(lock) {
            peers.clear()
            resolving.clear()
        }
    }

    private fun stopInternal() {
        running = false
        state = "idle"
        errorText = ""
        servedAt = 0L
        messageSequence = 0L

        try {
            serverSocket?.close()
        } catch (_: Exception) {
            // 已关闭。
        }
        serverSocket = null
        acceptThread?.interrupt()
        acceptThread = null

        stopNsd()

        synchronized(lock) {
            messages.clear()
            packageUri = null
            packageToken = ""
            packageLength = 0L
        }
    }
}
