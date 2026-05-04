#!/usr/bin/env node
const { spawn, execSync } = require('child_process');
const inquirer = require('inquirer');
const ora = require('ora');

function sh(cmd) {
  try { return execSync(cmd, { encoding: 'utf8', timeout: 15000 }).trim(); }
  catch { return ''; }
}

if (!sh('which adb')) {
  console.error('adb not found in PATH.');
  process.exit(1);
}

// ── discover: spawn adb mdns services, collect 5s ──────────
function discover() {
  return new Promise((resolve) => {
    const child = spawn('adb', ['mdns', 'services'], { stdio: ['ignore', 'pipe', 'pipe'] });
    let out = '';
    child.stdout.on('data', d => { out += d.toString(); });
    child.stderr.on('data', d => { out += d.toString(); });
    setTimeout(() => { child.kill(); resolve(out); }, 5000);
  });
}

function parseDevices(raw) {
  const lines = raw.split('\n').map(l => l.trim()).filter(Boolean);
  const pairing = [];
  const connect  = [];
  const ipRe = /(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}):(\d+)/;

  for (const line of lines) {
    const m = line.match(ipRe);
    if (!m) continue;

    const entry = { host: m[1], port: m[2] };

    if (line.includes('adb-tls-pairing')) {
      pairing.push(entry);
    } else if (line.includes('adb-tls-connect')) {
      connect.push(entry);
    }
  }

  const dedupe = (arr) => {
    const seen = new Set();
    return arr.filter(d => {
      const k = `${d.host}:${d.port}`;
      if (seen.has(k)) return false;
      seen.add(k);
      return true;
    });
  };

  return { pairing: dedupe(pairing), connect: dedupe(connect) };
}

// ── main menu ──────────────────────────────────────────────
async function mainMenu() {
  const { action } = await inquirer.prompt([
    {
      type: 'list',
      name: 'action',
      message: 'ADB Wireless Debug Manager',
      choices: [
        { name: '🔑  Pair new device',       value: 'pair' },
        { name: '🔍  Discover & connect',     value: 'discover' },
        { name: '📋  List connected devices', value: 'list' },
        new inquirer.Separator(),
        { name: '👋  Quit', value: 'quit' },
      ],
      pageSize: 6,
    },
  ]);

  switch (action) {
    case 'pair':     await pairFlow(); break;
    case 'discover': await discoverFlow(); break;
    case 'list':     await listDevices(); break;
    case 'quit':     console.log('Bye.'); process.exit(0);
  }
}

// ── pair flow ─────────────────────────────────────────────
async function pairFlow() {
  const spinner = ora('Scanning for devices in pairing mode...').start();
  const raw = await discover();
  spinner.stop();

  const { pairing, connect } = parseDevices(raw);

  if (pairing.length === 0 && connect.length === 0) {
    console.log('No devices found.');
    console.log('Open Settings → Developer Options → Wireless debugging → Pair device with pairing code\n');
    return mainMenu();
  }

  let host, pairPort;

  if (pairing.length > 0) {
    // Found devices in pairing mode — just pick one, no manual IP/port
    const choices = pairing.map((d, i) => ({
      name: `${d.host}:${d.port}`,
      value: i,
    }));
    choices.push(new inquirer.Separator());
    choices.push({ name: '← Back to menu', value: -1 });

    const { target } = await inquirer.prompt([
      {
        type: 'list',
        name: 'target',
        message: 'Select a device to pair:',
        choices,
        pageSize: 10,
      },
    ]);

    if (target === -1) return mainMenu();
    host = pairing[target].host;
    pairPort = pairing[target].port;
  } else {
    // No pairing services, but connect services exist — use IP from connect, still need pairing port
    console.log('No devices in pairing mode found.');
    console.log('Open the pairing dialog on your Android device first.\n');

    const choices = connect.map((d, i) => ({
      name: `${d.host}:${d.port}`,
      value: i,
    }));
    choices.push(new inquirer.Separator());
    choices.push({ name: '← Back to menu', value: -1 });

    const { target } = await inquirer.prompt([
      {
        type: 'list',
        name: 'target',
        message: 'Select device (IP will be reused):',
        choices,
        pageSize: 10,
      },
    ]);

    if (target === -1) return mainMenu();
    host = connect[target].host;

    const { port } = await inquirer.prompt([
      {
        type: 'input',
        name: 'port',
        message: 'Pairing port (shown on device):',
        validate: v => /^\d+$/.test(v) ? true : 'Enter a valid port number',
      },
    ]);
    pairPort = port;
  }

  // Only ask for pairing code — never IP/port if device was in pairing mode
  const { code } = await inquirer.prompt([
    {
      type: 'input',
      name: 'code',
      message: '6-digit pairing code:',
      validate: v => /^\d{6}$/.test(v) ? true : 'Enter exactly 6 digits',
    },
  ]);

  const spinner2 = ora(`Pairing adb pair ${host}:${pairPort} ${code}`).start();
  const result = sh(`adb pair ${host}:${pairPort} ${code}`);
  spinner2.stop();

  console.log(result || '(no output)');

  if (result.includes('Successfully paired')) {
    // Check if same IP has a connect service we can use
    const connectEntry = connect.find(c => c.host === host);
    if (connectEntry) {
      const spinner3 = ora(`Auto-connecting ${host}:${connectEntry.port}`).start();
      console.log(sh(`adb connect ${host}:${connectEntry.port}`) || '(no output)');
      spinner3.stop();
    } else {
      const { connectPort } = await inquirer.prompt([
        {
          type: 'input',
          name: 'connectPort',
          message: 'Connect port (shown on device):',
          validate: v => /^\d+$/.test(v) ? true : 'Enter a valid port number',
        },
      ]);
      const spinner3 = ora(`Connecting ${host}:${connectPort}`).start();
      console.log(sh(`adb connect ${host}:${connectPort}`) || '(no output)');
      spinner3.stop();
    }
  }

  mainMenu();
}

// ── discover & connect flow ───────────────────────────────
async function discoverFlow() {
  const spinner = ora('Scanning for wireless debugging devices...').start();
  const raw = await discover();
  spinner.stop();

  const { connect } = parseDevices(raw);

  if (connect.length === 0) {
    console.log('No devices found. Make sure wireless debugging is enabled.\n');
    return mainMenu();
  }

  const { target } = await inquirer.prompt([
    {
      type: 'list',
      name: 'target',
      message: 'Select a device to connect:',
      choices: [
        ...connect.map((d, i) => ({
          name: `${d.host}:${d.port}`,
          value: i,
        })),
        new inquirer.Separator(),
        { name: '← Back to menu', value: -1 },
      ],
      pageSize: 10,
    },
  ]);

  if (target === -1) return mainMenu();

  const d = connect[target];
  const spinner2 = ora(`Connecting ${d.host}:${d.port}`).start();
  const result = sh(`adb connect ${d.host}:${d.port}`);
  spinner2.stop();

  console.log(result || '(no output)');

  mainMenu();
}

// ── list devices ──────────────────────────────────────────
function listDevices() {
  const result = sh('adb devices -l');
  console.log('\n' + (result || 'No devices.'));
  mainMenu();
}

// ── entry ─────────────────────────────────────────────────
mainMenu().catch(e => {
  console.error('Error:', e.message);
  process.exit(1);
});
