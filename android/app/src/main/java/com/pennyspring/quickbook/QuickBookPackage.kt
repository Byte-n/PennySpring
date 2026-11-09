package com.pennyspring.quickbook

import com.facebook.react.ReactPackage
import com.facebook.react.bridge.NativeModule
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.uimanager.ViewManager
import com.pennyspring.quickbook.draft.QuickBookDraftModule
import com.pennyspring.quickbook.widget.QuickTemplateWidgetModule

class QuickBookPackage : ReactPackage {
    override fun createNativeModules(reactContext: ReactApplicationContext): List<NativeModule> =
        listOf(
            QuickBookScreenshotModule(reactContext),
            QuickBookDraftModule(reactContext),
            QuickTemplateWidgetModule(reactContext),
        )

    override fun createViewManagers(reactContext: ReactApplicationContext): List<ViewManager<*, *>> = emptyList()
}
