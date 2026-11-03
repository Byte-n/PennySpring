package com.pennyspring.lantransfer

import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertTrue
import org.junit.Test
import java.io.IOException
import java.net.InetSocketAddress
import java.net.ServerSocket
import java.net.Socket
import java.util.concurrent.CountDownLatch
import java.util.concurrent.TimeUnit
import java.util.concurrent.atomic.AtomicInteger
import java.util.concurrent.atomic.AtomicReference

class LanServerSessionTest {
    @Test
    fun closeStopsAcceptLoopWithStoppedReason() {
        val finished = CountDownLatch(1)
        val reasonRef = AtomicReference<LanServerSession.FinishReason?>(null)
        val session =
            startSession(
                listener = { _, reason ->
                    reasonRef.set(reason)
                    finished.countDown()
                },
            )

        session.close()

        assertTrue(finished.await(2, TimeUnit.SECONDS))
        assertEquals(LanServerSession.FinishReason.Stopped, reasonRef.get())
        assertTrue(session.awaitFinished(2_000))
    }

    @Test
    fun closeReleasesBlockedClientHandler() {
        val handlerEntered = CountDownLatch(1)
        val handlerReleased = CountDownLatch(1)
        val session =
            startSession(
                handler = { _, client ->
                    handlerEntered.countDown()
                    try {
                        client.getInputStream().read()
                    } catch (_: IOException) {
                        // 会话关闭会中断阻塞读取。
                    } finally {
                        handlerReleased.countDown()
                    }
                },
            )
        val client = connect(session.info.port)
        assertTrue(handlerEntered.await(2, TimeUnit.SECONDS))

        session.close()

        assertTrue(handlerReleased.await(2, TimeUnit.SECONDS))
        client.close()
    }

    @Test
    fun keepsServingWhenHandlerThrows() {
        val handled = CountDownLatch(2)
        val session =
            startSession(
                handler = { _, _ ->
                    handled.countDown()
                    throw IllegalStateException("boom")
                },
            )

        connect(session.info.port).close()
        connect(session.info.port).close()

        assertTrue(handled.await(2, TimeUnit.SECONDS))
        assertFalse(session.awaitFinished(100))
        session.close()
    }

    @Test
    fun timeoutFinishesSession() {
        val finished = CountDownLatch(1)
        val reasonRef = AtomicReference<LanServerSession.FinishReason?>(null)
        val session =
            startSession(
                timeoutMs = 100,
                listener = { _, reason ->
                    reasonRef.set(reason)
                    finished.countDown()
                },
            )

        assertTrue(finished.await(3, TimeUnit.SECONDS))
        assertEquals(LanServerSession.FinishReason.TimedOut, reasonRef.get())
        assertTrue(session.awaitFinished(500))
    }

    @Test
    fun closeNotifiesListenerOnlyOnce() {
        val notifications = AtomicInteger(0)
        val finished = CountDownLatch(1)
        val session =
            startSession(
                listener = { _, _ ->
                    notifications.incrementAndGet()
                    finished.countDown()
                },
            )

        session.close()
        session.close()

        assertTrue(finished.await(2, TimeUnit.SECONDS))
        assertEquals(1, notifications.get())
    }

    private fun startSession(
        timeoutMs: Long = 10_000,
        handler: (LanServerSession, Socket) -> Unit = { _, _ -> },
        listener: (LanServerSession, LanServerSession.FinishReason) -> Unit = { _, _ -> },
    ): LanServerSession {
        val socket =
            ServerSocket().apply {
                reuseAddress = true
                bind(InetSocketAddress("127.0.0.1", 0))
            }
        val session =
            LanServerSession(
                serverSocket = socket,
                info =
                    LanSessionInfo(
                        id = "test-session",
                        name = "测试设备",
                        nonce = "test-nonce",
                        port = socket.localPort,
                    ),
                timeoutMs = timeoutMs,
                handler = handler,
                listener = listener,
            )
        session.start()
        return session
    }

    private fun connect(port: Int): Socket =
        Socket().apply {
            connect(InetSocketAddress("127.0.0.1", port), 2_000)
        }
}
