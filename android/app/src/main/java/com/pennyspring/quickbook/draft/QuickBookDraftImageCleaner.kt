package com.pennyspring.quickbook.draft

import android.content.Context
import android.net.Uri
import android.util.Log
import java.io.File

/**
 * 删除草稿目录中没有任何草稿行引用的截图文件。
 *
 * 只处理 `filesDir/quick-book-drafts` 下的文件；正式记账后的图片已转存到
 * 媒体存储，不受这里影响。数据库不可读时不做删除，避免误删。
 */
object QuickBookDraftImageCleaner {
    private const val TAG = "QuickBookDraftImageCleaner"
    private const val DIRECTORY_NAME = "quick-book-drafts"

    fun cleanup(context: Context): Int {
        val directory = File(context.filesDir, DIRECTORY_NAME)
        if (!directory.isDirectory) {
            return 0
        }
        val referencedNames = referencedFileNames(context)
        if (referencedNames == null) {
            return 0
        }
        var removed = 0
        directory.listFiles()?.forEach { file ->
            if (!file.isFile || file.name in referencedNames) {
                return@forEach
            }
            try {
                if (file.delete()) {
                    removed += 1
                }
            } catch (error: Exception) {
                Log.w(TAG, "删除孤儿草稿截图失败：${file.name}", error)
            }
        }
        return removed
    }

    private fun referencedFileNames(context: Context): Set<String>? {
        // 数据库不存在（首次启动前）不清理；表不可读时 QuickBookDraftDb 返回空列表，
        // 此时无法区分“没有草稿”和“读取失败”，因此直接放弃本轮清理。
        val databaseFile = context.getDatabasePath("pennyspring.db")
        if (!databaseFile.isFile) {
            return null
        }
        val paths = QuickBookDraftDb.loadAllDraftImagePaths(context) ?: return null
        val names = mutableSetOf<String>()
        paths.forEach { path ->
            val name = runCatching { Uri.parse(path).lastPathSegment }.getOrNull()
            if (!name.isNullOrBlank()) {
                names.add(name)
            }
        }
        return names
    }
}
