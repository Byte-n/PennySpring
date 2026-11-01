package com.pennyspring.quickbook

import android.Manifest
import android.content.ContentUris
import android.content.pm.PackageManager
import android.os.Build
import android.provider.MediaStore
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.WritableMap
import java.util.concurrent.Executors

/**
 * 读取相册中最新的截图。仅 Android；iOS 没有等价的系统能力。
 */
class QuickBookScreenshotModule(
    private val reactContext: ReactApplicationContext,
) : ReactContextBaseJavaModule(reactContext) {
    private val executor = Executors.newSingleThreadExecutor()

    override fun getName(): String = "QuickBookScreenshot"

    @ReactMethod
    fun getLatestScreenshot(
        maxAgeSeconds: Double,
        maxEdge: Double,
        quality: Double,
        promise: Promise,
    ) {
        executor.execute {
            try {
                promise.resolve(
                    queryLatest(maxAgeSeconds, maxEdge.toInt(), quality.toInt()),
                )
            } catch (error: Exception) {
                promise.reject("QUICK_BOOK_SCREENSHOT_FAILED", error)
            }
        }
    }

    private fun queryLatest(
        maxAgeSeconds: Double,
        maxEdge: Int,
        quality: Int,
    ): WritableMap {
        val permission =
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
                Manifest.permission.READ_MEDIA_IMAGES
            } else {
                Manifest.permission.READ_EXTERNAL_STORAGE
            }
        if (reactContext.checkSelfPermission(permission) != PackageManager.PERMISSION_GRANTED) {
            return Arguments.createMap().apply { putString("status", "permission") }
        }

        val collection =
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
                MediaStore.Images.Media.getContentUri(MediaStore.VOLUME_EXTERNAL)
            } else {
                MediaStore.Images.Media.EXTERNAL_CONTENT_URI
            }
        val projection =
            arrayOf(
                MediaStore.Images.Media._ID,
                MediaStore.Images.Media.DATE_ADDED,
            )
        val selection: String
        val selectionArgs: Array<String>
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
            selection =
                "${MediaStore.Images.Media.RELATIVE_PATH} LIKE ? OR " +
                "${MediaStore.Images.Media.RELATIVE_PATH} LIKE ? OR " +
                "${MediaStore.Images.Media.RELATIVE_PATH} LIKE ?"
            selectionArgs = arrayOf("%Screenshots%", "%截屏%", "%截图%")
        } else {
            selection =
                "${MediaStore.Images.Media.DATA} LIKE ? OR " +
                "${MediaStore.Images.Media.DATA} LIKE ? OR " +
                "${MediaStore.Images.Media.DATA} LIKE ?"
            selectionArgs = arrayOf("%/Screenshots/%", "%截屏%", "%截图%")
        }

        reactContext.contentResolver
            .query(
                collection,
                projection,
                selection,
                selectionArgs,
                "${MediaStore.Images.Media.DATE_ADDED} DESC",
            )?.use { cursor ->
                if (!cursor.moveToFirst()) {
                    return Arguments.createMap().apply { putString("status", "empty") }
                }

                val assetId =
                    cursor.getLong(
                        cursor.getColumnIndexOrThrow(MediaStore.Images.Media._ID),
                    )
                val dateAddedSeconds =
                    cursor.getLong(
                        cursor.getColumnIndexOrThrow(MediaStore.Images.Media.DATE_ADDED),
                    )
                val ageSeconds = System.currentTimeMillis() / 1000 - dateAddedSeconds
                if (ageSeconds > maxAgeSeconds) {
                    return Arguments.createMap().apply {
                        putString("status", "stale")
                        putString("assetId", assetId.toString())
                        putDouble("dateAddedSeconds", dateAddedSeconds.toDouble())
                    }
                }

                val imageUri = ContentUris.withAppendedId(collection, assetId)
                val payload =
                    QuickBookImageProcessor.process(
                        reactContext,
                        imageUri,
                        maxEdge,
                        quality,
                    ) ?: return Arguments.createMap().apply { putString("status", "empty") }

                payload.putString("status", "ok")
                payload.putString("assetId", assetId.toString())
                payload.putDouble("dateAddedSeconds", dateAddedSeconds.toDouble())
                return payload
            }

        return Arguments.createMap().apply { putString("status", "empty") }
    }
}
