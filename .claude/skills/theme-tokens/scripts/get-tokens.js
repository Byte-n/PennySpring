#!/usr/bin/env node

const fs = require('node:fs');
const path = require('node:path');
const ts = require('typescript');
const Module = require('node:module');

const PROJECT_ROOT = path.resolve(__dirname, '../../../..');
const THEME_SRC_ROOT = path.join(PROJECT_ROOT, 'packages/pennyspring-theme/src');

function getUsageText() {
  return (
    'Usage: node scripts/get-tokens.js [--json] <tokenPath> [tokenPath ...]\n' +
    '\n' +
    'Options:\n' +
    '  -h, --help   Show help\n' +
    '  --json       Output result as JSON\n' +
    '\n' +
    'Examples:\n' +
    '  node scripts/get-tokens.js colorPrimary paddingSM\n' +
    '  node scripts/get-tokens.js boxShadow.shadowOpacity\n'
  );
}

function printUsage(output = 'stderr') {
  const usageText = getUsageText();
  if (output === 'stdout') {
    process.stdout.write(usageText);
    return;
  }
  process.stderr.write(usageText);
}

function toErrorMessage(error) {
  if (error instanceof Error) {
    return error.message;
  }

  return 'Unexpected error';
}

function registerTsLoader() {
  Module._extensions['.ts'] = function compileTypeScript(module, filename) {
    const source = fs.readFileSync(filename, 'utf8');
    const transpiled = ts.transpileModule(source, {
      compilerOptions: {
        module: ts.ModuleKind.CommonJS,
        target: ts.ScriptTarget.ES2020,
        jsx: ts.JsxEmit.React,
        esModuleInterop: true,
      },
      fileName: filename,
    });

    module._compile(transpiled.outputText, filename);
  };
}

function stubReactNative() {
  const originalLoad = Module._load;
  Module._load = function patchedLoad(request, parent, isMain) {
    if (request === 'react-native') {
      return {
        Platform: {
          select: (options) => options.default ?? options.ios ?? options.android,
        },
      };
    }

    return originalLoad.call(this, request, parent, isMain);
  };
}

function getDefaultAliasToken() {
  registerTsLoader();
  stubReactNative();

  const { defaultSeedToken } = require(path.join(THEME_SRC_ROOT, 'defaults.ts'));
  const { derivative } = require(path.join(THEME_SRC_ROOT, 'algorithms/derivative.ts'));
  const { formatToken } = require(path.join(THEME_SRC_ROOT, 'algorithms/formatToken.ts'));

  return formatToken(derivative(defaultSeedToken, false));
}

function getValueByPath(target, tokenPath) {
  const segments = tokenPath.split('.').filter(Boolean);

  if (segments.length === 0) {
    throw new Error(`Unknown token path: ${tokenPath}`);
  }

  let current = target;

  for (const segment of segments) {
    if (current === null || current === undefined || !(segment in Object(current))) {
      throw new Error(`Unknown token path: ${tokenPath}`);
    }

    current = current[segment];
  }

  return current;
}

function parseArgs(argv) {
  const args = argv.slice(2);
  const showHelp = args.includes('--help') || args.includes('-h');
  const isJson = args.includes('--json');
  const tokenPaths = args.filter((arg) => arg !== '--json' && arg !== '--help' && arg !== '-h');

  return {
    showHelp,
    isJson,
    tokenPaths,
  };
}

function main() {
  const { showHelp, isJson, tokenPaths } = parseArgs(process.argv);

  if (showHelp) {
    printUsage('stdout');
    return;
  }

  if (tokenPaths.length === 0) {
    printUsage();
    process.exitCode = 1;
    return;
  }

  try {
    const token = getDefaultAliasToken();
    const result = {};

    for (const tokenPath of tokenPaths) {
      result[tokenPath] = getValueByPath(token, tokenPath);
    }

    if (isJson) {
      process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
      return;
    }

    const lines = tokenPaths.map((tokenPath) => {
      const value = result[tokenPath];
      const output = typeof value === 'object' ? JSON.stringify(value) : String(value);
      return `${tokenPath}=${output}`;
    });

    process.stdout.write(`${lines.join('\n')}\n`);
  } catch (error) {
    process.stderr.write(`${toErrorMessage(error)}\n`);
    process.exitCode = 1;
  }
}

main();
