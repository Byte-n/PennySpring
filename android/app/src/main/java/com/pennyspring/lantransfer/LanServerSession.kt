package com.pennyspring.lantransfer

import java.io.Closeable
import java.io.IOException
import java.net.ServerSocket
import java.net.Socket
import java.net.SocketTimeoutException
import java.util.concurrent.ConcurrentHashMap
import java.util.concurrent.CountDownLatch
import java.util.concurrent.RejectedExecutionException
import java.util.concurrent.SynchronousQueue
import java.util.concurrent.ThreadFactory
import java.util.concurrent.ThreadPoolExecutor
import java.util.concurrent.TimeUnit
import java.util.concurrent.atomic.AtomicBoolean

internal data class LanSessionInfo(
    val id: String,
    val name: String,
    val nonce: String,
    val port: Int,
)

internal class LanServerSession(
    private val serverSocket: ServerSocket,
    val info: LanSessionInfo,
    private val timeoutMs: Long,
    private val handler: (LanServerSession, Socket) -> Unit,
    private val listener: (LanServerSession, FinishReason) -> Unit,
) : Closeable {
    internal sealed interface FinishReason {
        data object Stopped : FinishReason

        data object TimedOut : FinishReason

        data class Failed(
            val error: Throwable,
        ) : FinishReason
    }

    companion object {
        private const val ACCEPT_POLL_MS = 1000
        private const val MAX_CLIENT_THREADS = 4
        private const val CLIENT_IDLE_SECONDS = 30L
    }

    private val isClosed = AtomicBoolean(false)
    private val isFinished = AtomicBoolean(false)
    private val isStarted = AtomicBoolean(false)
    private val finished = CountDownLatch(1)
    private val clients = ConcurrentHashMap.newKeySet<Socket>()
    private val clientExecutor =
        ThreadPoolExecutor(
            0,
            MAX_CLIENT_THREADS,
            CLIENT_IDLE_SECONDS,
            TimeUnit.SECONDS,
            SynchronousQueue(),
            ThreadFactory { runnable ->
                Thread(runnable, "PennySpringLanClient").apply { isDaemon = true }
            },
        )
    private val acceptThread =
        Thread({ acceptLoop() }, "PennySpringLanAccept").apply { isDaemon = true }

    init {
        serverSocket.soTimeout = ACCEPT_POLL_MS
    }

    fun start() {
        if (isStarted.compareAndSet(false, true)) {
            acceptThread.start()
        }
    }

    override fun close() {
        if (!isClosed.compareAndSet(false, true)) return
        closeServerSocket()
        closeClients()
        clientExecutor.shutdown()
        if (!isStarted.get()) {
            finish(FinishReason.Stopped)
        }
    }

    internal fun awaitFinished(timeoutMs: Long): Boolean = finished.await(timeoutMs, TimeUnit.MILLISECONDS)

    private fun acceptLoop() {
        var reason: FinishReason = FinishReason.Stopped
        try {
            val deadline = System.currentTimeMillis() + timeoutMs
            while (!isClosed.get()) {
                if (System.currentTimeMillis() >= deadline) {
                    reason = FinishReason.TimedOut
                    break
                }
                val client =
                    try {
                        serverSocket.accept()
                    } catch (_: SocketTimeoutException) {
                        continue
                    } catch (error: IOException) {
                        if (!isClosed.get()) {
                            reason = FinishReason.Failed(error)
                        }
                        break
                    }
                dispatch(client)
            }
        } catch (error: Throwable) {
            if (!isClosed.get()) {
                reason = FinishReason.Failed(error)
            }
        } finally {
            finish(reason)
        }
    }

    private fun dispatch(client: Socket) {
        if (isClosed.get()) {
            closeQuietly(client)
            return
        }
        clients.add(client)
        if (isClosed.get()) {
            clients.remove(client)
            closeQuietly(client)
            return
        }
        try {
            clientExecutor.execute { handleClient(client) }
        } catch (_: RejectedExecutionException) {
            clients.remove(client)
            closeQuietly(client)
        }
    }

    private fun handleClient(client: Socket) {
        try {
            handler(this, client)
        } catch (_: Throwable) {
            // 单个连接失败不能终止服务端线程。
        } finally {
            clients.remove(client)
            closeQuietly(client)
        }
    }

    private fun finish(reason: FinishReason) {
        if (!isFinished.compareAndSet(false, true)) return
        isClosed.set(true)
        closeServerSocket()
        closeClients()
        clientExecutor.shutdown()
        try {
            listener(this, reason)
        } catch (_: Throwable) {
            // 会话已结束，回调异常不再向外传播。
        }
        finished.countDown()
    }

    private fun closeServerSocket() {
        try {
            serverSocket.close()
        } catch (_: IOException) {
            // 已关闭。
        }
    }

    private fun closeClients() {
        clients.forEach { closeQuietly(it) }
        clients.clear()
    }

    private fun closeQuietly(socket: Socket) {
        try {
            socket.close()
        } catch (_: IOException) {
            // 已关闭。
        }
    }
}
