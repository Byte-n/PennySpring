# Segmented 组件规范巡检报告

## 结论

- 状态：通过
- 严重程度：medium
- 问题数量：1

## 问题列表

### 1. 可由布局原语承载的结构直接使用 View ✅

- 严重程度：medium
- 位置：`packages/pennyspring-ui/src/Segmented/Segmented.tsx:125`
- 违反规范：`.claude/rules/component/coding-style.md`、`.codex/skills/component-composer/references/component-catalog.md`
- 不符合点：组件根、track、content、icon 容器直接使用 `View`，同时样式中用 `flexDirection: 'row'`、`alignItems`、`justifyContent`、`gap` 组织横向布局，例如 `Segmented.tsx:125`、`Segmented.tsx:126`、`Segmented.tsx:159`、`Segmented.tsx:161` 与 `style/index.ts:48`、`style/index.ts:80`。共享组件规范要求可由 `Row`、`Column`、`Space`、`Spacer`、`Grid`、`GeometryReader` 表达的布局优先复用组件库布局原语。
- 影响：布局语义分散在组件私有样式中，后续尺寸、间距、对齐和跨组件一致性需要逐个维护，降低组合复用能力。
- 推荐纠正方案：将横向容器改为 `Row` 或适配的 `Space`，把根容器按实际语义改为现有布局原语或保留最小必要宿主节点；将 `content` 的横向对齐和 gap 交给布局原语的 props 表达，私有样式只保留组件特有的视觉 token。

## 需要人工确认

- 无
