# ImagePicker 组件规范巡检报告

## 结论

- 状态：不通过
- 严重程度：medium
- 问题数量：2

## 问题列表

### 1. 默认浮层高度硬编码非例外百分比

- 严重程度：medium
- 位置：`packages/pennyspring-ui/src/ImagePicker/ImagePicker.tsx:38`
- 违反规范：`CLAUDE.md` 样式约束（React Native）；`.codex/skills/theme-tokens/SKILL.md` Token 取值规则
- 不符合点：`DEFAULT_PANEL_HEIGHT = '45%'`，并在 `ImagePicker.tsx:392` 作为 `Popup.FloatingPanel` 的 `height` 使用。项目样式约束只允许 `0`、`flex: 1`、`'100%'`、`'50%'`、`'transparent'` 作为字面量例外，`'45%'` 不在例外范围内。
- 影响：图片选择面板高度缺少 token、断点或语义来源，可能和其他底部浮层高度策略不一致。
- 推荐纠正方案：使用 Popup/FloatingPanel 的尺寸 token 或按窗口高度计算语义化高度；确需百分比时应在规范中声明组件级例外。

### 2. 面板标题、提示和空状态文本优先通过 style 控制颜色

- 严重程度：low
- 位置：`packages/pennyspring-ui/src/ImagePicker/ImagePicker.tsx:267`
- 违反规范：`CLAUDE.md` 组件约束
- 不符合点：面板标题使用 `<Text size="xl" weight="strong" style={[tokenStyles.popupTitle, ...]}>`，颜色来自 `style.ts:58` 到 `style.ts:62`；空状态文本在 `ImagePicker.tsx:312` 使用 `tokenStyles.emptyText`，颜色来自 `style.ts:109` 到 `style.ts:110`。项目规范要求 `Text` 字号、颜色等优先使用 `TextProps`。
- 影响：ImagePicker 的标题、提示、空状态文本颜色语义绕过 `Text` 组件 API，和其他反馈/选择组件的文本语义不易统一。
- 推荐纠正方案：标题使用 `Text color="heading"`，副标题使用 `Text color="secondary"`，空状态使用 `Text color="tertiary"`；样式插槽只保留额外布局或无法通过 Text props 表达的样式。

## 需要人工确认

- 无
