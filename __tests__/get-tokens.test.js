const path = require('node:path');
const { spawnSync } = require('node:child_process');

const scriptPath = path.resolve(__dirname, '../.claude/skills/theme-tokens/scripts/get-tokens.js');

function runGetTokens(args) {
  return spawnSync('node', [scriptPath, ...args], {
    cwd: path.resolve(__dirname, '..'),
    encoding: 'utf8',
  });
}

describe('scripts/get-tokens', () => {
  it('prints help and exits with code 0 for --help', () => {
    const result = runGetTokens(['--help']);

    expect(result.status).toBe(0);
    expect(result.stdout).toContain('Usage:');
    expect(result.stdout).toContain('get-tokens.js');
  });

  it('returns single token value in text mode', () => {
    const result = runGetTokens(['colorPrimary']);

    expect(result.status).toBe(0);
    expect(result.stdout.trim()).toBe('colorPrimary=#1677ff');
  });

  it('returns multiple token values in text mode', () => {
    const result = runGetTokens(['colorPrimary', 'paddingSM']);

    expect(result.status).toBe(0);
    expect(result.stdout.trim()).toBe('colorPrimary=#1677ff\npaddingSM=12');
  });

  it('returns JSON output when --json is provided', () => {
    const result = runGetTokens(['--json', 'colorPrimary', 'paddingSM']);

    expect(result.status).toBe(0);
    expect(JSON.parse(result.stdout)).toEqual({
      colorPrimary: '#1677ff',
      paddingSM: 12,
    });
  });

  it('fails with helpful error for unknown token', () => {
    const result = runGetTokens(['notExistsToken']);

    expect(result.status).toBe(1);
    expect(result.stderr).toContain('Unknown token path: notExistsToken');
  });
});
