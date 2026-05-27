# ActionSheet 组件规范巡检报告

## 结论

- 状态：不通过
- 严重程度：medium
- 问题数量：2

## 问题列表

### 1. `title` / `cancel` 插槽传入 `null` 时没有按“明确不渲染”处理

- 严重程度：medium
- 位置：`packages/pennyspring-ui/src/ActionSheet/ActionSheet.tsx:88`
- 违反规范：`.claude/rules/component/coding-style.md` 的“内部渲染节点”章节
- 不符合点：规范要求 `xxx`、`xxxRender` 和其他插槽类 prop 为 `null` 时表示明确不渲染，`undefined` 才表示未传递并走默认行为。当前 `renderTitle` 在 `title === null` 时会继续回退到 `titleText`，代码片段为 `if (title !== undefined && title !== null) { return title; }`，随后 `titleText` 非 `undefined` 时仍渲染标题文本。取消区域同样存在该问题，`packages/pennyspring-ui/src/ActionSheet/ActionSheet.tsx:234` 先用 `{cancelText || cancel ? (...) : null}` 决定渲染区域，`packages/pennyspring-ui/src/ActionSheet/ActionSheet.tsx:244` 又在 `cancel === null` 时回退渲染 `cancelText`。
- 影响：调用方无法通过 `title={null}` 或 `cancel={null}` 显式关闭对应插槽内容，`null` 与 `undefined` 语义漂移，破坏共享组件插槽 API 的一致性。
- 推荐纠正方案：区分 `null` 和 `undefined`。例如 `title === null` 时直接返回 `null` 且不回退 `titleText`；`cancel === null` 时不要回退 `cancelText`，并在取消区域渲染条件中把显式 `null` 作为不渲染信号处理。

## 需要人工确认

- 无

