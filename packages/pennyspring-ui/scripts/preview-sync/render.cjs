const path = require('node:path');
const {
  DOC_COMPONENTS_DIR,
  DOC_ID_PREFIX,
  GENERATED_DOC_MARKER,
  GENERATED_SIDEBARS_MARKER,
  GENERATED_SOURCE_MARKER,
  REGISTRY_PATH,
  SIDEBARS_PATH,
  quote,
} = require('./shared.cjs');

function renderDemosIndex(component) {
  const lines = [GENERATED_SOURCE_MARKER];

  component.demos.forEach((demo, index) => {
    lines.push(`import Demo${index} from './${demo.id}';`);
  });

  lines.push('', `export const ${component.demosExportName} = [`);

  component.demos.forEach((demo, index) => {
    const fields = [`id: ${quote(demo.id)}`, `title: ${quote(demo.title)}`];

    if (demo.description !== undefined) {
      fields.push(`description: ${quote(demo.description)}`);
    }

    fields.push(`Component: Demo${index}`);
    lines.push(`  { ${fields.join(', ')} },`);
  });

  lines.push('];', '');
  return lines.join('\n');
}

function renderDemoItems(sections) {
  const lines = ['const DEMO_PREVIEW_ITEMS = ['];

  for (const section of sections) {
    for (const component of section.components) {
      lines.push(
        `  ...createDemoPreviewItems(${quote(
          component.id,
        )}, ${quote(component.title)}, ${component.demosExportName}),`,
      );
    }
  }

  lines.push('] satisfies ComponentPreviewItem[];', '');
  return lines;
}

function renderPreviewSections(sections) {
  const lines = ['export const COMPONENT_PREVIEW_SECTIONS = ['];

  for (const section of sections) {
    lines.push(
      '  {',
      `    id: ${quote(section.id)},`,
      `    title: ${quote(section.title)},`,
      '    items: [',
    );

    for (const component of section.components) {
      lines.push(
        '      {',
        `        id: ${quote(component.id)},`,
        `        title: ${quote(component.title)},`,
        `        description: ${quote(component.description)},`,
        `        component: ${component.aggregateName},`,
        '      },',
      );
    }

    lines.push('    ],', '  },');
  }

  lines.push('] satisfies readonly ComponentPreviewSection[];', '');
  return lines;
}

function renderRegistryFunctions() {
  return [
    'export function getComponentPreviewById(',
    '  previewId: string,',
    "): ComponentPreviewSection['items'][number] | undefined {",
    '  const previewItems = [',
    '    ...COMPONENT_PREVIEW_SECTIONS.flatMap(section => section.items),',
    '    ...DEMO_PREVIEW_ITEMS,',
    '  ];',
    '',
    '  return previewItems.find(item => item.id === previewId);',
    '}',
    '',
    'export function getComponentDemoPreviewsByComponentId(',
    '  componentId: string,',
    '): ComponentPreviewItem[] {',
    '  const demoPrefix = `${componentId}/`;',
    '',
    '  return DEMO_PREVIEW_ITEMS.filter(item => item.id.startsWith(demoPrefix));',
    '}',
    '',
  ];
}

function renderRegistryHelper() {
  return [
    'interface ComponentDemoPreview {',
    '  id: string;',
    '  title: string;',
    '  description?: string;',
    '  Component: ComponentType;',
    '}',
    '',
    'function createDemoPreviewItems(',
    '  componentId: string,',
    '  componentTitle: string,',
    '  demos: readonly ComponentDemoPreview[],',
    '): ComponentPreviewItem[] {',
    '  return demos.map(({ Component, description, id, title }) => {',
    '    function DemoPreview() {',
    '      return (',
    '        <PreviewScaffold>',
    '          <PreviewSection title={title}>',
    '            <Component />',
    '          </PreviewSection>',
    '        </PreviewScaffold>',
    '      );',
    '    }',
    '',
    '    return {',
    '      id: `${componentId}/${id}`,',
    '      title: `${componentTitle} / ${title}`,',
    '      description: description ?? title,',
    '      component: DemoPreview,',
    '    };',
    '  });',
    '}',
    '',
  ];
}

function renderRegistry(sections) {
  const lines = [
    GENERATED_SOURCE_MARKER,
    "import React from 'react';",
    "import { PreviewScaffold, PreviewSection } from './PreviewScaffold';",
  ];

  for (const section of sections) {
    for (const component of section.components) {
      lines.push(
        `import ${component.aggregateName} from './${section.id}/${component.id}';`,
      );
      lines.push(
        `import { ${component.demosExportName} } from './${section.id}/${component.id}/demos';`,
      );
    }
  }

  lines.push(
    '',
    "import type { ComponentType } from 'react';",
    'import type {',
    '  ComponentPreviewItem,',
    '  ComponentPreviewSection,',
    "} from './types';",
    '',
    ...renderRegistryHelper(),
    ...renderDemoItems(sections),
    ...renderPreviewSections(sections),
    ...renderRegistryFunctions(),
  );

  return lines.join('\n');
}

function renderDoc(component) {
  const title = JSON.stringify(component.title);

  return [
    '---',
    `title: ${title}`,
    `sidebar_label: ${title}`,
    `description: ${JSON.stringify(component.description)}`,
    'hide_title: true',
    '---',
    GENERATED_DOC_MARKER,
    '',
    `<PreviewDocIntro id="${component.id}" />`,
    '',
    `<PreviewDocs id="${component.id}" />`,
    '',
  ].join('\n');
}

function renderSidebars(sections) {
  const componentSidebarItems = sections.map(section => ({
    type: 'category',
    label: section.title,
    items: section.components.map(component => component.docId),
  }));

  return `${GENERATED_SIDEBARS_MARKER}\nmodule.exports = ${JSON.stringify(
    { componentSidebarItems },
    null,
    2,
  )};\n`;
}

function getDocFilePath(docId) {
  return path.join(
    DOC_COMPONENTS_DIR,
    `${docId.slice(DOC_ID_PREFIX.length)}.mdx`,
  );
}

function getDemosFilePath(component) {
  return path.join(path.dirname(component.entryPath), 'demos/index.ts');
}

function buildExpectedFiles(sections) {
  const expected = new Map();

  expected.set(REGISTRY_PATH, renderRegistry(sections));
  expected.set(SIDEBARS_PATH, renderSidebars(sections));

  for (const section of sections) {
    for (const component of section.components) {
      expected.set(getDemosFilePath(component), renderDemosIndex(component));
      expected.set(getDocFilePath(component.docId), renderDoc(component));
    }
  }

  return expected;
}

module.exports = {
  buildExpectedFiles,
};
