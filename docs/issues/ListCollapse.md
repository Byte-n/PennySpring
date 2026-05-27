# ListCollapse 组件规范巡检报告

## 结论

- 状态：不通过
- 严重程度：medium
- 问题数量：3

## 问题列表

### 1. 展开状态 API 未使用统一的 open/onOpenChange/defaultOpen 语义

- 严重程度：medium
- 位置：`packages/pennyspring-ui/src/ListCollapse/types.ts:29`
- 违反规范：`.claude/rules/component/coding-style.md` 的“状态与回调 API”
- 不符合点：组件公开 API 使用 `expanded`、`defaultExpanded`、`onExpandedChange` 表达展开状态；实现中也在 `packages/pennyspring-ui/src/ListCollapse/ListCollapse.tsx:104` 通过 `useState(Boolean(defaultExpanded))` 手写受控/非受控逻辑，并在 `packages/pennyspring-ui/src/ListCollapse/ListCollapse.tsx:111` 到 `packages/pennyspring-ui/src/ListCollapse/ListCollapse.tsx:117` 手动判断 `expanded === undefined` 后触发 `onExpandedChange`。规范要求可见状态统一使用 `open`、`onOpenChange`、`defaultOpen`，并通过 `useControllableValue(props.defaultValue, props.value, props.onChange)` 这类统一 hook 处理受控和非受控判断。
- 影响：ListCollapse 的受控 API 与 Popup、Dialog、Drawer 等公开可见状态组件不一致，调用方需要记忆额外命名；手写受控逻辑也容易和项目统一 hook 的行为分叉，降低 API 一致性和维护性。
- 推荐纠正方案：将公开状态 API 调整为 `open?: boolean`、`defaultOpen?: boolean`、`onOpenChange?: (open: boolean) => void`，并在实现中复用 `useControllableValue(defaultOpen, open, onOpenChange)`。如需兼容旧 API，应明确迁移策略并在测试中覆盖新旧行为。

### 2. size 只部分影响样式，normal 与 large 的内部间距一致

- 严重程度：medium
- 位置：`packages/pennyspring-ui/src/ListCollapse/ListCollapse.tsx:22`
- 违反规范：`.claude/rules/component/coding-style.md` 的“尺寸 API”；`.claude/rules/common/component-visual-layout.md` 的“Size 与间距 Token”
- 不符合点：组件暴露 `size?: ComponentSize`，但样式中 `slotGap` 只区分 `small` 与非 `small`，`normal` 和 `large` 都使用 `token.marginSM`；`content` 的 `paddingHorizontal: token.paddingMD`、`paddingVertical: token.paddingMD / 2` 在 `packages/pennyspring-ui/src/ListCollapse/ListCollapse.tsx:56` 到 `packages/pennyspring-ui/src/ListCollapse/ListCollapse.tsx:60` 对三个尺寸完全一致。规范要求有 `size` 的容器、布局、展示组件必须完整响应尺寸变化，包括边距、字号等与尺寸语义相关的样式，并按语义选择 spacing token。
- 影响：调用方选择 `large` 时只有 header 高度变化，内容区 padding 与槽间距仍沿用 normal，外层和内层尺寸语义不一致，容易造成同一组件不同尺寸下的视觉密度不稳定。
- 推荐纠正方案：为 `small`、`normal`、`large` 分别定义基于 `AliasToken` 的 header 间距、内容区 padding、槽间距和必要的文字尺寸映射；垂直 padding 继续使用同语义水平 token 的 `/ 2` 计算，并通过 `createUseSheetStyle<ListCollapseStyleOptions>` 的 options 传入 `size`。

### 3. summary 可见文本槽未按文本/节点分离规则处理

- 严重程度：medium
- 位置：`packages/pennyspring-ui/src/ListCollapse/types.ts:25`
- 违反规范：`.claude/rules/component/coding-style.md` 的“内部渲染节点”；`CLAUDE.md` 的“组件约束”
- 不符合点：`summary?: ReactNode` 作为公开可见槽位既允许传入字符串，又允许传入自定义节点，但没有对应的 `summaryText?: string` 文本 prop；实现中在 `packages/pennyspring-ui/src/ListCollapse/ListCollapse.tsx:147` 到 `packages/pennyspring-ui/src/ListCollapse/ListCollapse.tsx:149` 直接把 `summary` 放进 `View`，没有像 `titleText` 一样通过项目 `Text` 组件渲染文本。规范要求内部节点同时支持文本和自定义节点时，文本 prop 使用 `xxxText`，节点 prop 使用 `xxx`；展示文本统一使用项目 `Text` 组件。
- 影响：调用方自然传入 `summary="..."` 时，字符串会成为 `View` 的直接子节点，不符合 React Native 文本渲染约束，也绕过项目 `Text` 组件的字号、颜色和主题语义，导致运行时表现和视觉一致性不可控。
- 推荐纠正方案：新增 `summaryText?: string` 作为文本入口，并保留 `summary?: ReactNode | null` 作为节点槽；实现中对 `summaryText` 使用项目 `Text` 组件渲染，对 `summary={null}` 明确不渲染该槽位，同时补充字符串 summary、节点 summary 和 null summary 的测试。

## 需要人工确认

- 无
