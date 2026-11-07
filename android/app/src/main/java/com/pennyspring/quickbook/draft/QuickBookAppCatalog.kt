package com.pennyspring.quickbook.draft

import android.content.Context
import android.content.Intent
import android.content.pm.PackageManager
import android.content.pm.ResolveInfo
import android.graphics.Bitmap
import android.graphics.Canvas
import android.graphics.Path
import android.graphics.RectF
import android.util.Base64
import java.io.ByteArrayOutputStream
import java.text.Collator
import java.util.Locale
import java.util.concurrent.ConcurrentHashMap

data class QuickBookInstalledApp(
    val packageName: String,
    val label: String,
    val iconDataUrl: String,
)

/**
 * 悬浮球“排除的应用”候选：只查询带启动入口的应用，避免把系统服务列进选择页。
 * 图标转成小尺寸 PNG data URL，React Native 侧无需再跨进程加载图标。
 */
object QuickBookAppCatalog {
    private const val ICON_SIZE_PX = 128
    private const val ICON_CORNER_RATIO = 0.22f

    private val iconCache = ConcurrentHashMap<String, String>()

    fun list(context: Context): List<QuickBookInstalledApp> {
        val packageManager = context.packageManager
        val launcherIntent =
            Intent(Intent.ACTION_MAIN).addCategory(Intent.CATEGORY_LAUNCHER)
        val resolved = packageManager.queryIntentActivities(launcherIntent, 0)
        val seenPackages = HashSet<String>()
        val apps = ArrayList<QuickBookInstalledApp>(resolved.size)
        for (info in resolved) {
            val activityInfo = info.activityInfo ?: continue
            val packageName = activityInfo.packageName ?: continue
            if (!seenPackages.add(packageName)) {
                continue
            }
            val label =
                info
                    .loadLabel(packageManager)
                    ?.toString()
                    ?.trim()
                    .orEmpty()
                    .ifBlank { packageName }
            apps.add(
                QuickBookInstalledApp(
                    packageName = packageName,
                    label = label,
                    iconDataUrl = loadIconDataUrl(packageManager, packageName, info),
                ),
            )
        }
        val collator = Collator.getInstance(Locale.getDefault())
        apps.sortWith { left, right -> collator.compare(left.label, right.label) }
        return apps
    }

    private fun loadIconDataUrl(
        packageManager: PackageManager,
        packageName: String,
        info: ResolveInfo,
    ): String {
        iconCache[packageName]?.let { return it }
        val drawable =
            try {
                info.loadIcon(packageManager)
            } catch (error: Exception) {
                packageManager.defaultActivityIcon
            }
        if (drawable == null) {
            return ""
        }
        val bitmap = Bitmap.createBitmap(ICON_SIZE_PX, ICON_SIZE_PX, Bitmap.Config.ARGB_8888)
        try {
            val canvas = Canvas(bitmap)
            val radius = ICON_SIZE_PX * ICON_CORNER_RATIO
            val clip = Path()
            clip.addRoundRect(
                RectF(0f, 0f, ICON_SIZE_PX.toFloat(), ICON_SIZE_PX.toFloat()),
                radius,
                radius,
                Path.Direction.CW,
            )
            canvas.clipPath(clip)
            drawable.setBounds(0, 0, ICON_SIZE_PX, ICON_SIZE_PX)
            drawable.draw(canvas)
            val output = ByteArrayOutputStream()
            bitmap.compress(Bitmap.CompressFormat.PNG, 100, output)
            val encoded = Base64.encodeToString(output.toByteArray(), Base64.NO_WRAP)
            val dataUrl = "data:image/png;base64,$encoded"
            iconCache[packageName] = dataUrl
            return dataUrl
        } finally {
            bitmap.recycle()
        }
    }
}
