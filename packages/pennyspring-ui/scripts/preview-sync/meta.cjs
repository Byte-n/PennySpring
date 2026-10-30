const fs = require('node:fs');
const ts = require('typescript');
const {
  DOC_ID_PATTERN,
  SECTIONS_PATH,
  assertId,
  assertString,
  fail,
  readJson,
  toDisplayPath,
} = require('./shared.cjs');

function readSections() {
  const rawSections = readJson(SECTIONS_PATH);

  if (!Array.isArray(rawSections)) {
    fail('sections.json 必须是数组');
  }

  const sectionIds = new Set();

  return rawSections.map((section, index) => {
    assertId(section.id, `sections[${index}].id`);
    assertString(section.title, `sections[${index}].title`);

    if (sectionIds.has(section.id)) {
      fail(`sections.json 存在重复 section：${section.id}`);
    }

    sectionIds.add(section.id);
    return { id: section.id, title: section.title };
  });
}

function parseSource(filePath) {
  return ts.createSourceFile(
    filePath,
    fs.readFileSync(filePath, 'utf8'),
    ts.ScriptTarget.Latest,
    true,
    filePath.endsWith('.tsx') ? ts.ScriptKind.TSX : ts.ScriptKind.TS,
  );
}

function unwrap(node) {
  let current = node;

  while (
    current &&
    (ts.isSatisfiesExpression(current) ||
      ts.isAsExpression(current) ||
      ts.isParenthesizedExpression(current) ||
      ts.isTypeAssertionExpression(current))
  ) {
    current = current.expression;
  }

  return current;
}

function readLiteral(node, label) {
  const current = unwrap(node);

  if (ts.isStringLiteral(current) || ts.isNoSubstitutionTemplateLiteral(current)) {
    return current.text;
  }

  if (ts.isNumericLiteral(current)) {
    return Number(current.text);
  }

  if (current.kind === ts.SyntaxKind.TrueKeyword) {
    return true;
  }

  if (current.kind === ts.SyntaxKind.FalseKeyword) {
    return false;
  }

  if (ts.isArrayLiteralExpression(current)) {
    return current.elements.map(element => {
      if (ts.isSpreadElement(element)) {
        fail(`${label} 不支持数组展开`);
      }

      return readLiteral(element, label);
    });
  }

  if (ts.isObjectLiteralExpression(current)) {
    const result = {};

    for (const property of current.properties) {
      if (
        !ts.isPropertyAssignment(property) ||
        !ts.isIdentifier(property.name)
      ) {
        fail(`${label} 只支持普通对象字面量`);
      }

      result[property.name.text] = readLiteral(property.initializer, label);
    }

    return result;
  }

  fail(`${label} 必须使用字面量`);
}

function findExportedVariable(sourceFile, name) {
  for (const statement of sourceFile.statements) {
    if (!ts.isVariableStatement(statement)) {
      continue;
    }

    const isExported = statement.modifiers?.some(
      modifier => modifier.kind === ts.SyntaxKind.ExportKeyword,
    );

    if (!isExported) {
      continue;
    }

    for (const declaration of statement.declarationList.declarations) {
      if (
        ts.isIdentifier(declaration.name) &&
        declaration.name.text === name &&
        declaration.initializer
      ) {
        return declaration.initializer;
      }
    }
  }

  return undefined;
}

function hasDefaultExport(sourceFile) {
  return sourceFile.statements.some(statement => {
    if (ts.isExportAssignment(statement)) {
      return !statement.isExportEquals;
    }

    if (
      ts.isFunctionDeclaration(statement) ||
      ts.isClassDeclaration(statement)
    ) {
      return (
        statement.modifiers?.some(
          modifier => modifier.kind === ts.SyntaxKind.DefaultKeyword,
        ) ?? false
      );
    }

    if (
      ts.isExportDeclaration(statement) &&
      statement.exportClause &&
      ts.isNamedExports(statement.exportClause)
    ) {
      return statement.exportClause.elements.some(
        element => element.name.text === 'default',
      );
    }

    return false;
  });
}

function validateDemoMeta(demo, label) {
  if (!demo || typeof demo !== 'object') {
    fail(`${label} 必须是对象`);
  }

  assertId(demo.id, `${label}.id`);
  assertString(demo.title, `${label}.title`);

  if (demo.description !== undefined) {
    assertString(demo.description, `${label}.description`);
  }

  return {
    id: demo.id,
    title: demo.title,
    description: demo.description,
  };
}

function validatePreviewMeta(rawMeta, filePath) {
  const label = `${toDisplayPath(filePath)} previewMeta`;

  if (!rawMeta || typeof rawMeta !== 'object') {
    fail(`${label} 必须是对象`);
  }

  assertString(rawMeta.title, `${label}.title`);
  assertString(rawMeta.description, `${label}.description`);

  if (!Number.isInteger(rawMeta.order) || rawMeta.order < 1) {
    fail(`${label}.order 必须是正整数`);
  }

  if (rawMeta.docId !== undefined) {
    assertString(rawMeta.docId, `${label}.docId`);

    if (!DOC_ID_PATTERN.test(rawMeta.docId)) {
      fail(`${label}.docId 格式无效：${rawMeta.docId}`);
    }
  }

  if (!Array.isArray(rawMeta.demos) || rawMeta.demos.length === 0) {
    fail(`${label}.demos 必须是非空数组`);
  }

  const demoIds = new Set();
  const demos = rawMeta.demos.map((demo, index) => {
    const demoMeta = validateDemoMeta(demo, `${label}.demos[${index}]`);

    if (demoIds.has(demoMeta.id)) {
      fail(`${label} 存在重复 demo id：${demoMeta.id}`);
    }

    demoIds.add(demoMeta.id);
    return demoMeta;
  });

  return {
    title: rawMeta.title,
    description: rawMeta.description,
    order: rawMeta.order,
    docId: rawMeta.docId,
    demos,
  };
}

function readPreviewMeta(filePath) {
  const sourceFile = parseSource(filePath);
  const initializer = findExportedVariable(sourceFile, 'previewMeta');

  if (!initializer) {
    fail(`${toDisplayPath(filePath)} 缺少 previewMeta 导出`);
  }

  const rawMeta = readLiteral(
    initializer,
    `${toDisplayPath(filePath)} previewMeta`,
  );

  return {
    meta: validatePreviewMeta(rawMeta, filePath),
    hasDefaultExport: hasDefaultExport(sourceFile),
  };
}

module.exports = {
  hasDefaultExport,
  parseSource,
  readPreviewMeta,
  readSections,
};
