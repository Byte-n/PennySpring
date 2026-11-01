import { parseArgs } from '../src/cli/parseArgs';

describe('parseArgs', () => {
  test('defaults to the tui command with no args', () => {
    expect(parseArgs([])).toEqual({ command: 'tui' });
  });

  test('routes devices', () => {
    expect(parseArgs(['devices'])).toEqual({ command: 'devices' });
  });

  test('routes wifi subcommands', () => {
    expect(parseArgs(['wifi', 'scan'])).toEqual({ command: 'wifi:scan' });
    expect(parseArgs(['wifi', 'pair'])).toEqual({ command: 'wifi:pair' });
    expect(parseArgs(['wifi', 'connect'])).toEqual({ command: 'wifi:connect' });
  });

  test('routes db watch with optional flags', () => {
    expect(
      parseArgs(['db', 'watch', '--serial', 'emulator-5554', '--once']),
    ).toEqual({
      command: 'db:watch',
      serial: 'emulator-5554',
      once: true,
    });
  });

  test('reports unknown commands', () => {
    expect(parseArgs(['bogus'])).toEqual({ command: 'unknown', raw: 'bogus' });
  });
});
