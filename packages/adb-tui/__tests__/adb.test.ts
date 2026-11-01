import { parseDeviceList, parseMdnsServices } from '../src/adb';

describe('parseDeviceList', () => {
  test('parses serial, state and -l metadata', () => {
    const raw = [
      'List of devices attached',
      'emulator-5554          device product:sdk model:Pixel_6 device:emu transport_id:1',
      '192.168.1.7:5555       device product:raven model:Pixel_6_Pro device:raven transport_id:2',
      'ABC123XYZ              unauthorized usb:1-1 transport_id:3',
    ].join('\n');

    const devices = parseDeviceList(raw);

    expect(devices).toEqual([
      {
        serial: 'emulator-5554',
        state: 'device',
        transport: 'emulator',
        product: 'sdk',
        model: 'Pixel_6',
      },
      {
        serial: '192.168.1.7:5555',
        state: 'device',
        transport: 'wifi',
        product: 'raven',
        model: 'Pixel_6_Pro',
      },
      {
        serial: 'ABC123XYZ',
        state: 'unauthorized',
        transport: 'usb',
        product: undefined,
        model: undefined,
      },
    ]);
  });

  test('returns an empty list when no devices are attached', () => {
    expect(parseDeviceList('List of devices attached\n')).toEqual([]);
  });
});

describe('parseMdnsServices', () => {
  test('splits pairing and connect services and dedupes', () => {
    const raw = [
      'adb-XXXX-aaaa._adb-tls-pairing._tcp.   192.168.1.7:37000',
      'adb-XXXX-aaaa._adb-tls-connect._tcp.   192.168.1.7:5555',
      'adb-XXXX-aaaa._adb-tls-connect._tcp.   192.168.1.7:5555',
    ].join('\n');

    const result = parseMdnsServices(raw);

    expect(result.pairing).toEqual([
      { host: '192.168.1.7', port: 37000, type: 'pairing' },
    ]);
    expect(result.connect).toEqual([
      { host: '192.168.1.7', port: 5555, type: 'connect' },
    ]);
  });

  test('returns empty buckets when nothing matches', () => {
    expect(parseMdnsServices('No mdns services found')).toEqual({
      pairing: [],
      connect: [],
    });
  });
});
