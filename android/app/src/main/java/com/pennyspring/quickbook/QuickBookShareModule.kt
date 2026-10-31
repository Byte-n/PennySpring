package com.pennyspring.quickbook

import android.content.Intent
import android.net.Uri
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.modules.core.DeviceEventManagerModule
import java.util.concurrent.Executors

/**
 * 接收系统分享的图片。MainActivity 在 onCreate / onNewIntent 中调用 handleIntent。
 * iOS 暂不支持；需要时由 Share Extension 单独实现。
 */
class QuickBookShareModule(
    private val reactContext: ReactApplicationContext,
) : ReactContextBaseJavaModule(reactContext) {

    companion object {
        const val EVENT_NAME = "QuickBookShareAvailable"
        private const val EXTRA_HANDLED = "com.pennyspring.quickbook.HANDLED"

        private val lock = Any()

        @Volatile
        private var pendingUri: Uri? = null

        @Volatile
        private var activeContext: ReactApplicationContext? = null

        @JvmStatic
        fun handleIntent(intent: Intent?): Boolean {
            if (intent == null) {
                return false
            }
            if (intent.action != Intent.ACTION_SEND &&
                intent.action != Intent.ACTION_SEND_MULTIPLE
            ) {
                return false
            }
            if (intent.getBooleanExtra(EXTRA_HANDLED, false)) {
                return false
            }
            val type = intent.type
            if (type == null || !type.startsWith("image/")) {
                return false
            }
            val uri = extractUri(intent) ?: return false
            intent.putExtra(EXTRA_HANDLED, true)
            synchronized(lock) {
                pendingUri = uri
            }
            emitAvailable()
            return true
        }

        @Suppress("DEPRECATION")
        private fun extractUri(intent: Intent): Uri? {
            val stream = intent.getParcelableExtra<Uri>(Intent.EXTRA_STREAM)
            if (stream != null) {
                return stream
            }
            val streamList =
                intent.getParcelableArrayListExtra<Uri>(Intent.EXTRA_STREAM)
            if (!streamList.isNullOrEmpty()) {
                return streamList.first()
            }
            val clipData = intent.clipData ?: return null
            if (clipData.itemCount == 0) {
                return null
            }
            return clipData.getItemAt(0).uri
        }

        private fun emitAvailable() {
            val context = activeContext ?: return
            try {
                context
                    .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
                    .emit(EVENT_NAME, null)
            } catch (_: Exception) {
                // JS 尚未就绪时忽略，挂载后会主动 consume。
            }
        }
    }

    private val executor = Executors.newSingleThreadExecutor()

    init {
        activeContext = reactContext
    }

    override fun getName(): String = "QuickBookShare"

    @ReactMethod
    fun consumeSharedImage(
        maxEdge: Double,
        quality: Double,
        promise: Promise,
    ) {
        val uri = synchronized(lock) {
            val current = pendingUri
            pendingUri = null
            current
        }
        if (uri == null) {
            promise.resolve(null)
            return
        }
        executor.execute {
            try {
                promise.resolve(
                    QuickBookImageProcessor.process(
                        reactContext,
                        uri,
                        maxEdge.toInt(),
                        quality.toInt(),
                    ),
                )
            } catch (error: Exception) {
                promise.reject("QUICK_BOOK_SHARE_FAILED", error)
            }
        }
    }
}
