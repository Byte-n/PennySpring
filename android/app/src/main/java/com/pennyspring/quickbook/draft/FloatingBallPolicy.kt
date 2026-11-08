package com.pennyspring.quickbook.draft

internal object FloatingBallPolicy {
    fun shouldShow(
        foregroundPackage: String?,
        excludedPackages: Set<String>,
        systemSurfacePackages: Set<String>,
        captureHidden: Boolean,
    ): Boolean {
        if (captureHidden) {
            return false
        }
        if (foregroundPackage == null) {
            return true
        }
        return foregroundPackage !in excludedPackages && foregroundPackage !in systemSurfacePackages
    }
}
