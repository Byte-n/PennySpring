package com.pennyspring.backup

import android.app.Activity
import android.content.ClipData
import android.content.Intent
import android.net.Uri
import android.provider.DocumentsContract
import androidx.core.content.FileProvider
import androidx.documentfile.provider.DocumentFile
import com.facebook.react.bridge.ActivityEventListener
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import java.io.File
import java.util.concurrent.Executors

class BackupNativeModule(
    private val reactContext: ReactApplicationContext,
) : ReactContextBaseJavaModule(reactContext), ActivityEventListener {

    companion object {
        private const val PICK_DIRECTORY_REQUEST = 7311
        private const val MIME_ZIP = "application/zip"
    }

    private val executor = Executors.newSingleThreadExecutor()
    private var pickDirectoryPromise: Promise? = null

    init {
        reactContext.addActivityEventListener(this)
    }

    override fun getName(): String = "BackupNative"

    @ReactMethod
    fun pickDirectory(promise: Promise) {
        val activity = reactContext.currentActivity
        if (activity == null) {
            promise.reject("E_NO_ACTIVITY", "当前没有可用界面")
            return
        }
        if (pickDirectoryPromise != null) {
            promise.reject("E_BUSY", "目录选择正在进行")
            return
        }
        pickDirectoryPromise = promise
        try {
            val intent = Intent(Intent.ACTION_OPEN_DOCUMENT_TREE).apply {
                addFlags(
                    Intent.FLAG_GRANT_READ_URI_PERMISSION or
                        Intent.FLAG_GRANT_WRITE_URI_PERMISSION or
                        Intent.FLAG_GRANT_PERSISTABLE_URI_PERMISSION or
                        Intent.FLAG_GRANT_PREFIX_URI_PERMISSION,
                )
            }
            activity.startActivityForResult(intent, PICK_DIRECTORY_REQUEST)
        } catch (error: Exception) {
            pickDirectoryPromise = null
            promise.reject(
                "E_PICK_DIRECTORY",
                error.message ?: "无法打开目录选择器",
                error,
            )
        }
    }

    override fun onNewIntent(intent: Intent) {
        // 目录选择不使用 singleTask 的新 Intent，这里无需处理。
    }

    override fun onActivityResult(
        activity: Activity,
        requestCode: Int,
        resultCode: Int,
        data: Intent?,
    ) {
        if (requestCode != PICK_DIRECTORY_REQUEST) {
            return
        }
        val promise = pickDirectoryPromise ?: return
        pickDirectoryPromise = null
        if (resultCode != Activity.RESULT_OK) {
            promise.resolve(null)
            return
        }
        val uri = data?.data
        if (uri == null) {
            promise.reject("E_PICK_DIRECTORY", "没有取得目录")
            return
        }
        try {
            val flags = data.flags and (
                Intent.FLAG_GRANT_READ_URI_PERMISSION or
                    Intent.FLAG_GRANT_WRITE_URI_PERMISSION
                )
            reactContext.contentResolver.takePersistableUriPermission(uri, flags)
            val document = DocumentFile.fromTreeUri(reactContext, uri)
            val label = document?.name?.takeIf { it.isNotBlank() }
                ?: uri.lastPathSegment
                ?: "已选择目录"
            val result = Arguments.createMap().apply {
                putString("id", uri.toString())
                putString("label", label)
            }
            promise.resolve(result)
        } catch (error: Exception) {
            promise.reject(
                "E_PICK_DIRECTORY",
                error.message ?: "无法保存目录权限",
                error,
            )
        }
    }

    @ReactMethod
    fun writeFile(
        directoryId: String,
        fileName: String,
        base64: String,
        promise: Promise,
    ) {
        if (!isSafeFileName(fileName)) {
            promise.reject("E_INVALID_FILE", "文件名不正确")
            return
        }
        executor.execute {
            try {
                val directory = openDirectory(directoryId)
                directory.findFile(fileName)?.delete()
                val fileUri = DocumentsContract.createDocument(
                    reactContext.contentResolver,
                    directory.uri,
                    MIME_ZIP,
                    fileName,
                ) ?: throw IllegalStateException("无法在目标目录创建文件")
                val bytes = android.util.Base64.decode(base64, android.util.Base64.DEFAULT)
                reactContext.contentResolver.openOutputStream(fileUri)?.use { stream ->
                    stream.write(bytes)
                    stream.flush()
                } ?: throw IllegalStateException("无法写入目标文件")
                promise.resolve(fileUri.toString())
            } catch (error: Exception) {
                promise.reject(
                    "E_WRITE_FILE",
                    error.message ?: "写入备份文件失败",
                    error,
                )
            }
        }
    }

    @ReactMethod
    fun listFiles(directoryId: String, promise: Promise) {
        executor.execute {
            try {
                val directory = openDirectory(directoryId)
                val result = Arguments.createArray()
                directory.listFiles()
                    .filter { it.isFile }
                    .forEach { file ->
                        result.pushMap(
                            Arguments.createMap().apply {
                                putString("name", file.name ?: "")
                                putDouble("size", file.length().toDouble())
                                putDouble("lastModified", file.lastModified().toDouble())
                            },
                        )
                    }
                promise.resolve(result)
            } catch (error: Exception) {
                promise.reject(
                    "E_LIST_FILES",
                    error.message ?: "读取备份目录失败",
                    error,
                )
            }
        }
    }

    @ReactMethod
    fun deleteFile(
        directoryId: String,
        fileName: String,
        promise: Promise,
    ) {
        if (!isSafeFileName(fileName)) {
            promise.reject("E_INVALID_FILE", "文件名不正确")
            return
        }
        executor.execute {
            try {
                val directory = openDirectory(directoryId)
                val file = directory.findFile(fileName)
                    ?: throw IllegalStateException("备份文件不存在")
                if (!file.delete()) {
                    throw IllegalStateException("删除备份文件失败")
                }
                promise.resolve(null)
            } catch (error: Exception) {
                promise.reject(
                    "E_DELETE_FILE",
                    error.message ?: "删除备份文件失败",
                    error,
                )
            }
        }
    }

    @ReactMethod
    fun shareFile(uri: String, fileName: String, promise: Promise) {
        try {
            val contentUri = toContentUri(uri)
            val intent = Intent(Intent.ACTION_SEND).apply {
                type = MIME_ZIP
                putExtra(Intent.EXTRA_STREAM, contentUri)
                putExtra(Intent.EXTRA_SUBJECT, fileName)
                addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION)
                clipData = ClipData.newRawUri(fileName, contentUri)
            }
            val chooser = Intent.createChooser(intent, "分享备份")
            chooser.addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION)
            val activity = reactContext.currentActivity
            if (activity != null) {
                activity.startActivity(chooser)
            } else {
                chooser.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
                reactContext.startActivity(chooser)
            }
            promise.resolve(null)
        } catch (error: Exception) {
            promise.reject(
                "E_SHARE_FILE",
                error.message ?: "无法分享备份文件",
                error,
            )
        }
    }

    private fun openDirectory(directoryId: String): DocumentFile {
        val uri = Uri.parse(directoryId)
        if (uri.scheme != "content") {
            throw IllegalArgumentException("备份目录无效")
        }
        val directory = DocumentFile.fromTreeUri(reactContext, uri)
            ?: throw IllegalStateException("无法访问备份目录")
        if (!directory.exists() || !directory.isDirectory) {
            throw IllegalStateException("备份目录不存在")
        }
        return directory
    }

    private fun toContentUri(raw: String): Uri {
        val uri = Uri.parse(raw)
        if (uri.scheme == "content") {
            return uri
        }
        val path = if (raw.startsWith("file://")) {
            Uri.decode(raw.removePrefix("file://"))
        } else {
            raw
        }
        return FileProvider.getUriForFile(
            reactContext,
            "${reactContext.packageName}.fileprovider",
            File(path),
        )
    }

    private fun isSafeFileName(fileName: String): Boolean =
        fileName.isNotBlank() &&
            !fileName.contains('/') &&
            !fileName.contains('\\') &&
            !fileName.contains("..")
}
