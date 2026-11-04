package com.pennyspring.quickbook.draft

import android.content.Context
import android.database.sqlite.SQLiteDatabase
import android.util.Log
import org.json.JSONArray
import org.json.JSONException

data class DraftBook(
    val id: Int,
    val name: String,
)

data class DraftAsset(
    val id: Int,
    val name: String,
)

data class DraftType(
    val id: Int,
    val parentId: Int,
    val name: String,
    val typeCategory: String,
    val sort: Int,
)

data class DraftSummary(
    val status: String,
    val itemCount: Int,
)

/**
 * 只读查询 JS 侧 op-sqlite 写入的本地库，为悬浮球预设栏和任务完成提示提供数据。
 *
 * 使用 [SQLiteDatabase.OPEN_READONLY] 直接读取 `pennyspring.db`，
 * 与 JS 侧共用同一文件，不触发迁移；文件或表不存在时返回空列表 / null。
 */
object QuickBookDraftDb {
    private const val TAG = "QuickBookDraftDb"
    private const val DATABASE_NAME = "pennyspring.db"
    private const val HIDDEN_ASSET_VISIBILITY = "hidden"
    private const val STATUS_PENDING = "pending"

    fun loadBooks(context: Context): List<DraftBook> =
        read(context, emptyList()) { database ->
            val books = mutableListOf<DraftBook>()
            database
                .rawQuery(
                    "SELECT id, name FROM tb_books ORDER BY id ASC",
                    null,
                ).use { cursor ->
                    while (cursor.moveToNext()) {
                        books.add(
                            DraftBook(
                                id = cursor.getInt(0),
                                name = cursor.getString(1).orEmpty(),
                            ),
                        )
                    }
                }
            books
        }

    fun loadAssets(
        context: Context,
        bookId: Int,
    ): List<DraftAsset> =
        read(context, emptyList()) { database ->
            val assets = mutableListOf<DraftAsset>()
            database
                .rawQuery(
                    "SELECT id, name FROM tb_asset " +
                        "WHERE books_id = ? AND invisible != ? ORDER BY sort ASC, id ASC",
                    arrayOf(bookId.toString(), HIDDEN_ASSET_VISIBILITY),
                ).use { cursor ->
                    while (cursor.moveToNext()) {
                        assets.add(
                            DraftAsset(
                                id = cursor.getInt(0),
                                name = cursor.getString(1).orEmpty(),
                            ),
                        )
                    }
                }
            assets
        }

    fun loadTypes(
        context: Context,
        bookId: Int,
    ): List<DraftType> =
        read(context, emptyList()) { database ->
            val types = mutableListOf<DraftType>()
            database
                .rawQuery(
                    "SELECT id, parent_id, name, type_category, sort FROM tb_type " +
                        "WHERE books_id = ? ORDER BY sort ASC, id ASC",
                    arrayOf(bookId.toString()),
                ).use { cursor ->
                    while (cursor.moveToNext()) {
                        types.add(
                            DraftType(
                                id = cursor.getInt(0),
                                parentId = cursor.getInt(1),
                                name = cursor.getString(2).orEmpty(),
                                typeCategory = cursor.getString(3).orEmpty(),
                                sort = cursor.getInt(4),
                            ),
                        )
                    }
                }
            types
        }

    /** 返回 null 表示数据库/表不可读，调用方应放弃删除，避免误删截图。 */
    fun loadAllDraftImagePaths(context: Context): List<String>? =
        read(context, null) { database ->
            val paths = mutableListOf<String>()
            database
                .rawQuery(
                    "SELECT image_path FROM tb_quick_book_draft WHERE image_path != ''",
                    null,
                ).use { cursor ->
                    while (cursor.moveToNext()) {
                        val path = cursor.getString(0)?.trim().orEmpty()
                        if (path.isNotEmpty()) {
                            paths.add(path)
                        }
                    }
                }
            paths
        }

    fun loadSummary(
        context: Context,
        draftId: String,
    ): DraftSummary? {
        if (draftId.isBlank()) {
            return null
        }
        return read(context, null) { database ->
            database
                .rawQuery(
                    "SELECT status, payload FROM tb_quick_book_draft WHERE id = ? LIMIT 1",
                    arrayOf(draftId),
                ).use { cursor ->
                    if (!cursor.moveToFirst()) {
                        null
                    } else {
                        DraftSummary(
                            status = cursor.getString(0).orEmpty(),
                            itemCount = countPayloadItems(cursor.getString(1)),
                        )
                    }
                }
        }
    }

    fun isPendingWithItems(summary: DraftSummary?): Boolean = summary?.status == STATUS_PENDING && summary.itemCount > 0

    private fun countPayloadItems(payload: String?): Int {
        if (payload.isNullOrBlank()) {
            return 0
        }
        return try {
            JSONArray(payload).length()
        } catch (error: JSONException) {
            Log.w(TAG, "草稿 payload 不是合法 JSON 数组", error)
            0
        }
    }

    private fun <T> read(
        context: Context,
        fallback: T,
        query: (SQLiteDatabase) -> T,
    ): T {
        val databaseFile = context.getDatabasePath(DATABASE_NAME)
        if (!databaseFile.isFile) {
            return fallback
        }
        var database: SQLiteDatabase? = null
        return try {
            database = SQLiteDatabase.openDatabase(databaseFile.absolutePath, null, SQLiteDatabase.OPEN_READONLY)
            query(database)
        } catch (error: Exception) {
            Log.w(TAG, "读取草稿本地库失败", error)
            fallback
        } finally {
            database?.close()
        }
    }
}
