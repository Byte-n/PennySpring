package com.pennyspring.quickbook.draft

import android.app.Activity
import android.content.Intent
import android.net.Uri
import android.os.Bundle
import android.util.Log
import android.widget.Toast
import com.pennyspring.R
import java.util.UUID

/**
 * 系统分享图片的无窗口入口。
 *
 * NoDisplay 不创建窗口：同步复制图片并启动 Headless 任务后立即结束，
 * 用户停留在原 App；生成结果通过通知与草稿 Tab 告知。
 */
class ShareDraftActivity : Activity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        try {
            handleShare(intent)
        } catch (error: Exception) {
            Log.w(TAG, "处理分享图片失败", error)
            showToast(R.string.quick_book_share_unreadable)
        } finally {
            finish()
        }
    }

    private fun handleShare(intent: Intent?) {
        if (intent == null || !isImageShare(intent)) {
            return
        }
        val uri = extractImageUri(intent) ?: return
        val book = QuickBookCaptureCatalogStore.currentBook(this)
        if (book == null) {
            showToast(R.string.quick_book_share_no_local_book)
            return
        }
        if (QuickBookShareImageStore.isTooLarge(this, uri)) {
            showToast(R.string.quick_book_share_too_large)
            return
        }
        val draftId = UUID.randomUUID().toString()
        val file = QuickBookShareImageStore.save(this, uri, draftId)
        if (file == null) {
            showToast(R.string.quick_book_share_unreadable)
            return
        }
        val startResult =
            try {
                QuickBookJobService.start(
                    this,
                    draftId,
                    Uri.fromFile(file).toString(),
                    QuickBookCaptureCatalogStore.toRefJson(book.ref),
                    book.ref.booksId,
                    INVALID_ID,
                    INVALID_ID,
                    QuickBookDraftTaskContract.SOURCE_SHARE,
                )
            } catch (_: Exception) {
                QuickBookJobService.StartResult.FAILED
            }
        when (startResult) {
            QuickBookJobService.StartResult.STARTED -> Unit
            QuickBookJobService.StartResult.BUSY -> {
                file.delete()
                showToast(R.string.quick_book_share_busy)
            }
            QuickBookJobService.StartResult.FAILED -> {
                file.delete()
                showToast(R.string.quick_book_capture_send_failed)
            }
        }
    }

    private fun isImageShare(intent: Intent): Boolean =
        (intent.action == Intent.ACTION_SEND || intent.action == Intent.ACTION_SEND_MULTIPLE) &&
            intent.type?.startsWith("image/") == true

    /** 一期只取第一张图；一条草稿组只关联一张截图。 */
    @Suppress("DEPRECATION")
    private fun extractImageUri(intent: Intent): Uri? {
        if (intent.action == Intent.ACTION_SEND_MULTIPLE) {
            val streamList = intent.getParcelableArrayListExtra<Uri>(Intent.EXTRA_STREAM)
            if (!streamList.isNullOrEmpty()) {
                return streamList.first()
            }
        } else {
            val stream = intent.getParcelableExtra<Uri>(Intent.EXTRA_STREAM)
            if (stream != null) {
                return stream
            }
        }
        val clipData = intent.clipData ?: return null
        if (clipData.itemCount == 0) {
            return null
        }
        return clipData.getItemAt(0).uri
    }

    private fun showToast(messageRes: Int) {
        Toast.makeText(applicationContext, messageRes, Toast.LENGTH_SHORT).show()
    }

    companion object {
        private const val TAG = "ShareDraftActivity"
        private const val INVALID_ID = 0
    }
}
