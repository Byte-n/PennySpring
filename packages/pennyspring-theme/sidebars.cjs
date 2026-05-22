/** @type {import('@docusaurus/plugin-content-docs').SidebarsConfig} */
const sidebars = {
  docs: [
    'index',
    {
      type: 'category',
      label: '指南',
      link: {
        type: 'doc',
        id: 'guide/index',
      },
      items: ['guide/usage'],
    },
    {
      type: 'category',
      label: 'Tokens',
      link: {
        type: 'doc',
        id: 'tokens/index',
      },
      items: ['tokens/preview'],
    },
    'api/index',
  ],
};

module.exports = sidebars;
