const fs = require('node:fs');
const path = require('node:path');
const {
  DOC_ID_PATTERN,
  DOC_ID_PREFIX,
  PREVIEWS_ROOT,
  assertId,
  fail,
  toDisplayPath,
} = require('./shared.cjs');
const {
  hasDefaultExport,
  parseSource,
  readPreviewMeta,
  readSections,
} = require('./meta.cjs');

function toPascalCase(value) {
  return value
    .split('-')
    .map(part => `${part.charAt(0).toUpperCase()}${part.slice(1)}`)
    .join('');
}

function toCamelCase(value) {
  const pascalCase = toPascalCase(value);
  return `${pascalCase.charAt(0).toLowerCase()}${pascalCase.slice(1)}`;
}

function readDemoFiles(demosDir) {
  if (!fs.existsSync(demosDir)) {
    fail(`缺少 demos 目录：${toDisplayPath(demosDir)}`);
  }

  const demoFiles = fs
    .readdirSync(demosDir, { withFileTypes: true })
    .filter(entry => entry.isFile() && entry.name.endsWith('.tsx'))
    .map(entry => entry.name)
    .sort();

  if (demoFiles.length === 0) {
    fail(`demos 目录下没有 demo 文件：${toDisplayPath(demosDir)}`);
  }

  for (const fileName of demoFiles) {
    const filePath = path.join(demosDir, fileName);

    if (!hasDefaultExport(parseSource(filePath))) {
      fail(`demo 文件必须 default export：${toDisplayPath(filePath)}`);
    }
  }

  return demoFiles;
}

function validateDemoFiles(componentId, meta, demoFiles, demosDir) {
  const fileIds = new Set(
    demoFiles.map(fileName => path.basename(fileName, '.tsx')),
  );
  const metaIds = new Set(meta.demos.map(demo => demo.id));

  for (const demo of meta.demos) {
    if (!fileIds.has(demo.id)) {
      fail(`${componentId} 的 demo meta 缺少文件：${demo.id}.tsx`);
    }
  }

  for (const fileId of fileIds) {
    if (!metaIds.has(fileId)) {
      fail(
        `${componentId} 的 demo 文件未在 previewMeta 中登记：${toDisplayPath(
          path.join(demosDir, `${fileId}.tsx`),
        )}`,
      );
    }
  }
}

function readComponent({ sectionId, componentId, entryPath }) {
  assertId(componentId, `${sectionId} 组件目录名`);

  const { meta, hasDefaultExport: entryHasDefaultExport } =
    readPreviewMeta(entryPath);

  if (!entryHasDefaultExport) {
    fail(`预览入口必须 default export：${toDisplayPath(entryPath)}`);
  }

  const demosDir = path.join(path.dirname(entryPath), 'demos');
  const demoFiles = readDemoFiles(demosDir);

  validateDemoFiles(componentId, meta, demoFiles, demosDir);

  const docId = meta.docId ?? `${DOC_ID_PREFIX}${sectionId}/${componentId}`;

  if (!DOC_ID_PATTERN.test(docId)) {
    fail(`${toDisplayPath(entryPath)} 的 docId 格式无效：${docId}`);
  }

  return {
    id: componentId,
    sectionId,
    title: meta.title,
    description: meta.description,
    order: meta.order,
    docId,
    entryPath,
    demos: meta.demos.map(demo => ({
      ...demo,
      filePath: path.join(demosDir, `${demo.id}.tsx`),
    })),
    aggregateName: `${toPascalCase(componentId)}Preview`,
    demosExportName: `${toCamelCase(componentId)}Demos`,
  };
}

function readSectionComponents(section) {
  const sectionDir = path.join(PREVIEWS_ROOT, section.id);

  if (!fs.existsSync(sectionDir)) {
    fail(`sections.json 中的目录不存在：${toDisplayPath(sectionDir)}`);
  }

  const components = [];

  for (const entry of fs.readdirSync(sectionDir, { withFileTypes: true }).sort(
    (left, right) => left.name.localeCompare(right.name),
  )) {
    if (!entry.isDirectory()) {
      continue;
    }

    const componentDir = path.join(sectionDir, entry.name);
    const entryPath = path.join(componentDir, 'index.tsx');

    if (!fs.existsSync(entryPath)) {
      if (fs.readdirSync(componentDir).length > 0) {
        fail(`预览目录缺少 index.tsx：${toDisplayPath(componentDir)}`);
      }

      continue;
    }

    components.push(
      readComponent({
        sectionId: section.id,
        componentId: entry.name,
        entryPath,
      }),
    );
  }

  const orders = new Set();

  for (const component of components) {
    if (orders.has(component.order)) {
      fail(`${section.id} 存在重复 previewMeta.order：${component.order}`);
    }

    orders.add(component.order);
  }

  return components.sort((left, right) => left.order - right.order);
}

function scanPreviews() {
  const sections = readSections();
  const sectionIds = new Set(sections.map(section => section.id));

  for (const entry of fs.readdirSync(PREVIEWS_ROOT, { withFileTypes: true })) {
    if (entry.isDirectory() && !sectionIds.has(entry.name)) {
      fail(`sections.json 未登记预览分组：${entry.name}`);
    }
  }

  const componentIds = new Set();
  const docIds = new Set();
  const aggregateNames = new Set();

  return sections.map(section => {
    const components = readSectionComponents(section);

    for (const component of components) {
      if (componentIds.has(component.id)) {
        fail(`存在重复组件 id：${component.id}`);
      }

      if (docIds.has(component.docId)) {
        fail(`存在重复 docId：${component.docId}`);
      }

      if (aggregateNames.has(component.aggregateName)) {
        fail(`存在重复生成的组件名：${component.aggregateName}`);
      }

      componentIds.add(component.id);
      docIds.add(component.docId);
      aggregateNames.add(component.aggregateName);
    }

    return { ...section, components };
  });
}

module.exports = {
  scanPreviews,
};
