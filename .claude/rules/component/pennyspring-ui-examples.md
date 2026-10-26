---
paths:
  - "packages/pennyspring-ui/examples/previews/**/*.ts"
  - "packages/pennyspring-ui/examples/previews/**/*.tsx"
---

# 组件预览规则

## 目录与职责

- 每个组件使用 `index.tsx`、`demos/`、`demos/index.ts` 结构。
- `index.tsx` 只负责渲染 `PreviewScaffold`，遍历 demos 并生成 `PreviewSection`。
- 每个演示场景独立放在 `demos/<scenario>.tsx`，导出 `*Demo` 组件和 `*DemoTitle`。
- `demos/index.ts` 统一导入并注册 demos，条目必须包含稳定的 `id`、`title`、`Component`。
- 多个 demo 共享的静态选项或数据放在同一 `demos/` 目录的独立文件中。

## Registry 与文档

- 在 `examples/previews/registry.tsx` 同时注册组件 preview 和 demos：
  - 组件分区使用组件 id，例如 `list-picker`。
  - `DEMO_PREVIEW_ITEMS` 使用 `createDemoPreviewItems(componentId, title, demos)`。
- `componentId` 必须与文档 `.mdx` 中的 `<PreviewDocIntro id>`、`<PreviewDocs id>` 完全一致。
- 新增或重命名组件 preview 时，同步检查 registry、文档路径和 sidebar 配置。

## 导入与实现

- 只能从 `react`、`react-native`、`@pennyspring/ui`、`@pennyspring/theme`、`phosphor-react-native` 导入。
- 禁止 `import * as` 和 `import { x as y }`；类型使用 `import type`。
- 优先使用 `@pennyspring/ui` 的组件和布局，不在 preview 中重复实现组件行为。
- 文案使用中文；交互 demo 应展示组件的主要状态和真实使用方式。
