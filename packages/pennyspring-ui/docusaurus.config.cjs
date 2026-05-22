const path = require('node:path');
const webpack = require('webpack');
const { themes: prismThemes } = require('prism-react-renderer');

const repoRoot = path.resolve(__dirname, '../..');

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: 'PennySpring UI',
  tagline: 'PennySpring React Native 组件库',
  favicon: 'img/favicon.ico',

  url: 'https://byte-n.github.io',
  baseUrl: process.env.NODE_ENV === 'production' ? '/pennyspring-ui/' : '/',
  organizationName: 'Byte-n',
  projectName: 'pennyspring-ui',
  trailingSlash: false,

  onBrokenLinks: 'throw',
  markdown: {
    hooks: {
      onBrokenMarkdownLinks: 'warn',
    },
  },
  i18n: {
    defaultLocale: 'zh-CN',
    locales: ['zh-CN'],
  },
  customFields: {
    liveCodeBlock: {
      defaultCollapsed: false,
    },
  },

  presets: [
    [
      'classic',
      {
        docs: {
          routeBasePath: '/',
          sidebarPath: require.resolve('./sidebars.cjs'),
          showLastUpdateTime: true,
        },
        blog: false,
        theme: {
          customCss: path.resolve(__dirname, 'docs-site/custom.css'),
        },
      },
    ],
  ],

  plugins: [
    '@docusaurus/theme-live-codeblock',
    function reactNativeWebPlugin() {
      return {
        name: 'pennyspring-ui-react-native-web',
        configureWebpack(config, isServer, { getJSLoader }) {
          config.resolve?.extensions?.unshift('.web.js', '.web.ts', '.web.tsx');

          return {
            resolve: {
              alias: {
                '@pennyspring/data$': path.resolve(repoRoot, 'packages/data/src/constants'),
                '@pennyspring/data': path.resolve(repoRoot, 'packages/data/src/constants'),
                '@pennyspring/theme': path.resolve(repoRoot, 'packages/pennyspring-theme/src'),
                '@pennyspring/ui': path.resolve(__dirname, 'src'),
                'react-native$': 'react-native-web',
              },
            },
            module: {
              rules: [
                {
                  test: /\.m?js$/,
                  resolve: {
                    fullySpecified: false,
                  },
                },
                {
                  test: /\.sql$/,
                  type: 'asset/source',
                },
                {
                  test: /\.js$/,
                  include: path.resolve(__dirname, '.docusaurus'),
                  type: 'javascript/auto',
                },
                {
                  test: /\.(j|t)sx?$/,
                  include: [
                    path.resolve(__dirname, 'src'),
                    path.resolve(__dirname, 'examples'),
                    path.resolve(__dirname, 'docs-site'),
                    path.resolve(repoRoot, 'packages/pennyspring-theme/src'),
                    path.resolve(repoRoot, 'src/constants'),
                  ],
                  use: [
                    getJSLoader({
                      isServer,
                      babelOptions: {
                        plugins: ['react-native-web'],
                        presets: [
                          [
                            'module:@react-native/babel-preset',
                            {
                              disableImportExportTransform: true,
                            },
                          ],
                        ],
                      },
                    }),
                  ],
                },
              ],
            },
            plugins: [
              new webpack.DefinePlugin({
                __DEV__: JSON.stringify(false),
              }),
            ],
          };
        },
      };
    },
  ],

  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      navbar: {
        title: 'PennySpring UI',
        items: [
          { to: '/guide', label: '指南', position: 'left' },
          { to: '/components/foundation/button', label: '组件', position: 'left' },
          { to: '/api', label: 'API', position: 'left' },
        ],
      },
      footer: {
        style: 'dark',
        links: [
          {
            title: '文档',
            items: [
              { label: '指南', to: '/guide' },
              { label: '组件', to: '/components/foundation/button' },
              { label: 'API', to: '/api' },
            ],
          },
        ],
        copyright: `Copyright © ${new Date().getFullYear()} Byte-n.`,
      },
      prism: {
        theme: prismThemes.github,
        darkTheme: prismThemes.dracula,
        additionalLanguages: ['bash', 'typescript', 'tsx'],
      },
    }),
};

module.exports = config;
