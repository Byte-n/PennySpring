const path = require('node:path');
const webpack = require('webpack');
const { themes: prismThemes } = require('prism-react-renderer');

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: 'PennySpring Theme',
  tagline: 'PennySpring 主题 token 与算法',
  favicon: 'img/favicon.ico',

  url: 'https://byte-n.github.io',
  baseUrl: process.env.NODE_ENV === 'production' ? '/pennyspring-theme/' : '/',
  organizationName: 'Byte-n',
  projectName: 'pennyspring-theme',
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
        name: 'pennyspring-theme-react-native-web',
        configureWebpack(config, isServer, { getJSLoader }) {
          config.resolve?.extensions?.unshift('.web.js', '.web.ts', '.web.tsx');

          return {
            resolve: {
              alias: {
                '@pennyspring/theme': path.resolve(__dirname, 'src'),
                'react-native$': 'react-native-web',
              },
            },
            module: {
              rules: [
                {
                  test: /\.js$/,
                  include: path.resolve(__dirname, '.docusaurus'),
                  type: 'javascript/auto',
                },
                {
                  test: /\.(j|t)sx?$/,
                  include: [
                    path.resolve(__dirname, 'src'),
                    path.resolve(__dirname, 'docs-site'),
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
        title: 'PennySpring Theme',
        items: [
          { to: '/guide', label: '指南', position: 'left' },
          { to: '/tokens', label: 'Tokens', position: 'left' },
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
              { label: 'Tokens', to: '/tokens' },
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
