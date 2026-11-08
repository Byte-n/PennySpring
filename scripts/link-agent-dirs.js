#!/usr/bin/env node

const { lstat, readlink, symlink, unlink } = require('node:fs/promises');
const path = require('node:path');

const PROJECT_ROOT = path.resolve(__dirname, '..');
const AGENTS_DIR = '.agents';
const LINK_NAMES = ['.claude', '.qoder'];

/**
 * @param {string} name
 */
async function ensureLink(name) {
  const linkPath = path.join(PROJECT_ROOT, name);

  try {
    const stats = await lstat(linkPath);
    if (!stats.isSymbolicLink()) {
      console.warn(`[link-agent-dirs] ${name} 已存在且不是软链接，跳过`);
      return;
    }
    if ((await readlink(linkPath)) === AGENTS_DIR) {
      return;
    }
    await unlink(linkPath);
  } catch (error) {
    if (error.code !== 'ENOENT') {
      throw error;
    }
  }

  await symlink(AGENTS_DIR, linkPath, 'dir');
  console.log(`[link-agent-dirs] ${name} -> ${AGENTS_DIR}`);
}

async function main() {
  for (const name of LINK_NAMES) {
    await ensureLink(name);
  }
}

main().catch(error => {
  console.error('[link-agent-dirs] 创建软链接失败', error);
  process.exitCode = 1;
});
