const { componentSidebarItems } = require('./sidebars.generated.cjs');

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
      items: ['guide/migration'],
    },
    {
      type: 'category',
      label: '组件',
      items: componentSidebarItems,
    },
    'api/index',
    'changelogs/index',
  ],
};

module.exports = sidebars;
