# PennySpring 项目宪章

## Tech Stack

| Layer           | Technology         | Version |
|-----------------|--------------------|---------|
| Language        | TypeScript         | 5.8.3   |
| Framework       | React Native       | 0.85.2  |
| React           | React              | 19.2.3  |
| Database        | SQLite (op-sqlite) | ^9      |
| ORM             | Drizzle ORM        | ^0.38.4 |
| Navigation      | React Navigation   | ^7.x    |
| Testing         | Jest               | ^29.6.3 |
| Package Manager | Yarn workspaces    | -       |
| Node            | >= 22.13.0         | -       |

## Architecture

Monorepo（Yarn workspaces），3 个内部包：

```
packages/theme/       → 设计系统：token、算法、ThemeProvider
packages/components/  → UI 组件（脚手架已建，待开发）
packages/data/        → 数据层：Drizzle ORM + SQLite
```

Token 管线：`SeedToken` → `derivative()` → `MapToken` → `formatToken()` → `AliasToken`（组件通过 `createUseSheetStyle`
消费）。

## Build & Run

- **Dev server**: `yarn start`（Metro bundler）
- **iOS**: `yarn ios`
- **Android**: `yarn android`
- **Tests**: `yarn test`
- **Lint**: `yarn lint`
- **Type check**: 各包内 `yarn typecheck`

## Project Structure

```
packages/theme/       → 设计 token、ThemeProvider、createUseSheetStyle
packages/components/  → 共享 UI 组件（WIP）
packages/data/        → 数据库 schema 与查询（Drizzle + SQLite）
__tests__/            → 根级 App 测试
openspec/             → OpenSpec 变更工作流产物
.claude/              → Claude Code 配置：agents、rules、skills
scripts/              → 工具脚本
```

## Conventions

- **Git commit**: 中文、conventional-commit 风格（`feat:`、`fix:`）
- **分支**: 从 main 创建功能分支

## 样式（RN）

**唯一构建方式**：`createUseSheetStyle`（来自 `@pennyspring/theme`）。

**禁止**：

- `StyleSheet.create(...)`
- 组件内联 `style={{ ... }}` 字面量对象
- 样式值中的颜色字面量（`'#xxx'`、`'rgb/rgba(...)'`、命名色）
- 样式值中的数字字面量

**唯一例外（数字字面量）**：`0`、`flex: 1`、`'100%'`、`'50%'`、`'transparent'`。

**Token 选择**：必须参考技能 `theme-tokens`；阴影必须经 `toShadowStyle(...)`；行高用 `token.fontHeight*`（像素），不用
`token.lineHeight*`（倍数）。

**动态样式**：通过 `createUseSheetStyle<TOptions>` 的泛型参数传入，不在调用处拼 `[styles.a, { ... }]`。

**主题注入**：全局 `<ThemeProvider>` 位于应用根；禁止在组件内判断 light/dark 分支——所有 token 已自适配。

## 文本展示

仅允许使用 theme 子包提供的 `Text` 组件；业务与共享组件中禁止直接使用 `react-native` 的 `Text` 做文本展示。
