import type {
  AdbDevice,
  DeviceState,
  DeviceTransport,
  MdnsScanResult,
  MdnsService,
} from './types';

const META_RE = /(\w+):(\S+)/g;
const IP_PORT_RE = /(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}):(\d+)/;

function toTransport(serial: string): DeviceTransport {
  if (serial.startsWith('emulator-')) {
    return 'emulator';
  }
  if (serial.includes(':')) {
    return 'wifi';
  }
  return 'usb';
}

function toState(token: string): DeviceState {
  if (token === 'device' || token === 'unauthorized' || token === 'offline') {
    return token;
  }
  return 'unknown';
}

export function parseDeviceList(raw: string): AdbDevice[] {
  return raw
    .split('\n')
    .map(line => line.trim())
    .filter(line => line && !line.startsWith('List of devices'))
    .map(line => {
      const [serial, stateToken, ...rest] = line.split(/\s+/);
      const meta = new Map<string, string>();
      for (const match of rest.join(' ').matchAll(META_RE)) {
        meta.set(match[1], match[2]);
      }
      return {
        serial,
        state: toState(stateToken),
        transport: toTransport(serial),
        product: meta.get('product'),
        model: meta.get('model'),
      };
    });
}

export function parseMdnsServices(raw: string): MdnsScanResult {
  const pairing: MdnsService[] = [];
  const connect: MdnsService[] = [];

  for (const line of raw.split('\n')) {
    const match = line.match(IP_PORT_RE);
    if (!match) {
      continue;
    }
    const service: MdnsService = {
      host: match[1],
      port: Number(match[2]),
      type: line.includes('adb-tls-pairing') ? 'pairing' : 'connect',
    };
    if (line.includes('adb-tls-pairing')) {
      pairing.push(service);
    } else if (line.includes('adb-tls-connect')) {
      connect.push(service);
    }
  }

  return { pairing: dedupe(pairing), connect: dedupe(connect) };
}

function dedupe(services: readonly MdnsService[]): MdnsService[] {
  const seen = new Set<string>();
  return services.filter(service => {
    const key = `${service.host}:${service.port}`;
    if (seen.has(key)) {
      return false;
    }
    seen.add(key);
    return true;
  });
}
