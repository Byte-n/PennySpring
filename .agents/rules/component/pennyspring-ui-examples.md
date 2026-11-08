---
paths:
  - 'packages/pennyspring-ui/examples/previews/**/*.ts'
  - 'packages/pennyspring-ui/examples/previews/**/*.tsx'
---

# 组件预览规则

## 目录与职责

- 每个组件使用 `index.tsx`、`demos/`、`demos/index.ts` 结构。
- `index.tsx` 提供聚合预览组件并 default export；通常渲染 `PreviewScaffold` 并遍历生成的 demos。Theme 例外，直接复用 `@pennyspring/theme` 的 `ThemePreview`。
- 每个演示场景独立放在 `demos/<scenario>.tsx`，并 default export 组件；展示标题写入入口 `previewMeta.demos`，不再使用 `*DemoTitle` 常量。
- `demos/index.ts` 由 `scripts/sync-previews.cjs` 生成，禁止手写导入或数组。
- 多个 demo 共享的静态选项或数据放在同一 `demos/` 目录的独立文件中。

## Registry 与文档

- 每个预览入口 `index.tsx` 必须导出 `previewMeta`，包含 `title`、`description`、`order`、可选 `docId` 和 `demos` 列表；值必须使用字面量，供生成器通过 AST 读取。
- 每个 demo 文件必须 default export；demo 的 id 使用文件名（不含 `.tsx`），标题写入 `previewMeta.demos`。
- 分组中文名和顺序配置在 `examples/previews/sections.json`。
- `examples/previews/registry.tsx`、各组件的 `demos/index.ts`、`docs/components/**/*.mdx` 和 `sidebars.generated.cjs` 均由 `scripts/sync-previews.cjs` 生成，禁止手动编辑。
- 新增、重命名或删除 preview / demo 后，运行 `yarn workspace @pennyspring/ui previews:sync`；`yarn test` 会校验生成产物是否同步。

## 导入与实现

- 只能从 `react`、`react-native`、`@pennyspring/ui`、`@pennyspring/theme`、`phosphor-react-native` 导入。
- 禁止 `import * as` 和 `import { x as y }`；类型使用 `import type`。
- 优先使用 `@pennyspring/ui` 的组件和布局，不在 preview 中重复实现组件行为。
- 文案使用中文；交互 demo 应展示组件的主要状态和真实使用方式。
