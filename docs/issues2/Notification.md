# Notification 组件规范巡检报告

## 结论

- 状态：通过
- 严重程度：medium
- 问题数量：2

## 问题列表

### 1. 弹层 zIndex 使用硬编码偏移 ✅

- 严重程度：medium
- 位置：`packages/pennyspring-ui/src/Notification/Notification.tsx:117`
- 违反规范：`.claude/rules/component/coding-style.md` Z 轴层级
- 不符合点：`Notification` 内容层使用 `zIndex: token.zIndexPopupBase + 100`。组件规范要求普通弹窗、Picker 和其他同级浮层默认使用 `token.zIndexPopupBase`，Popup/Dialog 类才明确使用 `token.zIndexPopupBase + 100`；同层级覆盖关系应由 Portal 挂载顺序处理。
- 影响：Notification 可能无意盖过同级浮层，破坏 Portal 挂载顺序决定覆盖关系的约定。
- 推荐纠正方案：默认改为 `token.zIndexPopupBase`；如 Notification 需要更高层级，应在组件规范中明确该层级语义。

### 2. 标题和描述文本优先通过 style 控制颜色 ✅

- 严重程度：low
- 位置：`packages/pennyspring-ui/src/Notification/Notification.tsx:246`
- 违反规范：`CLAUDE.md` 组件约束
- 不符合点：标题和描述分别使用 `style={[tokenStyles.titleText, ...]}` 与 `style={[tokenStyles.descriptionText, ...]}`，对应样式在 `Notification.tsx:128` 到 `Notification.tsx:133` 中包含 `color`。项目规范要求 `Text` 字号、颜色等优先使用 `TextProps`。
- 影响：通知文本色彩语义绕过 `Text` API，和 Message/Toast 等反馈组件不一致。
- 推荐纠正方案：标题使用 `Text color="heading"`，描述使用 `Text color="secondary"`；样式插槽只保留额外样式覆盖。

## 需要人工确认

- 无
