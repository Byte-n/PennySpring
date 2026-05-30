const { spawn } = require('node:child_process')
const { createWriteStream } = require('node:fs')
const { parentPort, workerData } = require('node:worker_threads')

let isStopped = false
let timer = undefined
let lastMtime = null

parentPort?.on('message', message => {
  if (message === 'stop') {
    stop()
  }
})

watch().catch(error => {
  parentPort?.postMessage({ type: 'error', message: getErrorMessage(error) })
})

async function watch() {
  while (!isStopped) {
    if (await tick()) {
      parentPort?.postMessage({ type: 'pull' })
    }
    await delay(workerData.intervalMs)
  }
}

async function tick() {
  const mtime = await readMtime()
  if (!mtime || mtime === lastMtime) {
    return false
  }
  await pull()
  lastMtime = mtime
  return true
}

function readMtime() {
  return runAdb([
    '-s',
    workerData.serial,
    'shell',
    'run-as',
    workerData.packageName,
    'stat',
    '-c',
    '%Y',
    workerData.remoteDb,
  ]).then(output => output.trim() || null)
}

function pull() {
  return new Promise((resolve, reject) => {
    const child = spawn(
      workerData.adbPath,
      ['-s', workerData.serial, 'shell', 'run-as', workerData.packageName, 'cat', workerData.remoteDb],
      { stdio: ['ignore', 'pipe', 'pipe'] },
    )
    let stderr = ''
    child.stderr.on('data', chunk => {
      stderr += chunk.toString()
    })
    child.stdout.pipe(createWriteStream(workerData.localDb))
    child.on('error', reject)
    child.on('close', code => {
      if (code === 0) {
        resolve()
        return
      }
      reject(new Error(stderr.trim() || 'run-as denied'))
    })
  })
}

function runAdb(args) {
  return new Promise((resolve, reject) => {
    const child = spawn(workerData.adbPath, args, { stdio: ['ignore', 'pipe', 'pipe'] })
    let stdout = ''
    let stderr = ''
    child.stdout.on('data', chunk => {
      stdout += chunk.toString()
    })
    child.stderr.on('data', chunk => {
      stderr += chunk.toString()
    })
    child.on('error', reject)
    child.on('close', code => {
      if (code === 0) {
        resolve(stdout)
        return
      }
      reject(new Error(stderr.trim() || stdout.trim() || 'adb command failed'))
    })
  })
}

function delay(ms) {
  return new Promise(resolve => {
    timer = setTimeout(() => {
      timer = undefined
      resolve()
    }, ms)
  })
}

function stop() {
  isStopped = true
  if (timer) {
    clearTimeout(timer)
    timer = undefined
  }
}

function getErrorMessage(error) {
  return error instanceof Error ? error.message : '未知错误'
}
