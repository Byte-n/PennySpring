# Tabs 组件规范巡检报告

## 结论

- 状态：通过
- 严重程度：low
- 问题数量：1

## 问题列表

### 1. 已暴露的 labelActive/labelDisabled 样式槽未被消费

- 严重程度：low
- 位置：`packages/pennyspring-ui/src/Tabs/types.ts:29`
- 违反规范：`.claude/rules/component/coding-style.md`
- 不符合点：`TabsStyles` 暴露了 `labelActive` 与 `labelDisabled`，见 `types.ts:29`、`types.ts:30`，但 `Tabs.tsx` 的 `renderLabel` 只使用 `styles?.label`，调用处也仅传入整个 `styles` 对象，未根据 selected/disabled 状态合并 `styles?.labelActive` 或 `styles?.labelDisabled`，见 `Tabs.tsx:37`、`Tabs.tsx:50`、`Tabs.tsx:112`。
- 影响：调用方传入 active/disabled 文本样式不会生效，公共样式 API 与实际行为不一致，降低组件 API 可信度。
- 推荐纠正方案：让 `renderLabel` 接收已合并的 `StyleProp<TextStyle>`，在 `renderItem` 中按 `isSelected`、`itemDisabled` 合并 `styles?.label`、`styles?.labelActive`、`styles?.labelDisabled`；或移除未实现的样式槽。

## 需要人工确认

- 无
