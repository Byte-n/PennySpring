package com.pennyspring.quickbook.draft

import android.content.Context
import org.json.JSONArray
import org.json.JSONException
import org.json.JSONObject

/**
 * JS 发布的截图记账目录快照。
 *
 * 原生只读该缓存渲染预设栏，不访问业务数据库；版本号由 JS 单调递增，
 * 低版本写入被拒绝，避免异步发布乱序覆盖新数据。
 */
object QuickBookCaptureCatalogStore {
    const val PREFS_NAME = "quick_book_capture_catalog"
    private const val KEY_CATALOG = "catalog_json"

    data class BookRef(
        val kind: String,
        val serverUrl: String,
        val booksId: Int,
        val bookName: String,
    )

    data class Asset(
        val id: Int,
        val name: String,
    )

    data class TypeOption(
        val id: Int,
        val label: String,
        val sort: Int,
    )

    data class Book(
        val key: String,
        val ref: BookRef,
        val name: String,
        val available: Boolean,
        val unavailableReason: String,
        val assets: List<Asset>,
        val types: List<TypeOption>,
    )

    data class Catalog(
        val version: Long,
        val currentBookKey: String?,
        val books: List<Book>,
    )

    fun write(
        context: Context,
        raw: String,
    ): Boolean {
        val catalog =
            try {
                parse(raw)
            } catch (_: JSONException) {
                return false
            } ?: return false
        val prefs = prefs(context)
        val currentVersion = prefs.getLong(KEY_CATALOG_VERSION, 0L)
        if (catalog.version < currentVersion) {
            return false
        }
        prefs
            .edit()
            .putString(KEY_CATALOG, raw)
            .putLong(KEY_CATALOG_VERSION, catalog.version)
            .apply()
        return true
    }

    fun clear(context: Context) {
        prefs(context)
            .edit()
            .remove(KEY_CATALOG)
            .remove(KEY_CATALOG_VERSION)
            .apply()
    }

    fun read(context: Context): Catalog? {
        val raw = prefs(context).getString(KEY_CATALOG, null) ?: return null
        return try {
            parse(raw)
        } catch (_: JSONException) {
            null
        }
    }

    fun currentBook(context: Context): Book? {
        val catalog = read(context) ?: return null
        val key = catalog.currentBookKey ?: return null
        return catalog.books.firstOrNull { it.key == key && it.available }
    }

    fun toRefJson(ref: BookRef): String =
        JSONObject()
            .put("kind", ref.kind)
            .put("serverUrl", ref.serverUrl)
            .put("booksId", ref.booksId)
            .put("bookName", ref.bookName)
            .toString()

    private fun prefs(context: Context) = context.applicationContext.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)

    private fun parse(raw: String): Catalog? {
        val root = JSONObject(raw)
        val version = root.optLong("version", -1L)
        if (version < 0) return null
        val currentBookKey =
            root
                .optString("currentBookKey", "")
                .takeIf { it.isNotBlank() }
        val booksJson = root.optJSONArray("books") ?: JSONArray()
        val books = mutableListOf<Book>()
        for (index in 0 until booksJson.length()) {
            val item = booksJson.optJSONObject(index) ?: continue
            val key = item.optString("key", "").trim()
            val refJson = item.optJSONObject("ref") ?: continue
            val kind = refJson.optString("kind", "").trim()
            val booksId = refJson.optInt("booksId", 0)
            if (key.isEmpty() || (kind != "local" && kind != "remote") || booksId <= 0) {
                continue
            }
            val serverUrl = refJson.optString("serverUrl", "").trim()
            if (kind == "remote" && serverUrl.isEmpty()) {
                continue
            }
            val assets =
                parseArray(item.optJSONArray("assets")) { asset ->
                    val id = asset.optInt("id", 0)
                    if (id <= 0) return@parseArray null
                    Asset(id = id, name = asset.optString("name", ""))
                }
            val types =
                parseArray(item.optJSONArray("types")) { type ->
                    val id = type.optInt("id", 0)
                    if (id <= 0) return@parseArray null
                    TypeOption(
                        id = id,
                        label = type.optString("label", ""),
                        sort = type.optInt("sort", 0),
                    )
                }
            books.add(
                Book(
                    key = key,
                    ref =
                        BookRef(
                            kind = kind,
                            serverUrl = serverUrl,
                            booksId = booksId,
                            bookName = refJson.optString("bookName", ""),
                        ),
                    name = item.optString("name", ""),
                    available = item.optBoolean("available", false),
                    unavailableReason = item.optString("unavailableReason", ""),
                    assets = assets,
                    types = types,
                ),
            )
        }
        val normalizedCurrent =
            currentBookKey?.takeIf { key -> books.any { it.key == key } }
        return Catalog(version = version, currentBookKey = normalizedCurrent, books = books)
    }

    private fun <T> parseArray(
        array: JSONArray?,
        transform: (JSONObject) -> T?,
    ): List<T> {
        if (array == null) return emptyList()
        val result = mutableListOf<T>()
        for (index in 0 until array.length()) {
            val item = array.optJSONObject(index) ?: continue
            transform(item)?.let(result::add)
        }
        return result
    }

    private const val KEY_CATALOG_VERSION = "catalog_version"
}
