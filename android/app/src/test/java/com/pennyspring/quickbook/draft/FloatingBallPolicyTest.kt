package com.pennyspring.quickbook.draft

import org.junit.Assert.assertFalse
import org.junit.Assert.assertTrue
import org.junit.Test

class FloatingBallPolicyTest {
    private val excluded = setOf("com.example.game")
    private val systemSurfaces = setOf("com.example.launcher")

    @Test
    fun showsWhenForegroundIsUnknown() {
        assertTrue(FloatingBallPolicy.shouldShow(null, excluded, systemSurfaces, false))
    }

    @Test
    fun hidesWhenForegroundPackageIsExcluded() {
        assertFalse(FloatingBallPolicy.shouldShow("com.example.game", excluded, systemSurfaces, false))
    }

    @Test
    fun hidesWhenForegroundIsSystemSurface() {
        assertFalse(FloatingBallPolicy.shouldShow("com.example.launcher", excluded, systemSurfaces, false))
    }

    @Test
    fun showsWhenForegroundPackageIsNotExcluded() {
        assertTrue(FloatingBallPolicy.shouldShow("com.example.video", excluded, systemSurfaces, false))
    }

    @Test
    fun hidesWhileCaptureIsActiveEvenOutsideExcludedApps() {
        assertFalse(FloatingBallPolicy.shouldShow("com.example.video", excluded, systemSurfaces, true))
    }
}
