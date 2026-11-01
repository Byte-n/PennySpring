package com.pennyspring.quickbook

import android.content.Context
import android.graphics.Bitmap
import android.graphics.BitmapFactory
import android.net.Uri
import android.util.Base64
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.WritableMap
import java.io.File
import java.io.FileOutputStream
import java.util.UUID

/**
 * 把截图/分享图片统一压缩为 JPEG 并落盘，同时返回聊天消息需要的 base64。
 * iOS 暂不支持该能力，相关入口在 JS 侧按平台关闭。
 */
object QuickBookImageProcessor {
    private const val OUTPUT_DIR = "quick-book"
    private const val JPEG_MIME = "image/jpeg"

    fun process(
        context: Context,
        uri: Uri,
        maxEdge: Int,
        quality: Int,
    ): WritableMap? {
        return try {
            val decoded = decode(context, uri, maxEdge) ?: return null
            val scaled = scaleToMaxEdge(decoded, maxEdge)
            if (scaled !== decoded) {
                decoded.recycle()
            }

            val directory = File(context.filesDir, OUTPUT_DIR).apply { mkdirs() }
            val file =
                File(
                    directory,
                    "quick_book_${System.currentTimeMillis()}_${UUID.randomUUID().toString().take(8)}.jpg",
                )
            FileOutputStream(file).use { output ->
                scaled.compress(
                    Bitmap.CompressFormat.JPEG,
                    quality.coerceIn(1, 100),
                    output,
                )
            }
            val bytes = file.readBytes()
            val result =
                Arguments.createMap().apply {
                    putString("localPath", Uri.fromFile(file).toString())
                    putString("base64", Base64.encodeToString(bytes, Base64.NO_WRAP))
                    putString("mimeType", JPEG_MIME)
                    putString("fileName", file.name)
                    putDouble("fileSize", bytes.size.toDouble())
                    putDouble("width", scaled.width.toDouble())
                    putDouble("height", scaled.height.toDouble())
                }
            scaled.recycle()
            result
        } catch (_: Exception) {
            null
        }
    }

    private fun decode(
        context: Context,
        uri: Uri,
        maxEdge: Int,
    ): Bitmap? {
        val bounds = BitmapFactory.Options().apply { inJustDecodeBounds = true }
        val boundsStream =
            context.contentResolver.openInputStream(uri)
                ?: return null
        boundsStream.use { stream ->
            BitmapFactory.decodeStream(stream, null, bounds)
        }

        if (bounds.outWidth <= 0 || bounds.outHeight <= 0) {
            return null
        }

        val options =
            BitmapFactory.Options().apply {
                inSampleSize = calculateInSampleSize(bounds.outWidth, bounds.outHeight, maxEdge)
            }
        val imageStream =
            context.contentResolver.openInputStream(uri)
                ?: return null
        return imageStream.use { stream ->
            BitmapFactory.decodeStream(stream, null, options)
        }
    }

    private fun calculateInSampleSize(
        width: Int,
        height: Int,
        maxEdge: Int,
    ): Int {
        var sampleSize = 1
        var currentWidth = width
        var currentHeight = height
        while (currentWidth / 2 >= maxEdge && currentHeight / 2 >= maxEdge) {
            currentWidth /= 2
            currentHeight /= 2
            sampleSize *= 2
        }
        return sampleSize
    }

    private fun scaleToMaxEdge(
        bitmap: Bitmap,
        maxEdge: Int,
    ): Bitmap {
        val longestEdge = maxOf(bitmap.width, bitmap.height)
        if (longestEdge <= maxEdge) {
            return bitmap
        }
        val ratio = maxEdge.toFloat() / longestEdge
        val targetWidth = (bitmap.width * ratio).toInt().coerceAtLeast(1)
        val targetHeight = (bitmap.height * ratio).toInt().coerceAtLeast(1)
        return Bitmap.createScaledBitmap(bitmap, targetWidth, targetHeight, true)
    }
}
