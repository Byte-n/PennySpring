package com.pennyspring.quickbook.draft

import android.app.Service
import android.content.Context
import android.content.Intent
import android.content.pm.ServiceInfo
import android.os.Build
import android.os.IBinder
import android.util.Log
import androidx.core.app.ServiceCompat
import androidx.core.content.ContextCompat

/**
 * MediaProjection 类型前台服务占位。
 *
 * 自由截图 Activity 在取得用户授权后启动 / 停止本服务，保持进程优先级。
 * Android 14 起 mediaProjection 类型前台服务必须在用户授权屏幕录制之后启动，
 * 因此调用顺序由截图 Activity 保证；这里对类型被拒绝的情况做降级处理。
 */
class MediaProjectionService : Service() {
    companion object {
        private const val TAG = "MediaProjectionService"
        private const val NOTIFICATION_ID = QuickBookDraftNotifications.NOTIFICATION_ID_CAPTURE

        @JvmStatic
        fun start(context: Context) {
            try {
                ContextCompat.startForegroundService(context, Intent(context, MediaProjectionService::class.java))
            } catch (error: Exception) {
                Log.w(TAG, "启动屏幕截图服务失败", error)
            }
        }

        @JvmStatic
        fun stop(context: Context) {
            context.stopService(Intent(context, MediaProjectionService::class.java))
        }
    }

    override fun onBind(intent: Intent?): IBinder? = null

    override fun onCreate() {
        super.onCreate()
        startAsForegroundService()
    }

    override fun onStartCommand(
        intent: Intent?,
        flags: Int,
        startId: Int,
    ): Int {
        startAsForegroundService()
        return START_NOT_STICKY
    }

    override fun onDestroy() {
        ServiceCompat.stopForeground(this, ServiceCompat.STOP_FOREGROUND_REMOVE)
        super.onDestroy()
    }

    private fun startAsForegroundService() {
        val notification = QuickBookDraftNotifications.captureNotification(this)
        try {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
                startForeground(
                    NOTIFICATION_ID,
                    notification,
                    ServiceInfo.FOREGROUND_SERVICE_TYPE_MEDIA_PROJECTION,
                )
            } else {
                startForeground(NOTIFICATION_ID, notification)
            }
        } catch (error: Exception) {
            // Android 14 会拒绝无 MediaProjection 授权令牌的 mediaProjection 前台服务；
            // 截图 Activity 需要先完成授权再启动本服务。
            Log.w(TAG, "mediaProjection 前台服务类型被拒绝", error)
            try {
                startForeground(NOTIFICATION_ID, notification)
            } catch (fallbackError: Exception) {
                Log.w(TAG, "启动前台通知失败", fallbackError)
                stopSelf()
            }
        }
    }
}
