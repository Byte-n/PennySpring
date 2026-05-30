#!/usr/bin/env node
const { spawn } = require('node:child_process')
const { join } = require('node:path')

const tsx = require.resolve('tsx/cli')
const entry = join(__dirname, '..', 'src', 'cli', 'main.ts')

const child = spawn(process.execPath, [tsx, entry, ...process.argv.slice(2)], { stdio: 'inherit' })
child.on('exit', code => process.exit(code ?? 0))
