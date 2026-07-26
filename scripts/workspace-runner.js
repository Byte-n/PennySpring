#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const inquirer = require('inquirer');
const SearchList = require('inquirer-search-list');

inquirer.registerPrompt('search-list', SearchList);

// 扫描所有 package.json 文件
function scanWorkspaces() {
  const packagesDir = path.join(__dirname, '..', 'packages');
  const workspaces = [];

  // 扫描 packages/* 下的子包
  const packages = fs.readdirSync(packagesDir);
  packages.forEach((pkg) => {
    const pkgPath = path.join(packagesDir, pkg);
    const packageJsonPath = path.join(pkgPath, 'package.json');

    if (fs.existsSync(packageJsonPath)) {
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
      if (packageJson.scripts && Object.keys(packageJson.scripts).length > 0) {
        workspaces.push({
          name: packageJson.name,
          path: pkgPath,
          scripts: packageJson.scripts,
        });
      }
    }
  });

  // 检查 packages/pennyspring-ui/examples
  const examplesPath = path.join(packagesDir, 'pennyspring-ui', 'examples');
  const examplesPackageJsonPath = path.join(examplesPath, 'package.json');
  if (fs.existsSync(examplesPackageJsonPath)) {
    const packageJson = JSON.parse(fs.readFileSync(examplesPackageJsonPath, 'utf-8'));
    if (packageJson.scripts && Object.keys(packageJson.scripts).length > 0) {
      workspaces.push({
        name: packageJson.name,
        path: examplesPath,
        scripts: packageJson.scripts,
      });
    }
  }

  return workspaces;
}

// 主函数
async function main() {
  const workspaces = scanWorkspaces();

  if (workspaces.length === 0) {
    console.log('未找到任何带 scripts 的子包');
    return;
  }

  // 构建选择列表
  const choices = [];

  // 添加根目录 scripts（排除 ws 命令本身）
  const rootPackageJsonPath = path.join(__dirname, '..', 'package.json');
  if (fs.existsSync(rootPackageJsonPath)) {
    const rootPackageJson = JSON.parse(fs.readFileSync(rootPackageJsonPath, 'utf-8'));
    if (rootPackageJson.scripts) {
      Object.keys(rootPackageJson.scripts).forEach((script) => {
        if (script !== 'ws') {
          choices.push({
            name: `根目录 → ${script}`,
            value: { workspace: null, script },
            short: `root:${script}`,
          });
        }
      });
    }
  }

  // 添加子包 scripts
  workspaces.forEach((ws) => {
    const scriptNames = Object.keys(ws.scripts);
    scriptNames.forEach((script) => {
      choices.push({
        name: `${ws.name} → ${script}`,
        value: { workspace: ws.name, script },
        short: `${ws.name}:${script}`,
      });
    });
  });

  // 询问用户（支持实时搜索）
  const { selection } = await inquirer.prompt([
    {
      type: 'search-list',
      name: 'selection',
      message: '选择要执行的命令:',
      choices,
    },
  ]);

  const { workspace, script } = selection;
  const command = workspace
    ? `yarn workspace ${workspace} ${script}`
    : `yarn ${script}`;

  console.log(`\n执行命令: ${command}\n`);

  try {
    execSync(command, { stdio: 'inherit', cwd: path.join(__dirname, '..') });
  } catch (error) {
    console.error(`\n命令执行失败，退出码: ${error.status}`);
    process.exit(error.status || 1);
  }
}

main().catch((error) => {
  console.error('脚本执行出错:', error);
  process.exit(1);
});
