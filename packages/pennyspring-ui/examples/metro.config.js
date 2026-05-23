const path = require('path');
const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');

const projectRoot = __dirname;
const monorepoRoot = path.resolve(projectRoot, '../../..');
const defaultConfig = getDefaultConfig(projectRoot);

const config = {
  projectRoot,
  watchFolders: [monorepoRoot],
  resolver: {
    blockList: [/\/\.worktrees\/.*/],
    extraNodeModules: new Proxy(
      {},
      {
        get: (_, name) => path.join(monorepoRoot, 'node_modules', name),
      },
    ),
  },
};

module.exports = mergeConfig(defaultConfig, config);
