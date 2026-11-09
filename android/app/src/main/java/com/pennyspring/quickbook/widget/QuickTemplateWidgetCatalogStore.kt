package com.pennyspring.quickbook.widget

import android.content.Context
import org.json.JSONArray
import org.json.JSONException
import org.json.JSONObject

/**
 * JS 发布的快捷模板桌面小组件快照。
 *
 * 原生只读该缓存渲染小组件，不访问业务数据库；版本号由 JS 单调递增，
 * 低版本写入被拒绝，避免异步发布乱序覆盖新数据。
 */
object QuickTemplateWidgetCatalogStore {
    const val PREFS_NAME = "quick_template_widget_catalog"
    private const val KEY_CATALOG = "catalog_json"
    private const val KEY_CATALOG_VERSION = "catalog_version"

    data class BookRef(
        val kind: String,
        val serverUrl: String,
        val booksId: Int,
        val bookName: String,
    )

    data class Template(
        val id: Int,
        val name: String,
    )

    data class Book(
        val ref: BookRef,
        val available: Boolean,
        val unavailableReason: String,
        val templates: List<Template>,
    )

    data class Catalog(
        val version: Long,
        val book: Book?,
    )

    fun write(
        context: Context,
        raw: String,
    ): Boolean {
        val catalog =
            try {
                parseCatalog(raw)
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

    fun read(context: Context): Catalog? {
        val raw = prefs(context).getString(KEY_CATALOG, null) ?: return null
        return try {
            parseCatalog(raw)
        } catch (_: JSONException) {
            null
        }
    }

    fun toRefJson(ref: BookRef): String =
        JSONObject()
            .put("kind", ref.kind)
            .put("serverUrl", ref.serverUrl)
            .put("booksId", ref.booksId)
            .put("bookName", ref.bookName)
            .toString()

    internal fun parseCatalog(raw: String): Catalog? {
        val root = JSONObject(raw)
        val version = root.optLong("version", -1L)
        if (version < 0) {
            return null
        }
        if (!root.has("book") || root.isNull("book")) {
            return Catalog(version = version, book = null)
        }
        val bookJson = root.optJSONObject("book") ?: return null
        val kind = bookJson.optString("kind", "").trim()
        val booksId = bookJson.optInt("booksId", 0)
        if ((kind != "local" && kind != "remote") || booksId <= 0) {
            return null
        }
        val serverUrl = bookJson.optString("serverUrl", "").trim()
        if (kind == "remote" && serverUrl.isEmpty()) {
            return null
        }
        val templates =
            parseTemplates(bookJson.optJSONArray("templates"))
        val ref =
            BookRef(
                kind = kind,
                serverUrl = serverUrl,
                booksId = booksId,
                bookName = bookJson.optString("bookName", "").trim(),
            )
        return Catalog(
            version = version,
            book =
                Book(
                    ref = ref,
                    available = bookJson.optBoolean("available", false),
                    unavailableReason = bookJson.optString("unavailableReason", "").trim(),
                    templates = templates,
                ),
        )
    }

    private fun parseTemplates(array: JSONArray?): List<Template> {
        if (array == null) {
            return emptyList()
        }
        val templates = mutableListOf<Template>()
        for (index in 0 until array.length()) {
            val item = array.optJSONObject(index) ?: continue
            val id = item.optInt("id", 0)
            val name = item.optString("name", "").trim()
            if (id <= 0 || name.isEmpty()) {
                continue
            }
            templates.add(Template(id = id, name = name))
        }
        return templates
    }

    private fun prefs(context: Context) = context.applicationContext.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
}
