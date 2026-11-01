package com.pennyspring.lantransfer

import android.net.Uri
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import java.io.BufferedInputStream
import java.io.BufferedOutputStream
import java.io.ByteArrayOutputStream
import java.io.File
import java.io.FileInputStream
import java.io.InputStream
import java.io.OutputStream
import java.net.Inet4Address
import java.net.InetSocketAddress
import java.net.NetworkInterface
import java.net.ServerSocket
import java.net.SocketTimeoutException
import java.net.URLDecoder
import java.net.URLEncoder
import java.nio.charset.StandardCharsets

class LanTransferModule(
    private val reactContext: ReactApplicationContext,
) : ReactContextBaseJavaModule(reactContext) {
    companion object {
        private const val DEFAULT_TIMEOUT_MS = 10 * 60 * 1000L
        private const val MIN_TIMEOUT_MS = 60 * 1000L
        private const val MAX_TIMEOUT_MS = 30 * 60 * 1000L
        private const val MAX_HEADER_BYTES = 8192
        private const val COPY_BUFFER = 64 * 1024
    }

    private class Source(
        val stream: InputStream,
        val length: Long,
    )

    private val lock = Any()

    @Volatile
    private var state = "idle"

    @Volatile
    private var errorText = ""

    @Volatile
    private var servedAt = 0L

    private var serverSocket: ServerSocket? = null
    private var worker: Thread? = null

    override fun getName(): String = "LanTransfer"

    @ReactMethod
    fun startServer(
        token: String,
        fileUri: String,
        fileName: String,
        timeoutMs: Double,
        promise: Promise,
    ) {
        if (token.length != 6 || token.any { !it.isDigit() }) {
            promise.reject("E_INVALID_TOKEN", "传输口令必须是 6 位数字")
            return
        }

        val timeout =
            timeoutMs.toLong().takeIf {
                it in MIN_TIMEOUT_MS..MAX_TIMEOUT_MS
            } ?: DEFAULT_TIMEOUT_MS

        synchronized(lock) {
            stopInternal()
            try {
                openSource(fileUri).stream.close()

                val socket = ServerSocket()
                socket.reuseAddress = true
                socket.bind(InetSocketAddress(0))
                socket.soTimeout = 1000
                serverSocket = socket
                state = "waiting"
                errorText = ""
                servedAt = 0L

                val port = socket.localPort
                worker =
                    Thread(
                        { serveLoop(token, fileUri, fileName, socket, timeout) },
                        "PennySpringLanTransfer",
                    ).apply { start() }

                val urls = Arguments.createArray()
                localAddresses().forEach { host ->
                    urls.pushString("http://$host:$port")
                }
                promise.resolve(
                    Arguments.createMap().apply {
                        putInt("port", port)
                        putArray("urls", urls)
                    },
                )
            } catch (error: Exception) {
                stopInternal()
                state = "error"
                errorText = error.message ?: "无法启动局域网传输"
                promise.reject(
                    "E_START_SERVER",
                    error.message ?: "无法启动局域网传输",
                    error,
                )
            }
        }
    }

    @ReactMethod
    fun stopServer(promise: Promise) {
        synchronized(lock) {
            stopInternal()
        }
        promise.resolve(null)
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

    private fun serveLoop(
        token: String,
        fileUri: String,
        fileName: String,
        socket: ServerSocket,
        timeoutMs: Long,
    ) {
        val deadline = System.currentTimeMillis() + timeoutMs
        try {
            while (
                state == "waiting" &&
                System.currentTimeMillis() < deadline &&
                !socket.isClosed
            ) {
                val client =
                    try {
                        socket.accept()
                    } catch (_: SocketTimeoutException) {
                        continue
                    }

                client.use { connection ->
                    connection.soTimeout = 5000
                    val input = BufferedInputStream(connection.getInputStream())
                    val output = BufferedOutputStream(connection.getOutputStream())
                    try {
                        handleConnection(input, output, token, fileUri, fileName)
                        output.flush()
                    } catch (error: Exception) {
                        writeTextResponse(output, "500 Internal Server Error", "传输失败")
                        output.flush()
                        synchronized(lock) {
                            if (state == "waiting") {
                                state = "error"
                                errorText = error.message ?: "传输失败"
                            }
                        }
                    }
                }

                if (state == "served") {
                    break
                }
            }

            if (state == "waiting") {
                synchronized(lock) {
                    if (state == "waiting") {
                        state = "error"
                        errorText = "等待超时，请重新开始"
                    }
                }
            }
        } finally {
            closeServer(socket)
        }
    }

    private fun handleConnection(
        input: InputStream,
        output: OutputStream,
        token: String,
        fileUri: String,
        fileName: String,
    ) {
        val request = readRequest(input) ?: return
        val requestLine = request.substringBefore("\r\n")
        val parts = requestLine.split(" ")
        if (parts.size < 2 || parts[0] != "GET") {
            writeTextResponse(output, "405 Method Not Allowed", "仅支持 GET")
            return
        }

        val target = parts[1]
        val path = target.substringBefore('?')
        if (path != "/package") {
            writeTextResponse(output, "404 Not Found", "未找到传输内容")
            return
        }

        val query = target.substringAfter('?', "")
        val providedToken =
            query
                .split('&')
                .firstOrNull { it.startsWith("token=") }
                ?.substringAfter('=')
                ?.let { URLDecoder.decode(it, StandardCharsets.UTF_8.name()) }
        if (providedToken != token) {
            writeTextResponse(output, "403 Forbidden", "传输口令不正确")
            return
        }

        val source = openSource(fileUri)
        val encodedName =
            URLEncoder
                .encode(fileName, StandardCharsets.UTF_8.name())
                .replace("+", "%20")
        val headers =
            buildString {
                append("HTTP/1.1 200 OK\r\n")
                append("Content-Type: application/zip\r\n")
                append("Content-Length: ${source.length}\r\n")
                append("Content-Disposition: attachment; filename=\"pennyspring-backup.psb\"; filename*=UTF-8''$encodedName\r\n")
                append("Connection: close\r\n")
                append("\r\n")
            }
        output.write(headers.toByteArray(StandardCharsets.ISO_8859_1))

        source.stream.use { stream ->
            val buffer = ByteArray(COPY_BUFFER)
            while (true) {
                val read = stream.read(buffer)
                if (read <= 0) break
                output.write(buffer, 0, read)
            }
        }

        synchronized(lock) {
            state = "served"
            errorText = ""
            servedAt = System.currentTimeMillis()
        }
    }

    private fun readRequest(input: InputStream): String? {
        val buffer = ByteArrayOutputStream()
        var tail = 0
        while (buffer.size() < MAX_HEADER_BYTES) {
            val next = input.read()
            if (next == -1) return null
            buffer.write(next)
            tail = (tail shl 8) or next
            if (tail == 0x0D0A0D0A) {
                return buffer.toString(StandardCharsets.ISO_8859_1.name())
            }
        }
        throw IllegalArgumentException("请求头过大")
    }

    private fun writeTextResponse(
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

    private fun localAddresses(): List<String> {
        val addresses = mutableListOf<String>()
        try {
            val interfaces = NetworkInterface.getNetworkInterfaces() ?: return addresses
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
        } catch (_: Exception) {
            // 没有可枚举的网卡时回退到本机地址。
        }
        if (addresses.isEmpty()) addresses.add("127.0.0.1")
        return addresses
    }

    private fun stopInternal() {
        state = "idle"
        errorText = ""
        servedAt = 0L
        val socket = serverSocket
        serverSocket = null
        try {
            socket?.close()
        } catch (_: Exception) {
            // 关闭失败不影响停止状态。
        }
        worker?.interrupt()
        worker = null
    }

    private fun closeServer(socket: ServerSocket) {
        synchronized(lock) {
            if (serverSocket === socket) {
                serverSocket = null
                worker = null
            }
        }
        try {
            socket.close()
        } catch (_: Exception) {
            // 已关闭。
        }
    }
}
