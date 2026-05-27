# Notification 组件规范巡检报告

## 结论

- 状态：不通过
- 严重程度：high
- 问题数量：4

## 问题列表

### 1. 受控模式下 duration 自动关闭不会触发关闭请求

- 严重程度：high
- 位置：`packages/pennyspring-ui/src/Notification/Notification.tsx:187`
- 违反规范：`.claude/rules/component/coding-style.md` 的“状态与回调 API”；`CLAUDE.md` 的“组件约束”
- 不符合点：`NotificationBody` 在计时结束时调用 `onCloseStart`，但 `Notification` 传入的 `handleCloseStart` 在受控模式下直接返回：`if (isControlled || internalCloseStartedRef.current || !isOpen) { return; }`。这导致 `<Notification open duration={...} onCancel onOpenChange />` 到期后既不会调用 `onCancel`，也不会调用 `onOpenChange(false)` 请求外部关闭。
- 影响：受控和非受控行为不一致，调用方使用受控 `open` 时 `duration` 公开能力失效；用户可感知的自动关闭行为无法发生，外部状态也收不到关闭意图。
- 推荐纠正方案：计时关闭时无论是否受控都先触发 `onCancel`，再触发 `onOpenChange(false)`；仅在非受控模式下调用 `setResolvedOpen(false)`。同时保留 `internalCloseStartedRef` 防重入。

### 2. 动态视觉样式在渲染处以内联对象拼接

- 严重程度：medium
- 位置：`packages/pennyspring-ui/src/Notification/Notification.tsx:230`
- 违反规范：`CLAUDE.md` 的“样式约束（React Native）”；`.claude/rules/common/component-visual-layout.md` 的“Token 边界”；`.codex/skills/theme-tokens/SKILL.md` 的 API 规则
- 不符合点：组件在 `Animated.View` 的 `style` 数组中拼接 `{ maxWidth: maxContentWidth }` 和 `{ backgroundColor: resolveTypeBgColor(token, type) }`。项目要求动态样式通过 `createUseSheetStyle<TOptions>` 的 options 传入，不在调用处拼内联样式字面量对象。
- 影响：样式来源分散，绕过统一 token 样式工厂，后续主题切换、状态扩展和样式审计更难保持一致。
- 推荐纠正方案：将 `type`、`maxContentWidth` 纳入 `useStyles` 的 options，在 `createUseSheetStyle` 内生成 `backgroundColor` 和 `maxWidth`，渲染处只合并 token 样式、外部样式与动画样式。

### 3. 浮层 zIndex 使用硬编码偏移

- 严重程度：medium
- 位置：`packages/pennyspring-ui/src/Notification/Notification.tsx:110`
- 违反规范：`.claude/rules/component/coding-style.md` 的“Z 轴层级”；`.codex/skills/theme-tokens/SKILL.md` 的 Z 轴 token 规则
- 不符合点：`content` 使用 `zIndex: token.zIndexPopupBase + 140`。规范要求弹出层 `zIndex` 基于 `AliasToken`，禁止硬编码任意大数字；普通弹窗、Popup、Dialog 已有明确层级约定，覆盖关系应主要由 `Portal` 挂载顺序决定。
- 影响：Notification 会以任意偏移压过其他浮层层级，破坏同级浮层由挂载顺序决定覆盖关系的规则，也增加后续维护者继续叠加魔法数的风险。
- 推荐纠正方案：改为规范约定的 token 层级，例如反馈浮层统一使用 `token.zIndexPopupBase + 100`，或先在主题/规范中定义明确语义 token 后再使用；避免组件内自定义 `+ 140`。

### 4. 测试未覆盖 Notification 的完整公开可感知行为

- 严重程度：medium
- 位置：`packages/pennyspring-ui/__tests__/Notification.test.tsx:45`
- 违反规范：`CLAUDE.md` 的“测试约束”；`.claude/rules/common/testing.md` 的用户行为测试要求；`.claude/rules/typescript/testing.md`
- 不符合点：现有测试只导入并渲染 `Notification`，覆盖外部关闭、非受控计时关闭、字号和间距映射；没有覆盖 `useNotification` 暴露的 `show`、`hide`、`clear` 控制器行为，也没有覆盖受控 `open + duration` 到期时应触发 `onCancel` / `onOpenChange(false)` 的行为。
- 影响：当前测试无法保护组件最主要的命令式通知入口，也没有暴露受控模式自动关闭失效的问题，用户可感知行为存在回归风险。
- 推荐纠正方案：补充 `useNotification` 的宿主测试组件，验证 `show` 会挂载通知、`hide(key)` 和 `clear()` 会触发退出并卸载；补充受控 `open + duration` 用例，断言到期后按顺序触发 `onCancel` 与 `onOpenChange(false)`。

## 需要人工确认

- 无
