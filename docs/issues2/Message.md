# Message 组件规范巡检报告

## 结论

- 状态：不通过
- 严重程度：medium
- 问题数量：2

## 问题列表

### 1. 消息文本优先通过 style 控制颜色

- 严重程度：low
- 位置：`packages/pennyspring-ui/src/Message/Message.tsx:210`
- 违反规范：`CLAUDE.md` 组件约束
- 不符合点：消息文本使用 `<Text size={SIZE_MAP[size].textSize} style={[tokenStyles.messageText, styles?.messageText]}>`，其中 `messageText` 在 `Message.tsx:106` 到 `Message.tsx:109` 中包含 `color: token.colorText`。项目规范要求 `Text` 字号、颜色等优先使用 `TextProps`。
- 影响：全局反馈消息的文本色彩语义绕过 `Text` API，和 Toast/Notification 等反馈组件不易保持一致。
- 推荐纠正方案：使用 `Text color="default"` 或相应语义 props 表达颜色，样式插槽只保留布局或额外覆盖。

### 2. Message 内容布局使用 Animated.View/View 手写

- 严重程度：medium
- 位置：`packages/pennyspring-ui/src/Message/Message.tsx:199`
- 违反规范：`CLAUDE.md` 组件约束；`.codex/skills/component-composer/SKILL.md` 工作流程
- 不符合点：`MessageBody` 使用 `Animated.View` 作为内容容器，并在 `Message.tsx:82` 到 `Message.tsx:99` 手写 `flexDirection: 'row'`、`alignItems`、`gap`；状态点使用原始 `View`（`Message.tsx:208`）。项目规范要求布局优先使用 `Row`、`Column`、`Space` 等已有布局组件。
- 影响：反馈组件内部布局脱离共享布局原语，状态点、文本和 gap 的语义不易与其他反馈组件统一。
- 推荐纠正方案：动画外层保留 `Animated.View` 承载动画，内部内容使用 `Row` 或 `Space` 组合状态点和文本。

## 需要人工确认

- 无
