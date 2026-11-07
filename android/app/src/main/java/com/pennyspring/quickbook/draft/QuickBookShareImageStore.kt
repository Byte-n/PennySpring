package com.pennyspring.quickbook.draft

import android.content.Context
import android.net.Uri
import android.provider.OpenableColumns
import com.pennyspring.quickbook.QuickBookImageProcessor
import java.io.File

/**
 * 把系统分享的图片同步写入草稿目录。
 *
 * 分享 URI 的读权限随分享任务结束失效，必须在 Activity 存活期间完成复制；
 * 统一转成受限尺寸的 JPEG，避免把超大原图直接送进 Headless 任务。
 */
object QuickBookShareImageStore {
    private const val DRAFT_DIRECTORY = "quick-book-drafts"
    private const val MAX_IMAGE_BYTES = 20L * 1024 * 1024
    private const val MAX_EDGE = 1600
    private const val JPEG_QUALITY = 80

    fun isTooLarge(
        context: Context,
        uri: Uri,
    ): Boolean {
        val size = readSize(context, uri) ?: return false
        return size > MAX_IMAGE_BYTES
    }

    fun save(
        context: Context,
        uri: Uri,
        draftId: String,
    ): File? {
        val directory = File(context.filesDir, DRAFT_DIRECTORY)
        if (!directory.exists() && !directory.mkdirs()) {
            return null
        }
        val target = File(directory, "$draftId.jpg")
        return if (QuickBookImageProcessor.writeJpeg(context, uri, target, MAX_EDGE, JPEG_QUALITY)) {
            target
        } else {
            target.delete()
            null
        }
    }

    private fun readSize(
        context: Context,
        uri: Uri,
    ): Long? =
        try {
            context.contentResolver
                .query(uri, arrayOf(OpenableColumns.SIZE), null, null, null)
                ?.use { cursor ->
                    if (!cursor.moveToFirst()) {
                        null
                    } else {
                        val index = cursor.getColumnIndex(OpenableColumns.SIZE)
                        if (index < 0 || cursor.isNull(index)) null else cursor.getLong(index)
                    }
                }
        } catch (_: Exception) {
            null
        }
}
