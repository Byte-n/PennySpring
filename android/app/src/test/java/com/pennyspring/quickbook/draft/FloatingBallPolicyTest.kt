package com.pennyspring.quickbook.draft

import org.junit.Assert.assertFalse
import org.junit.Assert.assertTrue
import org.junit.Test

class FloatingBallPolicyTest {
    private val excluded = setOf("com.example.game")

    @Test
    fun showsWhenForegroundIsUnknown() {
        assertTrue(FloatingBallPolicy.shouldShow(null, excluded, false))
    }

    @Test
    fun hidesWhenForegroundPackageIsExcluded() {
        assertFalse(FloatingBallPolicy.shouldShow("com.example.game", excluded, false))
    }

    @Test
    fun showsWhenForegroundPackageIsNotExcluded() {
        assertTrue(FloatingBallPolicy.shouldShow("com.example.video", excluded, false))
    }

    @Test
    fun hidesWhileCaptureIsActiveEvenOutsideExcludedApps() {
        assertFalse(FloatingBallPolicy.shouldShow("com.example.video", excluded, true))
    }
}
