package com.pennyspring.update

import android.content.Intent
import android.net.Uri
import android.os.Build
import android.provider.Settings
import androidx.core.content.FileProvider
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.pennyspring.BuildConfig
import java.io.File

class UpdateNativeModule(
    private val reactContext: ReactApplicationContext,
) : ReactContextBaseJavaModule(reactContext) {

    companion object {
        private const val MIME_APK = "application/vnd.android.package-archive"
    }

    override fun getName(): String = "UpdateNative"

    @ReactMethod
    fun getVersion(promise: Promise) {
        promise.resolve(
            Arguments.createMap().apply {
                putInt("versionCode", BuildConfig.VERSION_CODE)
                putString("versionName", BuildConfig.VERSION_NAME)
            },
        )
    }

    @ReactMethod
    fun getSupportedAbis(promise: Promise) {
        promise.resolve(
            Arguments.createArray().apply {
                Build.SUPPORTED_ABIS.forEach { abi -> pushString(abi) }
            },
        )
    }

    @ReactMethod
    fun installApk(path: String, promise: Promise) {
        try {
            val file = File(path).canonicalFile
            val cacheDirectory = reactContext.cacheDir.canonicalFile
            if (!file.path.startsWith("${cacheDirectory.path}${File.separator}")) {
                promise.reject("E_INVALID_APK", "安装文件不在应用缓存目录")
                return
            }
            if (!file.isFile || !file.canRead()) {
                promise.reject("E_INVALID_APK", "安装文件不存在或不可读取")
                return
            }
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O &&
                !reactContext.packageManager.canRequestPackageInstalls()
            ) {
                val activity = reactContext.currentActivity
                val settingsIntent = Intent(
                    Settings.ACTION_MANAGE_UNKNOWN_APP_SOURCES,
                    Uri.parse("package:${reactContext.packageName}"),
                )
                if (activity != null) {
                    activity.startActivity(settingsIntent)
                } else {
                    settingsIntent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
                    reactContext.startActivity(settingsIntent)
                }
                promise.reject("E_INSTALL_PERMISSION", "请允许 PennySpring 安装未知应用后重试")
                return
            }

            val apkUri = FileProvider.getUriForFile(
                reactContext,
                "${reactContext.packageName}.fileprovider",
                file,
            )
            val installIntent = Intent(Intent.ACTION_VIEW).apply {
                setDataAndType(apkUri, MIME_APK)
                addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION)
                addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
            }
            reactContext.startActivity(installIntent)
            promise.resolve(null)
        } catch (error: Exception) {
            promise.reject("E_INSTALL_APK", error.message ?: "无法打开系统安装器", error)
        }
    }
}
