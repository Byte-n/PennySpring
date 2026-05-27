# Cascader 组件规范巡检报告

## 结论

- 状态：不通过
- 严重程度：medium
- 问题数量：2

## 巡检覆盖

- 目录与导出：已检查 `packages/pennyspring-ui/src/Cascader/index.ts:1`-`packages/pennyspring-ui/src/Cascader/index.ts:14` 与包级导出 `packages/pennyspring-ui/src/index.ts:242`-`packages/pennyspring-ui/src/index.ts:254`。
- TypeScript 与 API 设计：已检查 `packages/pennyspring-ui/src/Cascader/types.ts:13`-`packages/pennyspring-ui/src/Cascader/types.ts:116`。
- 组件职责与组合方式：已检查 `packages/pennyspring-ui/src/Cascader/Cascader.tsx:1`-`packages/pennyspring-ui/src/Cascader/Cascader.tsx:240`、`packages/pennyspring-ui/src/Cascader/CascaderView.tsx:1`-`packages/pennyspring-ui/src/Cascader/CascaderView.tsx:225`，并对照 `.codex/skills/component-composer/references/component-catalog.md:50` 的 Cascader 条目。
- 样式与主题 token、视觉布局与交互：已检查 `packages/pennyspring-ui/src/Cascader/style/index.ts:1`-`packages/pennyspring-ui/src/Cascader/style/index.ts:178`，并对照 `CLAUDE.md` 样式约束、`.claude/rules/common/component-visual-layout.md` 与 `.codex/skills/theme-tokens/SKILL.md`。
- 动画与手势：已检查 Cascader 目录未直接使用 `Animated`、`LayoutAnimation` 或 gesture handler；弹层动画参数透传在 `packages/pennyspring-ui/src/Cascader/Cascader.tsx:194`-`packages/pennyspring-ui/src/Cascader/Cascader.tsx:210`。
- 测试与文档：已检查 `packages/pennyspring-ui/__tests__/Cascader.test.tsx:82`-`packages/pennyspring-ui/__tests__/Cascader.test.tsx:259`、`packages/pennyspring-ui/docs/components/data-entry/cascader.mdx:1`-`packages/pennyspring-ui/docs/components/data-entry/cascader.mdx:3`、`packages/pennyspring-ui/docs/guide/component-color-design.md:1`-`packages/pennyspring-ui/docs/guide/component-color-design.md:269`。

## 问题列表

### 1. Tag 展示模式删除标签不会触发 `onChange`

- 严重程度：medium
- 位置：`packages/pennyspring-ui/src/Cascader/Cascader.tsx:115`
- 违反规范：`.claude/rules/component/coding-style.md` 的“状态与回调 API”要求值或主要值统一使用 `value`、`onChange` 和 `defaultValue`，并需要同时支持可控和非可控模式；同节要求可控和非可控判断由 `useControllableValue(props.defaultValue, props.value, props.onChange)` 统一处理。
- 不符合点：`CascaderProps` 暴露了主要值 API `value/defaultValue/onChange`（`packages/pennyspring-ui/src/Cascader/types.ts:88`-`packages/pennyspring-ui/src/Cascader/types.ts:116`，继承自 `CascaderViewProps` 的 `value/defaultValue/onChange` 位于 `packages/pennyspring-ui/src/Cascader/types.ts:48`-`packages/pennyspring-ui/src/Cascader/types.ts:53`），但 `CascaderRoot` 初始化值状态时把 `useControllableValue` 的第三个参数传为 `undefined`（`packages/pennyspring-ui/src/Cascader/Cascader.tsx:87`-`packages/pennyspring-ui/src/Cascader/Cascader.tsx:90`）。常规选项选择路径会在 `handleChange` 中显式调用 `onChange?.(nextValue, params)`（`packages/pennyspring-ui/src/Cascader/Cascader.tsx:133`-`packages/pennyspring-ui/src/Cascader/Cascader.tsx:142`），但 tag 删除路径 `handleTagRemove` 只执行 `setMergedValue(nextValue)`（`packages/pennyspring-ui/src/Cascader/Cascader.tsx:115`-`packages/pennyspring-ui/src/Cascader/Cascader.tsx:122`），没有构造变更参数，也没有调用 `onChange`。底层可关闭标签默认开启删除入口：`TagValueDisplay` 默认 `closable = tagProps?.closable !== false && !disabled`（`packages/pennyspring-ui/src/_internal/TagValueDisplay/TagValueDisplay.tsx:15`-`packages/pennyspring-ui/src/_internal/TagValueDisplay/TagValueDisplay.tsx:17`），点击关闭按钮会调用 `onRemove?.(item.value)`（`packages/pennyspring-ui/src/_internal/TagValueDisplay/TagValueDisplay.tsx:30`-`packages/pennyspring-ui/src/_internal/TagValueDisplay/TagValueDisplay.tsx:37`），而 Cascader 将该回调接到 `handleTagRemove`（`packages/pennyspring-ui/src/Cascader/Cascader.tsx:162`-`packages/pennyspring-ui/src/Cascader/Cascader.tsx:169`）。`useControllableValue` 在受控模式下不会更新内部值，只会调用传入的 `onChange`（`packages/pennyspring-ui/src/_hooks/useControllableValue.ts:15`-`packages/pennyspring-ui/src/_hooks/useControllableValue.ts:26`），因此当前 `undefined` 回调导致受控删除无法把新值交给调用方。
- 影响：用户在 `displayMode="tag"` 下删除已选路径标签时，非受控模式只发生组件内部更新，外部监听不到主要值变化；受控模式下由于没有 `onChange`，调用方无法同步 `value`，删除操作不会形成可靠的受控闭环。现有测试只覆盖选择触发 `onChange` 与弹层开关（`packages/pennyspring-ui/__tests__/Cascader.test.tsx:103`-`packages/pennyspring-ui/__tests__/Cascader.test.tsx:230`），没有覆盖 tag 删除行为。
- 推荐纠正方案：为 tag 删除路径补齐与选项选择一致的值变更语义。至少应调用 `onChange` 并提供可解释的 `CascaderChangeParams`；如果现有 `CascaderChangeParams` 无法表达“删除路径片段”，应先调整公共 API 语义并同步测试受控与非受控删除行为。

## 需要人工确认

无
