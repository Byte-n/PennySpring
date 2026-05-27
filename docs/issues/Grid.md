# Grid 组件规范巡检报告

## 结论

- 状态：不通过
- 严重程度：medium
- 问题数量：2

## 问题列表

### 1. `gap` 公开 API 允许任意数字，绕过布局间距 token

- 严重程度：medium
- 位置：`packages/pennyspring-ui/src/Grid/types.ts:5`
- 违反规范：`CLAUDE.md:75`、`CLAUDE.md:79`、`.claude/rules/common/component-visual-layout.md:12`、`.claude/rules/common/component-visual-layout.md:20`、`.claude/rules/component/coding-style.md:64`
- 不符合点：`GridGapValue` 定义为 `number | ComponentSize`，`GridProps.gap` 因此允许调用方传入任意数字；实现中 `resolveGapValue` 在 `packages/pennyspring-ui/src/Grid/Grid.tsx:115` 到 `packages/pennyspring-ui/src/Grid/Grid.tsx:119` 直接把该数字用于后续 `paddingHorizontal`、`paddingVertical`、`marginHorizontal` 和 `marginVertical`。这让 Grid 的布局间距可以完全绕开 `small`、`normal`、`large` 到 `AliasToken` 的语义映射，不符合“布局 gap 用于 Grid 子项间距”且必须由 token 驱动的要求。
- 影响：调用方容易写出硬编码间距，导致同一布局组件在不同页面、主题或尺寸语义下出现不一致；测试当前只覆盖 `small`、`normal`、`large`，无法约束数字 gap 的 token 合规性。
- 推荐纠正方案：收敛公开 API，优先改为 `gap?: ComponentSize` 或 `size?: ComponentSize` 并默认 `normal`；若确需扩展，应提供明确语义枚举并在实现中统一映射到 `AliasToken`。同步补充测试，验证默认值以及 `small`、`normal`、`large` 的 token 映射。

### 2. `GridGap` 二元组类型暴露了未实现且不符合垂直间距语义的 API

- 严重程度：medium
- 位置：`packages/pennyspring-ui/src/Grid/types.ts:7`
- 违反规范：`.claude/rules/typescript/coding-style.md:12`、`.claude/rules/common/component-visual-layout.md:28`、`.claude/rules/component/coding-style.md:64`
- 不符合点：`GridGap` 暴露 `[GridGapValue, GridGapValue]`，但实现只读取 `gap[0]`：`packages/pennyspring-ui/src/Grid/Grid.tsx:86` 到 `packages/pennyspring-ui/src/Grid/Grid.tsx:92` 中第二个元素完全被忽略，垂直 gap 始终由第一个水平值折半计算。公开类型暗示调用方可以分别传入两个 gap 值，但实际行为并不使用第二个值；同时规范要求 Grid 的垂直方向间隙必须由同语义水平 token 直接计算，公开二元组会制造与该规则相冲突的 API 语义。
- 影响：TypeScript 类型与运行时行为不一致，调用方传入 `[horizontal, vertical]` 时不会得到类型暗示的效果；后续维护者也可能为了“修复”第二个元素而引入独立垂直 token/数字间距，破坏 Grid 的布局间距规范。
- 推荐纠正方案：移除二元组形式，将 `GridGap` 收敛为单一语义值；若保留二元组必须改名并文档化为 `[horizontal, ignored]` 之外的明确语义，但这与当前垂直间距规范冲突，不建议保留。补充测试覆盖传入数组时的期望，或删除数组能力后补充类型层面的用例/文档说明。

## 需要人工确认

- 无
