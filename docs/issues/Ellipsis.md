# Ellipsis 组件规范巡检报告

## 结论

- 状态：通过
- 严重程度：high
- 问题数量：4

## 问题列表

### 1. 截断二分搜索会把已知溢出的候选长度作为最终结果 ✅

- 严重程度：high
- 位置：`packages/pennyspring-ui/src/Ellipsis/Ellipsis.tsx:161`
- 违反规范：`CLAUDE.md` 测试约束“测试默认只编写用户可感知的行为断言”；`.claude/rules/common/coding-style.md` Error Handling / Code Quality Checklist；`.claude/rules/common/component-visual-layout.md` 通用交互“状态变化不得导致布局尺寸跳动”
- 不符合点：`handleSearchTextLayout` 在候选文本溢出时把搜索区间更新为 `[low, mid]`，说明 `high` 侧是溢出边界；但收敛时在 `packages/pennyspring-ui/src/Ellipsis/Ellipsis.tsx:178` 到 `packages/pennyspring-ui/src/Ellipsis/Ellipsis.tsx:180` 使用 `setMaxChars(searchHigh)`。这会选择可能已被 `lineCount > safeRows` 判定为溢出的长度，而不是最后一个可容纳的 `searchLow`。
- 影响：Ellipsis 的核心行为是把长文本限制在指定 `rows` 内；当前算法可能渲染超过行数的文本，展开/收起前后的可见高度也可能发生跳动。现有测试 `packages/pennyspring-ui/__tests__/Ellipsis.test.tsx:119` 到 `packages/pennyspring-ui/__tests__/Ellipsis.test.tsx:122` 只断言包含省略号和长度变短，没有断言最终候选确实不超过 `rows`。
- 推荐纠正方案：保持二分搜索不变量，溢出时收缩上界、可容纳时推进下界，收敛后使用最后一个可容纳长度，例如 `setMaxChars(searchLow)`；同时补充测试，模拟边界候选溢出并断言最终展示文本对应的候选不超过目标 `rows`。

### 2. 测量文本未包含最终渲染的省略号与展开操作文本 ✅

- 严重程度：medium
- 位置：`packages/pennyspring-ui/src/Ellipsis/Ellipsis.tsx:250`
- 违反规范：`.claude/rules/common/component-visual-layout.md` 通用交互“状态变化不得导致布局尺寸跳动”；`.claude/rules/component/coding-style.md` 样式实现“行为关键的布局、动画、无障碍和测量样式应由组件自身持有”
- 不符合点：搜索候选只由 `content.slice(...)` 组成，见 `packages/pennyspring-ui/src/Ellipsis/Ellipsis.tsx:250` 到 `packages/pennyspring-ui/src/Ellipsis/Ellipsis.tsx:258`；但最终展示会在 `packages/pennyspring-ui/src/Ellipsis/Ellipsis.tsx:201` 到 `packages/pennyspring-ui/src/Ellipsis/Ellipsis.tsx:213` 追加 `ELLIPSIS_TEXT`，并在 `packages/pennyspring-ui/src/Ellipsis/Ellipsis.tsx:230` 到 `packages/pennyspring-ui/src/Ellipsis/Ellipsis.tsx:236` 额外渲染 `expandText` 操作。测量对象与真实渲染对象不一致。
- 影响：即使二分搜索找到的内容片段本身能放入 `rows`，追加 `...` 或“展开”文案后仍可能多出一行，导致组件承诺的折叠行数不可靠，影响列表、卡片等密集界面的稳定布局。
- 推荐纠正方案：测量候选应与最终折叠态渲染文本一致，把省略号和可见操作文案纳入测量；或将操作区设计为不参与行数限制的独立布局并在 API / docs 中明确说明。对应测试应覆盖带 `expandText` 的截断场景。

### 3. `size` 只影响隐藏测量文本和操作文本，未作用到可见正文 ✅

- 严重程度：medium
- 位置：`packages/pennyspring-ui/src/Ellipsis/Ellipsis.tsx:221`
- 违反规范：`.claude/rules/component/coding-style.md` 尺寸 API“组件应在内部完整实现受支持尺寸”“组件内部使用的其他组件如果也有 size，必须随外层 size 传递或映射”；`CLAUDE.md` 组件约束“Text 字号、颜色等优先使用 TextProps 实现，其次再是 style”
- 不符合点：组件定义了 `SIZE_CONFIG` 并在 `styles.content` 中根据 `size` 生成字号和行高，见 `packages/pennyspring-ui/src/Ellipsis/Ellipsis.tsx:25` 到 `packages/pennyspring-ui/src/Ellipsis/Ellipsis.tsx:50`；但可见正文渲染为 `<Text data-testid=...>`，见 `packages/pennyspring-ui/src/Ellipsis/Ellipsis.tsx:221` 到 `packages/pennyspring-ui/src/Ellipsis/Ellipsis.tsx:224`，没有传递 `size`，也没有应用 `styles.content`。`Text` 自身支持 `size` prop，见 `packages/pennyspring-ui/src/Text/types.ts:36` 到 `packages/pennyspring-ui/src/Text/types.ts:42`。
- 影响：调用方传入 `size="small"` 或 `size="large"` 时，可见正文仍按 `Text` 默认尺寸渲染，而测量文本按 Ellipsis 的 `size` 计算，可能造成视觉尺寸不一致和截断计算失真。
- 推荐纠正方案：将 Ellipsis 的 `small` / `normal` / `large` 映射到 `Text` 的 `sm` / `md` / `lg` 并传给可见正文；只有无法通过 `TextProps` 表达的样式再使用 `style`。同时增加 size 行为测试，断言正文 Text 接收到预期尺寸或渲染样式。

### 4. 展开状态的受控 API 未使用项目统一命名 ✅

- 严重程度：medium
- 位置：`packages/pennyspring-ui/src/Ellipsis/types.ts:18`
- 违反规范：`.claude/rules/component/coding-style.md` 状态与回调 API“可见状态统一使用 open、onOpenChange 和 defaultOpen”“值或主要值统一使用 value、onChange 和 defaultValue”；用户任务输入“可控/非可控 API 是否使用 value、onChange、defaultValue 或 open、onOpenChange、defaultOpen”
- 不符合点：Ellipsis 暴露 `defaultExpanded`、`expanded`、`onExpand`，见 `packages/pennyspring-ui/src/Ellipsis/types.ts:18` 到 `packages/pennyspring-ui/src/Ellipsis/types.ts:23`，实现中也将这组三元组传入 `useControllableValue`，见 `packages/pennyspring-ui/src/Ellipsis/Ellipsis.tsx:106` 到 `packages/pennyspring-ui/src/Ellipsis/Ellipsis.tsx:109`。这与项目统一的受控 / 非受控状态命名不一致。
- 影响：调用方在共享组件之间无法复用统一心智模型，表单、浮层和展示组件的受控模式不一致，后续组合和文档维护成本上升。
- 推荐纠正方案：为展开状态提供符合规范的 `open` / `defaultOpen` / `onOpenChange`，或若团队判定 Ellipsis 的“展开”是主要值而非可见状态，则使用 `value` / `defaultValue` / `onChange`。如需兼容旧 API，应标记旧命名为 deprecated，并在测试中覆盖新旧 API 行为。

## 需要人工确认

- 无
