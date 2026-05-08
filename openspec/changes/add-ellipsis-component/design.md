## Context

PennySpring 的共享组件位于 `packages/component/src/<ComponentName>/`，公共 props 与 styles 类型放在组件目录 `types.ts`，并由包级 `src/index.ts` 导出。组件视觉和布局必须通过 `createUseSheetStyle` 消费 `@pennyspring/theme` token，文本展示必须使用包内 `Text` 组件。

Ant Design Mobile 的 Web Ellipsis 参考实现依赖 DOM 测量、`offsetHeight` 和二分裁剪。React Native 没有稳定可移植的 DOM 高度测量 API，因此本组件采用 RN 原生文本截断能力。

## Goals / Non-Goals

**Goals:**

- 提供 `Ellipsis` 组件，API 对齐任务要求并符合 PennySpring 组件目录与导出模式。
- 使用 `Text numberOfLines` 和 `ellipsizeMode` 支持尾部、头部和中间截断。
- 支持内部非受控展开/收起状态，`defaultExpanded` 控制初始状态。
- 使用 `Pressable` 渲染展开/收起动作节点，并在状态变化时调用 `onExpand(expanded, info)`。
- 支持 `onContentClick` 响应文本内容点击。
- 提供 `size?: EllipsisSize`，类型为 `'small' | 'normal' | 'large'`，默认 `normal`。
- 提供 `style` 根样式和 `styles` 插槽覆盖，默认样式全部由 token 构建。

**Non-Goals:**

- 不实现 Web DOM 二分裁剪算法。
- 不保证展开/收起动作节点与被截断文本在同一行精确拼接。
- 不提供受控 `expanded` 状态；当前需求只包含 `defaultExpanded`。
- 不新增 accessibility props。

## Decisions

1. **使用 RN 原生截断能力**

   `direction='end'` 映射为 `ellipsizeMode='tail'`，`direction='start'` 映射为 `head`，`direction='middle'` 映射为 `middle`。折叠状态下设置 `numberOfLines={rows}`，展开状态下不设置 `numberOfLines`，让文本完整显示。

   替代方案是通过 `onTextLayout` 估算行数并手动裁剪字符串，但不同平台、字体和 emoji/组合字符都会增加复杂度和不稳定性。本变更选择 RN 内建行为。

2. **动作节点作为独立 `Pressable`**

   `expandText` 和 `collapseText` 为 `ReactNode`。当折叠时渲染 `expandText`，展开时渲染 `collapseText`；为空时不渲染动作节点。动作点击只切换内部展开状态并触发 `onExpand`，不会触发 `onContentClick`。

   动作节点使用 `Pressable`，其中字符串或数字节点包装为包内 `Text`。自定义 ReactNode 原样渲染。

3. **点击文本内容**

   内容区域由包内 `Text` 渲染，并通过 `onPress` 调用 `onContentClick`。回调签名使用 React Native 的 `GestureResponderEvent`，保持 RN 语义。

4. **样式与尺寸**

   `small`、`normal`、`large` 映射到 `Text` 的 `sm`、`md`、`lg` 尺寸，并在内部 token 样式中设置文本颜色、字体、行高、动作间距和 pressed 状态。`style` 作用于根容器，`styles.content`、`styles.action`、`styles.actionText`、`styles.actionPressed` 提供稳定插槽覆盖。

## Risks / Trade-offs

- [Risk] RN 的 `ellipsizeMode='head'` 和 `middle` 在多行文本上的平台表现可能存在差异。→ Mitigation：组件只声明使用 RN 原生能力，不额外承诺跨平台手工裁剪一致性。
- [Risk] 动作节点独立显示，不能像 Web 参考实现那样参与截断测量。→ Mitigation：在规格中明确动作节点为独立 `Pressable`，避免不稳定测量。
- [Risk] `rows` 传入非法数字会导致 RN 行数行为不确定。→ Mitigation：运行时将非正数或非有限值归一为默认 `1`。
