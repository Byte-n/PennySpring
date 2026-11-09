package com.pennyspring.quickbook.widget

import android.app.PendingIntent
import android.appwidget.AppWidgetManager
import android.appwidget.AppWidgetProvider
import android.content.ComponentName
import android.content.Context
import android.content.Intent
import android.content.res.Configuration
import android.net.Uri
import android.util.Log
import android.view.View
import android.widget.RemoteViews
import android.widget.Toast
import com.pennyspring.MainActivity
import com.pennyspring.R
import java.util.UUID
import java.util.concurrent.ConcurrentHashMap

/** 快捷模板桌面小组件的展示与点击入口。 */
class QuickTemplateWidgetProvider : AppWidgetProvider() {
    companion object {
        private const val TAG = "QuickTemplateWidget"
        private const val ACTION_RECORD = "com.pennyspring.quickbook.widget.ACTION_RECORD"
        private const val EXTRA_TEMPLATE_ID = "templateId"
        private const val EXTRA_WIDGET_ID = "widgetId"
        private const val INVALID_ID = 0
        private const val DEFAULT_WIDTH_DP = 343
        private const val DEFAULT_HEIGHT_DP = 136
        private const val HEADER_ACTION_SLOT = 16
        private const val EMPTY_ACTION_SLOT = 17
        private const val QUICK_TEMPLATES_ACTION_SLOT = 18
        private const val ADD_TEMPLATE_DEEP_LINK = "pennyspring://add-record?template=true"
        private const val QUICK_TEMPLATES_DEEP_LINK = "pennyspring://quick-templates"
        private const val RECORD_DEBOUNCE_MS = 2_000L
        private const val HIDE_BOOK_BELOW_WIDTH_DP = 220

        private val lastRecordClick = ConcurrentHashMap<String, Long>()

        private val ROW_IDS =
            intArrayOf(
                R.id.widget_row_1,
                R.id.widget_row_2,
                R.id.widget_row_3,
                R.id.widget_row_4,
            )

        private val CELL_IDS =
            intArrayOf(
                R.id.widget_cell_1,
                R.id.widget_cell_2,
                R.id.widget_cell_3,
                R.id.widget_cell_4,
                R.id.widget_cell_5,
                R.id.widget_cell_6,
                R.id.widget_cell_7,
                R.id.widget_cell_8,
                R.id.widget_cell_9,
                R.id.widget_cell_10,
                R.id.widget_cell_11,
                R.id.widget_cell_12,
                R.id.widget_cell_13,
                R.id.widget_cell_14,
                R.id.widget_cell_15,
                R.id.widget_cell_16,
            )

        private val NAME_IDS =
            intArrayOf(
                R.id.widget_name_1,
                R.id.widget_name_2,
                R.id.widget_name_3,
                R.id.widget_name_4,
                R.id.widget_name_5,
                R.id.widget_name_6,
                R.id.widget_name_7,
                R.id.widget_name_8,
                R.id.widget_name_9,
                R.id.widget_name_10,
                R.id.widget_name_11,
                R.id.widget_name_12,
                R.id.widget_name_13,
                R.id.widget_name_14,
                R.id.widget_name_15,
                R.id.widget_name_16,
            )

        private val PROGRESS_IDS =
            intArrayOf(
                R.id.widget_progress_1,
                R.id.widget_progress_2,
                R.id.widget_progress_3,
                R.id.widget_progress_4,
                R.id.widget_progress_5,
                R.id.widget_progress_6,
                R.id.widget_progress_7,
                R.id.widget_progress_8,
                R.id.widget_progress_9,
                R.id.widget_progress_10,
                R.id.widget_progress_11,
                R.id.widget_progress_12,
                R.id.widget_progress_13,
                R.id.widget_progress_14,
                R.id.widget_progress_15,
                R.id.widget_progress_16,
            )

        @JvmStatic
        fun refreshAll(context: Context) {
            val manager = AppWidgetManager.getInstance(context)
            val componentName = ComponentName(context, QuickTemplateWidgetProvider::class.java)
            manager.getAppWidgetIds(componentName).forEach { widgetId ->
                renderWidget(context, widgetId, null)
            }
        }

        private fun renderWidget(
            context: Context,
            widgetId: Int,
            busyTemplateId: Int?,
        ) {
            val manager = AppWidgetManager.getInstance(context)
            if (manager.getAppWidgetInfo(widgetId) == null) {
                return
            }
            val options = manager.getAppWidgetOptions(widgetId)
            val widthDp = resolveWidth(context, options)
            val heightDp = resolveHeight(context, options)
            val columns = QuickTemplateWidgetSizing.columnsForWidth(widthDp)
            val rows = QuickTemplateWidgetSizing.rowsForHeight(heightDp)
            val capacity = columns * rows

            val catalog = QuickTemplateWidgetCatalogStore.read(context)
            val book = catalog?.book
            val templates = if (book?.available == true) book.templates else emptyList()
            val visibleTemplates = templates.take(capacity)

            val views = RemoteViews(context.packageName, R.layout.quick_template_widget)
            val bookName =
                when {
                    book == null -> context.getString(R.string.quick_template_widget_book_none)
                    book.ref.bookName.isNotBlank() -> book.ref.bookName
                    else -> context.getString(R.string.quick_template_widget_book_fallback)
                }
            views.setTextViewText(R.id.widget_book, bookName)
            views.setViewVisibility(
                R.id.widget_book,
                if (widthDp < HIDE_BOOK_BELOW_WIDTH_DP) View.GONE else View.VISIBLE,
            )
            views.setOnClickPendingIntent(
                R.id.widget_all,
                openQuickTemplatesPendingIntent(context, widgetId),
            )

            if (visibleTemplates.isEmpty()) {
                showEmptyState(context, views, book, widgetId, rows)
            } else {
                showTemplates(
                    context = context,
                    views = views,
                    widgetId = widgetId,
                    columns = columns,
                    rows = rows,
                    templates = visibleTemplates,
                    busyTemplateId = busyTemplateId,
                )
            }

            try {
                manager.updateAppWidget(widgetId, views)
            } catch (error: Exception) {
                Log.w(TAG, "更新快捷模板小组件失败", error)
            }
        }

        private fun showTemplates(
            context: Context,
            views: RemoteViews,
            widgetId: Int,
            columns: Int,
            rows: Int,
            templates: List<QuickTemplateWidgetCatalogStore.Template>,
            busyTemplateId: Int?,
        ) {
            views.setViewVisibility(R.id.widget_empty, View.GONE)
            ROW_IDS.forEachIndexed { rowIndex, rowId ->
                views.setViewVisibility(rowId, if (rowIndex < rows) View.VISIBLE else View.GONE)
            }
            CELL_IDS.forEach { cellId ->
                views.setViewVisibility(cellId, View.GONE)
            }
            PROGRESS_IDS.forEach { progressId ->
                views.setViewVisibility(progressId, View.GONE)
            }
            QuickTemplateWidgetSizing
                .slotsForLayout(columns = columns, rows = rows, templateCount = templates.size)
                .forEach { slot ->
                    val template = templates[slot.templateIndex]
                    val name = QuickTemplateWidgetSizing.truncateName(template.name)
                    views.setViewVisibility(CELL_IDS[slot.slotIndex], View.VISIBLE)
                    views.setTextViewText(
                        NAME_IDS[slot.slotIndex],
                        name.ifBlank { context.getString(R.string.quick_template_widget_name_fallback) },
                    )
                    views.setViewVisibility(
                        PROGRESS_IDS[slot.slotIndex],
                        if (busyTemplateId == template.id) View.VISIBLE else View.GONE,
                    )
                    views.setOnClickPendingIntent(
                        CELL_IDS[slot.slotIndex],
                        recordPendingIntent(context, widgetId, template.id, slot.slotIndex),
                    )
                }
        }

        private fun showEmptyState(
            context: Context,
            views: RemoteViews,
            book: QuickTemplateWidgetCatalogStore.Book?,
            widgetId: Int,
            rows: Int,
        ) {
            ROW_IDS.forEach { rowId ->
                views.setViewVisibility(rowId, View.GONE)
            }
            views.setViewVisibility(R.id.widget_empty, View.VISIBLE)

            val titleRes: Int
            val hint: String
            val actionRes: Int
            val actionIntent: PendingIntent
            if (book == null) {
                titleRes = R.string.quick_template_widget_empty_no_book_title
                hint = context.getString(R.string.quick_template_widget_empty_no_book_hint)
                actionRes = R.string.quick_template_widget_empty_action_open_app
                actionIntent = openAppPendingIntent(context, widgetId)
            } else if (!book.available) {
                titleRes = R.string.quick_template_widget_empty_unavailable_title
                hint =
                    book.unavailableReason.ifBlank {
                        context.getString(R.string.quick_template_widget_empty_unavailable_hint)
                    }
                actionRes = R.string.quick_template_widget_empty_action_open_app
                actionIntent = openAppPendingIntent(context, widgetId)
            } else {
                titleRes = R.string.quick_template_widget_empty_no_templates_title
                hint = context.getString(R.string.quick_template_widget_empty_no_templates_hint)
                actionRes = R.string.quick_template_widget_empty_action_add_template
                actionIntent = openAddTemplatePendingIntent(context, widgetId)
            }
            views.setTextViewText(R.id.widget_empty_title, context.getString(titleRes))
            views.setTextViewText(R.id.widget_empty_hint, hint)
            views.setTextViewText(R.id.widget_empty_action, context.getString(actionRes))
            if (rows <= 1) {
                // 只够一行时退化为“标题 · 动作”，整块可点。
                views.setViewVisibility(R.id.widget_empty_hint, View.GONE)
                views.setViewVisibility(R.id.widget_empty_action, View.GONE)
                views.setTextViewText(
                    R.id.widget_empty_title,
                    context.getString(titleRes) + " · " + context.getString(actionRes),
                )
            } else {
                views.setViewVisibility(R.id.widget_empty_hint, View.VISIBLE)
                views.setViewVisibility(R.id.widget_empty_action, View.VISIBLE)
            }
            views.setOnClickPendingIntent(R.id.widget_empty, actionIntent)
            views.setOnClickPendingIntent(R.id.widget_empty_action, actionIntent)
        }

        private fun handleRecord(
            context: Context,
            intent: Intent,
        ) {
            val widgetId = intent.getIntExtra(EXTRA_WIDGET_ID, INVALID_ID)
            val templateId = intent.getIntExtra(EXTRA_TEMPLATE_ID, INVALID_ID)
            val book = QuickTemplateWidgetCatalogStore.read(context)?.book
            if (book == null) {
                Toast.makeText(context, R.string.quick_template_widget_toast_book_unavailable, Toast.LENGTH_SHORT).show()
                refreshAll(context)
                return
            }
            if (!book.available) {
                Toast
                    .makeText(
                        context,
                        book.unavailableReason.ifBlank {
                            context.getString(R.string.quick_template_widget_toast_book_unavailable)
                        },
                        Toast.LENGTH_SHORT,
                    ).show()
                refreshAll(context)
                return
            }
            val template = book.templates.firstOrNull { it.id == templateId }
            if (template == null) {
                Toast.makeText(context, R.string.quick_template_widget_toast_template_missing, Toast.LENGTH_SHORT).show()
                refreshAll(context)
                return
            }

            val clickKey = "$widgetId:${template.id}"
            val now = System.currentTimeMillis()
            val lastClick = lastRecordClick[clickKey]
            if (lastClick != null && now - lastClick < RECORD_DEBOUNCE_MS) {
                Toast.makeText(context, R.string.quick_template_widget_toast_busy, Toast.LENGTH_SHORT).show()
                return
            }
            lastRecordClick[clickKey] = now

            val requestId = UUID.randomUUID().toString()
            renderWidget(context, widgetId, templateId)
            when (
                QuickTemplateRecordService.start(
                    context = context,
                    requestId = requestId,
                    templateId = template.id,
                    bookRefJson = QuickTemplateWidgetCatalogStore.toRefJson(book.ref),
                    widgetId = widgetId,
                )
            ) {
                QuickTemplateRecordService.StartResult.STARTED -> Unit
                QuickTemplateRecordService.StartResult.BUSY -> {
                    renderWidget(context, widgetId, null)
                    Toast.makeText(context, R.string.quick_template_widget_toast_busy, Toast.LENGTH_SHORT).show()
                }
                QuickTemplateRecordService.StartResult.FAILED -> {
                    renderWidget(context, widgetId, null)
                    Toast.makeText(context, R.string.quick_template_widget_toast_failed, Toast.LENGTH_SHORT).show()
                }
            }
        }

        private fun recordPendingIntent(
            context: Context,
            widgetId: Int,
            templateId: Int,
            slotIndex: Int,
        ): PendingIntent {
            val intent =
                Intent(context, QuickTemplateWidgetProvider::class.java).apply {
                    action = ACTION_RECORD
                    putExtra(EXTRA_WIDGET_ID, widgetId)
                    putExtra(EXTRA_TEMPLATE_ID, templateId)
                }
            return PendingIntent.getBroadcast(
                context,
                requestCode(widgetId, slotIndex),
                intent,
                PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE,
            )
        }

        private fun openAppPendingIntent(
            context: Context,
            widgetId: Int,
        ): PendingIntent {
            val intent =
                Intent(context, MainActivity::class.java).apply {
                    action = Intent.ACTION_MAIN
                    addCategory(Intent.CATEGORY_LAUNCHER)
                    flags =
                        Intent.FLAG_ACTIVITY_NEW_TASK or
                        Intent.FLAG_ACTIVITY_SINGLE_TOP or
                        Intent.FLAG_ACTIVITY_CLEAR_TOP
                }
            return PendingIntent.getActivity(
                context,
                requestCode(widgetId, HEADER_ACTION_SLOT),
                intent,
                PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE,
            )
        }

        private fun openAddTemplatePendingIntent(
            context: Context,
            widgetId: Int,
        ): PendingIntent {
            val intent =
                Intent(
                    Intent.ACTION_VIEW,
                    Uri.parse(ADD_TEMPLATE_DEEP_LINK),
                    context,
                    MainActivity::class.java,
                ).apply {
                    flags =
                        Intent.FLAG_ACTIVITY_NEW_TASK or
                        Intent.FLAG_ACTIVITY_SINGLE_TOP or
                        Intent.FLAG_ACTIVITY_CLEAR_TOP
                }
            return PendingIntent.getActivity(
                context,
                requestCode(widgetId, EMPTY_ACTION_SLOT),
                intent,
                PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE,
            )
        }

        private fun openQuickTemplatesPendingIntent(
            context: Context,
            widgetId: Int,
        ): PendingIntent {
            val intent =
                Intent(
                    Intent.ACTION_VIEW,
                    Uri.parse(QUICK_TEMPLATES_DEEP_LINK),
                    context,
                    MainActivity::class.java,
                ).apply {
                    flags =
                        Intent.FLAG_ACTIVITY_NEW_TASK or
                        Intent.FLAG_ACTIVITY_SINGLE_TOP or
                        Intent.FLAG_ACTIVITY_CLEAR_TOP
                }
            return PendingIntent.getActivity(
                context,
                requestCode(widgetId, QUICK_TEMPLATES_ACTION_SLOT),
                intent,
                PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE,
            )
        }

        private fun requestCode(
            widgetId: Int,
            slot: Int,
        ): Int = widgetId * 32 + slot

        private fun resolveWidth(
            context: Context,
            options: android.os.Bundle,
        ): Int {
            val landscape = context.resources.configuration.orientation == Configuration.ORIENTATION_LANDSCAPE
            val width =
                if (landscape) {
                    options.getInt(AppWidgetManager.OPTION_APPWIDGET_MAX_WIDTH, 0)
                } else {
                    options.getInt(AppWidgetManager.OPTION_APPWIDGET_MIN_WIDTH, 0)
                }
            return width.takeIf { it > 0 } ?: DEFAULT_WIDTH_DP
        }

        private fun resolveHeight(
            context: Context,
            options: android.os.Bundle,
        ): Int {
            val landscape = context.resources.configuration.orientation == Configuration.ORIENTATION_LANDSCAPE
            val height =
                if (landscape) {
                    options.getInt(AppWidgetManager.OPTION_APPWIDGET_MAX_HEIGHT, 0)
                } else {
                    options.getInt(AppWidgetManager.OPTION_APPWIDGET_MIN_HEIGHT, 0)
                }
            return height.takeIf { it > 0 } ?: DEFAULT_HEIGHT_DP
        }
    }

    override fun onUpdate(
        context: Context,
        appWidgetManager: AppWidgetManager,
        appWidgetIds: IntArray,
    ) {
        appWidgetIds.forEach { widgetId ->
            renderWidget(context, widgetId, null)
        }
    }

    override fun onAppWidgetOptionsChanged(
        context: Context,
        appWidgetManager: AppWidgetManager,
        appWidgetId: Int,
        newOptions: android.os.Bundle,
    ) {
        renderWidget(context, appWidgetId, null)
    }

    override fun onReceive(
        context: Context,
        intent: Intent,
    ) {
        super.onReceive(context, intent)
        if (intent.action == ACTION_RECORD) {
            handleRecord(context, intent)
        }
    }
}
