# Message 组件规范巡检报告

## 结论

- 状态：通过
- 严重程度：high
- 问题数量：3

## 问题列表

### 1. 受控模式下 duration 自动关闭不会触发关闭意图回调 ✅

- 严重程度：high
- 位置：`packages/pennyspring-ui/src/Message/Message.tsx:255`
- 违反规范：`.claude/rules/component/coding-style.md` 状态与回调 API；`CLAUDE.md` 组件约束
- 不符合点：`MessageBody` 的定时器在 `duration` 到期后调用 `onCloseStart`（`packages/pennyspring-ui/src/Message/Message.tsx:165`），但 `Message` 的 `handleCloseStart` 在受控模式下直接 `return`（`packages/pennyspring-ui/src/Message/Message.tsx:255`），不会调用 `onCancel` 或 `onOpenChange(false)`。可见状态规范要求使用 `open`、`onOpenChange` 并同时支持可控和非可控模式；受控组件不能自行改 `open`，但必须通过回调把关闭意图通知调用方。
- 影响：调用方使用 `<Message open duration={...} onOpenChange={...} />` 时，duration 到期后不会收到 `onOpenChange(false)`，因此无法更新外部 `open` 状态，消息会停留或关闭语义失效，用户可感知行为与公开 API 不一致。
- 推荐纠正方案：将受控与非受控关闭意图拆开处理：duration 到期时先触发语义动作 `onCancel?.()`，再触发 `onOpenChange?.(false)`；仅在非受控模式下调用 `setResolvedOpen(false)`。同时补充受控 `duration` 到期会请求关闭的测试。

### 2. 弹层 zIndex 使用任意偏移量，未按组件 z 轴规范取值 ✅

- 严重程度：medium
- 位置：`packages/pennyspring-ui/src/Message/Message.tsx:84`
- 违反规范：`.claude/rules/component/coding-style.md` Z 轴层级；`.codex/skills/theme-tokens/SKILL.md` AliasToken 分类索引
- 不符合点：`content` 样式使用 `zIndex: token.zIndexPopupBase + 120`。组件 z 轴规范要求弹出层基于 `AliasToken`，普通弹窗、Picker 和其他同级浮层默认使用 `token.zIndexPopupBase`，Popup/Dialog 类使用 `token.zIndexPopupBase + 100`，同层级覆盖关系由 `Portal` 挂载顺序决定。`+ 120` 是组件内自定义任意层级，规范未定义该偏移。
- 影响：Message 会人为高于同类浮层，破坏由 Portal 挂载顺序决定覆盖关系的约定，后续新增浮层时难以预测遮挡顺序。
- 推荐纠正方案：按 Message 的浮层语义选择规范层级，通常使用 `token.zIndexPopupBase`；若确认应与 Popup/Dialog 同级，则使用 `token.zIndexPopupBase + 100`，不要引入额外任意偏移。

### 3. `useMessage` 公开控制器缺少关键用户可感知行为测试 ✅

- 严重程度：medium
- 位置：`packages/pennyspring-ui/src/Message/types.ts:43`
- 违反规范：`CLAUDE.md` 测试约束；`.claude/rules/common/testing.md`；`.claude/rules/typescript/testing.md`
- 不符合点：`MessageController` 公开了 `show`、`hide`、`clear`（`packages/pennyspring-ui/src/Message/types.ts:43`），实现位于 `packages/pennyspring-ui/src/Message/Message.tsx:287`，但 `packages/pennyspring-ui/__tests__/Message.test.tsx` 只覆盖 `<Message />` 组件本体；仓内检索 `useMessage` 仅出现在导出和实现中，没有测试覆盖控制器的 `show`、`hide`、`clear`、duration 自动退出或缺少 `PortalProvider` 时的行为。
- 影响：`useMessage` 是组件的公开 API，直接影响全局反馈消息的展示和关闭。缺少测试会让控制器挂载、关闭动画、自动退出和清空逻辑的回归无法被及时发现。
- 推荐纠正方案：在 `packages/pennyspring-ui/__tests__/Message.test.tsx` 中增加使用 `PortalProvider` 的 hook/测试宿主组件，按 AAA 结构覆盖 `show` 渲染消息、`hide` 触发退出并卸载、`clear` 清空多个消息、duration 到期自动退出，以及无 `PortalProvider` 时抛出明确错误。

## 需要人工确认

- 无
