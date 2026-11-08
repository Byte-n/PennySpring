package com.pennyspring.quickbook.draft

import android.content.Context
import android.util.Log
import org.json.JSONException
import org.json.JSONObject

/**
 * 设备本地草稿任务日志：记录已启动、但可能尚未写入占位草稿的 Headless 任务。
 *
 * JS 创建占位草稿后 ack 删除；进程被杀留下残留时，下次启动由 JS 补建 failed 草稿。
 * 只存任务参数，不进入备份、导出或服务器，24 小时后丢弃。
 */
object QuickBookDraftJobJournal {
    const val PREFS_NAME = "quick_book_draft_jobs"

    private const val TAG = "QuickBookDraftJobJournal"
    private const val KEY_PREFIX = "job_"
    private const val JOB_TTL_MS = 24 * 60 * 60 * 1000L

    data class Job(
        val draftId: String,
        val imagePath: String,
        val bookRefJson: String,
        val booksId: Int,
        val assetId: Int,
        val typeId: Int,
        val source: String,
        val createdAt: Long,
    )

    private fun prefs(context: Context) = context.applicationContext.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)

    private fun key(draftId: String): String = "$KEY_PREFIX$draftId"

    fun put(
        context: Context,
        job: Job,
    ) {
        // 同步写入：任务可能紧接着被系统杀死，apply 的异步落盘无法保证记录存在。
        val written = prefs(context).edit().putString(key(job.draftId), toJson(job).toString()).commit()
        if (!written) {
            Log.w(TAG, "写入草稿任务日志失败: ${job.draftId}")
        }
    }

    fun remove(
        context: Context,
        draftId: String,
    ) {
        if (draftId.isEmpty()) {
            return
        }
        prefs(context).edit().remove(key(draftId)).apply()
    }

    fun list(
        context: Context,
        now: Long = System.currentTimeMillis(),
    ): List<Job> {
        val preferences = prefs(context)
        val expiredKeys = mutableListOf<String>()
        val jobs = mutableListOf<Job>()
        for ((storageKey, raw) in preferences.all) {
            if (!storageKey.startsWith(KEY_PREFIX) || raw !is String) {
                continue
            }
            val job = parse(raw)
            if (job == null || now - job.createdAt > JOB_TTL_MS) {
                expiredKeys.add(storageKey)
                continue
            }
            jobs.add(job)
        }
        if (expiredKeys.isNotEmpty()) {
            preferences
                .edit()
                .apply {
                    expiredKeys.forEach { remove(it) }
                }.apply()
        }
        return jobs
    }

    private fun toJson(job: Job): JSONObject =
        JSONObject().apply {
            put("draftId", job.draftId)
            put("imagePath", job.imagePath)
            put("bookRef", job.bookRefJson)
            put("booksId", job.booksId)
            put("assetId", job.assetId)
            put("typeId", job.typeId)
            put("source", job.source)
            put("createdAt", job.createdAt)
        }

    private fun parse(raw: String): Job? =
        try {
            val json = JSONObject(raw)
            val draftId = json.optString("draftId").trim()
            val imagePath = json.optString("imagePath").trim()
            if (draftId.isEmpty() || imagePath.isEmpty()) {
                null
            } else {
                Job(
                    draftId = draftId,
                    imagePath = imagePath,
                    bookRefJson = json.optString("bookRef"),
                    booksId = json.optInt("booksId", 0),
                    assetId = json.optInt("assetId", 0),
                    typeId = json.optInt("typeId", 0),
                    source = json.optString("source"),
                    createdAt = json.optLong("createdAt", 0L),
                )
            }
        } catch (error: JSONException) {
            Log.w(TAG, "草稿任务日志格式不正确", error)
            null
        }
}
