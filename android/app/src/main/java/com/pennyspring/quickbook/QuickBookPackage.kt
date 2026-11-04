package com.pennyspring.quickbook

import com.facebook.react.ReactPackage
import com.facebook.react.bridge.NativeModule
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.uimanager.ViewManager
import com.pennyspring.quickbook.draft.QuickBookDraftModule

class QuickBookPackage : ReactPackage {
    override fun createNativeModules(reactContext: ReactApplicationContext): List<NativeModule> =
        listOf(
            QuickBookScreenshotModule(reactContext),
            QuickBookShareModule(reactContext),
            QuickBookDraftModule(reactContext),
        )

    override fun createViewManagers(reactContext: ReactApplicationContext): List<ViewManager<*, *>> = emptyList()
}
