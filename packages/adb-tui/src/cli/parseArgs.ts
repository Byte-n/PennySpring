export type ParsedCommand =
  | { command: 'tui' }
  | { command: 'devices' }
  | { command: 'wifi:scan' }
  | { command: 'wifi:pair' }
  | { command: 'wifi:connect' }
  | { command: 'db:watch'; serial?: string; once?: boolean }
  | { command: 'unknown'; raw: string }

function getFlag(args: readonly string[], name: string): string | undefined {
  const index = args.indexOf(name)
  return index >= 0 ? args[index + 1] : undefined
}

export function parseArgs(argv: readonly string[]): ParsedCommand {
  const [head, sub] = argv

  if (!head) {
    return { command: 'tui' }
  }
  if (head === 'devices') {
    return { command: 'devices' }
  }
  if (head === 'wifi' && (sub === 'scan' || sub === 'pair' || sub === 'connect')) {
    return { command: `wifi:${sub}` }
  }
  if (head === 'db' && sub === 'watch') {
    const rest = argv.slice(2)
    return { command: 'db:watch', serial: getFlag(rest, '--serial'), once: rest.includes('--once') }
  }

  return { command: 'unknown', raw: argv.join(' ') }
}
