const path = require('path');
const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');

/**
 * Metro configuration
 * https://reactnative.dev/docs/metro
 *
 * @type {import('@react-native/metro-config').MetroConfig}
 */
const defaultConfig = getDefaultConfig(__dirname);
const { assetExts, sourceExts } = defaultConfig.resolver;

const config = {
  resolver: {
    // Exclude sibling git worktrees to avoid duplicate Haste package names.
    blockList: [/\.worktrees\/.*/],
    assetExts: assetExts.filter(ext => ext !== 'svg'),
    sourceExts: [...sourceExts, 'svg', 'cjs', 'mjs'],
    // DATA_MODE=remote 时把 @pennyspring/api 重定向到 ./remote（HTTP 客户端，不含 op-sqlite）；
    // 默认（local）走包入口 index.ts → ./local（api1）。SERVER_URL 运行期内联为 follow-up。
    resolveRequest: (context, moduleName, platform) => {
      if (moduleName === '@dr.pogodin/react-native-fs') {
        return context.resolveRequest(
          context,
          path.resolve(__dirname, 'src/shims/react-native-fs.ts'),
          platform,
        );
      }
      if (process.env.DATA_MODE === 'remote' && moduleName === '@pennyspring/api') {
        return context.resolveRequest(context, '@pennyspring/api/remote', platform);
      }
      return context.resolveRequest(context, moduleName, platform);
    },
  },
  transformer: {
    babelTransformerPath: require.resolve('react-native-svg-transformer'),
    getTransformOptions: async () => ({
      transform: {
        experimentalImportSupport: false,
        inlineRequires: true,
      },
    }),
  },
};

module.exports = mergeConfig(defaultConfig, config);
