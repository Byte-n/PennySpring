# DataList 组件规范巡检报告

## 结论

- 状态：不通过
- 严重程度：low
- 问题数量：1

## 问题列表

### 1. Footer 状态文本优先通过 style 控制颜色

- 严重程度：low
- 位置：`packages/pennyspring-ui/src/DataList/DataList.tsx:127`
- 违反规范：`CLAUDE.md` 组件约束
- 不符合点：完成态文本使用 `<Text size={resolveTextSize(resolvedSize)} style={[tokenStyles.completeText, styles?.completeText]}>`，其中 `completeText` 在 `style/index.ts:25` 到 `style/index.ts:27`、`style/index.ts:41` 到 `style/index.ts:43`、`style/index.ts:56` 到 `style/index.ts:58` 中通过 `color: token.colorTextTertiary` 控制颜色；加载文本也通过 `Loading` 的 `styles.text` 传入 `tokenStyles.loadingMoreText`。项目规范要求 `Text` 字号、颜色等优先使用 `TextProps`。
- 影响：列表状态文本颜色语义绕过 `Text` API，和其他状态组件的文本语义不易统一。
- 推荐纠正方案：完成态文本使用 `Text color="tertiary"` 等公开 props；加载态文本应优先通过 `Loading` 公开文本色彩/尺寸 API 传递，无法表达时再保留样式插槽。

## 需要人工确认

- 无
