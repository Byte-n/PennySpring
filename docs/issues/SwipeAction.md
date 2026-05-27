# SwipeAction 组件规范巡检报告

## 结论

- 状态：不通过
- 严重程度：medium
- 问题数量：6

## 问题列表

### 1. 样式实现未放入组件样式文件

- 严重程度：low
- 位置：`packages/pennyspring-ui/src/SwipeAction/SwipeAction.tsx:77`
- 违反规范：`.claude/rules/component/coding-style.md` 目录与导出（样式文件：`style/index.ts`）
- 不符合点：`SwipeAction` 在组件实现文件内直接定义 `useStyles`，组件目录实际只包含 `SwipeAction.tsx`、`index.ts`、`types.ts`，缺少规范要求的 `style/index.ts`。
- 影响：样式 token、尺寸映射与手势/动画逻辑耦合，后续维护视觉规范时容易扩大修改范围。
- 推荐纠正方案：新增 `packages/pennyspring-ui/src/SwipeAction/style/index.ts`，将 `SIZE_STYLE_MAP`、`SwipeActionStyleOptions` 和 `createUseSheetStyle` 样式定义迁移到该文件，组件实现只消费样式 hook。

### 2. 动作项暴露原始 `backgroundColor` 字符串并直接写入样式

- 严重程度：high
- 位置：`packages/pennyspring-ui/src/SwipeAction/types.ts:24`
- 违反规范：`CLAUDE.md` 样式约束；`.claude/rules/component/coding-style.md` 样式 API；`.claude/rules/common/component-visual-layout.md` Token 边界
- 不符合点：`SwipeActionAction` 暴露 `backgroundColor?: string`，实现中在 `SwipeAction.tsx:541` 将该字符串直接转换为 `{ backgroundColor: action.backgroundColor }` 样式，绕过了 `AliasToken` 和语义色 `color` 映射。
- 影响：调用方可以传入任意硬编码颜色，导致深浅色模式、品牌主题和动作语义色无法保持一致。
- 推荐纠正方案：移除或废弃 `backgroundColor`，只保留 `color?: SwipeActionColor` 这类语义色 API；确需业务语义色时由业务层扩展 token 后通过语义映射进入组件。

### 3. 运行时构造动态样式对象，未通过 `createUseSheetStyle` options 管理

- 严重程度：medium
- 位置：`packages/pennyspring-ui/src/SwipeAction/SwipeAction.tsx:276`
- 违反规范：`CLAUDE.md` 动态样式；`.codex/skills/theme-tokens/SKILL.md` API
- 不符合点：预设色动作背景返回 `{ backgroundColor: token[`${color}6`] }`，自定义背景返回 `{ backgroundColor: action.backgroundColor }`，这些动态样式对象随后进入 `style` 数组，而不是通过 `createUseSheetStyle<TOptions>` 的 options 生成。
- 影响：动态视觉状态分散在渲染逻辑中，难以统一审计 token 使用，也削弱主题切换时样式来源的一致性。
- 推荐纠正方案：将动作颜色作为样式 hook 的 options 或建立 token 样式映射，所有背景色样式均由 `createUseSheetStyle` 产出。

### 4. `Text` 字号和颜色优先通过 `style` 设置

- 严重程度：medium
- 位置：`packages/pennyspring-ui/src/SwipeAction/SwipeAction.tsx:573`
- 违反规范：`CLAUDE.md` 组件约束；`.claude/rules/component/coding-style.md` 内部渲染节点
- 不符合点：动作文本使用 `Text` 组件，但字号、行高和颜色通过 `tokenStyles.actionText`、`textColorStyle`、`tokenStyles.actionTextDisabled` 作为 `style` 传入；项目要求 `Text` 字号、颜色等优先使用 `TextProps` 实现，其次才是 `style`。
- 影响：文本排版和颜色语义绕过 `Text` 的公开 API，容易与其它组件的文本和图标颜色语义漂移。
- 推荐纠正方案：将 `SwipeAction.size` 映射到 `Text` 的 `size` prop，将动作颜色/禁用状态映射到 `Text` 的 `color` prop；外部 `styles?.actionText` 仅作为补充覆盖。

### 5. 动作文本与自定义节点插槽语义不符合规范

- 严重程度：medium
- 位置：`packages/pennyspring-ui/src/SwipeAction/types.ts:21`
- 违反规范：`.claude/rules/component/coding-style.md` 内部渲染节点
- 不符合点：动作项同时支持文本和自定义节点时使用 `text?: string` 与 `content?: ReactNode`，而规范要求文本 prop 使用 `xxxText`、节点 prop 使用 `xxx`；实现中 `SwipeAction.tsx:572` 使用 `action.content ?? action.text`，导致 `content={null}` 会回退渲染 `text`，且自定义 `content` 会被包在 `Text` 内渲染。
- 影响：调用方无法通过 `content={null}` 明确不渲染该插槽，自定义节点也会被错误地套用文本容器与文本样式，API 语义不稳定。
- 推荐纠正方案：将动作项 API 调整为语义清晰的 `actionText?: string` 与 `action?: ReactNode | null`（或同等命名），`null` 明确不渲染，`undefined` 才走默认文本回退；自定义节点应直接渲染，不包裹在 `Text` 中。

### 6. 动作按钮缺少 pressed 视觉状态

- 严重程度：medium
- 位置：`packages/pennyspring-ui/src/SwipeAction/SwipeAction.tsx:560`
- 违反规范：`.claude/rules/common/component-visual-layout.md` 通用交互；`.claude/rules/component/coding-style.md` 样式实现
- 不符合点：动作项使用 `Pressable`，但 `style` 是静态数组，未根据 `pressed` 状态切换视觉样式；当前只表达了 disabled 状态。
- 影响：用户点击滑动动作时缺少即时反馈，不符合交互状态由组件自身完整表达的要求。
- 推荐纠正方案：为动作项增加 token 驱动的 pressed 状态样式，例如基于语义色的 active/hover token 或统一的 `controlItemBgActive` 映射，并通过 `Pressable` 的 pressed 回调合并。

## 需要人工确认

- 无
