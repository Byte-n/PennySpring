package com.pennyspring.quickbook.draft

internal object FloatingBallPolicy {
    fun shouldShow(
        foregroundPackage: String?,
        excludedPackages: Set<String>,
        captureHidden: Boolean,
    ): Boolean =
        !captureHidden &&
            (foregroundPackage == null || foregroundPackage !in excludedPackages)
}
