package com.pennyspring.lantransfer

import java.io.ByteArrayOutputStream
import java.io.InputStream
import java.io.OutputStream
import java.nio.charset.StandardCharsets

internal data class HttpRequest(
    val method: String,
    val target: String,
    val body: String,
)

internal object LanHttp {
    private const val MAX_HEADER_BYTES = 8192
    private const val MAX_MESSAGE_BYTES = 64 * 1024

    fun readRequest(input: InputStream): HttpRequest? {
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

    fun writeJson(
        output: OutputStream,
        status: String,
        json: String,
    ) {
        val body = json.toByteArray(StandardCharsets.UTF_8)
        output.write(buildResponseHeaders(status, "application/json; charset=utf-8", body.size))
        output.write(body)
    }

    fun writeText(
        output: OutputStream,
        status: String,
        message: String,
    ) {
        val body = message.toByteArray(StandardCharsets.UTF_8)
        output.write(buildResponseHeaders(status, "text/plain; charset=utf-8", body.size))
        output.write(body)
    }

    private fun buildResponseHeaders(
        status: String,
        contentType: String,
        contentLength: Int,
    ): ByteArray {
        val headers =
            buildString {
                append("HTTP/1.1 $status\r\n")
                append("Content-Type: $contentType\r\n")
                append("Content-Length: $contentLength\r\n")
                append("Connection: close\r\n")
                append("\r\n")
            }
        return headers.toByteArray(StandardCharsets.ISO_8859_1)
    }
}
