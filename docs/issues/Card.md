# Card 组件规范巡检报告

## 结论

- 状态：不通过
- 严重程度：medium
- 问题数量：2

## 问题列表

### 1. `null` 插槽会留下空 header 或 footer 结构

- 严重程度：medium
- 位置：`packages/pennyspring-ui/src/Card/Card.tsx:148`、`packages/pennyspring-ui/src/Card/Card.tsx:149`、`packages/pennyspring-ui/src/Card/Card.tsx:175`、`packages/pennyspring-ui/src/Card/Card.tsx:192`
- 违反规范：`.claude/rules/component/coding-style.md` 的内部渲染节点规则
- 不符合点：规范要求 `xxx`、`xxxRender` 和其他插槽类 prop 为 `null` 时表示明确不渲染该部分内容；当结构插槽的所有可见内容都被置为 `null` 时，外层结构也不渲染。当前 `shouldRenderHeader` 只判断 `title !== undefined || titleText !== undefined || extra !== undefined`，因此 `title={null}` 或 `extra={null}` 会被视为需要渲染 header；`shouldRenderFooter` 只判断 `footer !== undefined`，因此 `footer={null}` 会渲染一个带 `borderTopWidth`、`marginTop`、`paddingTop` 的空 footer。
- 影响：调用方用 `null` 显式关闭标题或底部时，Card 仍会保留空容器、边框和间距，造成不必要的视觉留白，并与项目统一的 slot null 语义不一致。
- 推荐纠正方案：区分 `undefined` 与 `null` 的插槽语义。`title={null}` 且没有 `titleText`、`extra` 时不渲染 header；`extra={null}` 不渲染 extra；`footer={null}` 不渲染 footer。补充测试覆盖 `title={null}`、`extra={null}`、`footer={null}` 的结构和间距行为。

### 3. `title` 节点 API 允许字符串绕过内部 Text 渲染

- 严重程度：medium
- 位置：`packages/pennyspring-ui/src/Card/types.ts:50`、`packages/pennyspring-ui/src/Card/types.ts:56`、`packages/pennyspring-ui/src/Card/Card.tsx:161`、`packages/pennyspring-ui/src/Card/Card.tsx:162`、`packages/pennyspring-ui/__tests__/Card.test.tsx:26`
- 违反规范：`CLAUDE.md` 的组件约束；`.claude/rules/component/coding-style.md` 的内部渲染节点规则
- 不符合点：Card 已提供 `titleText?: string` 并在 `Card.tsx:166-168` 用内部 `Text` 渲染，但 `title?: ReactNode` 仍允许字符串，且 `renderTitle()` 在 `title !== undefined` 时直接返回 `title`。现有测试也用 `title: 'Balance'` 验证标题内容。规范要求展示文本统一使用组件库 `Text`，内部节点同时支持文本和自定义节点时，文本 prop 使用 `xxxText`，节点 prop 使用 `xxx`；字符串标题应走 `titleText`，而不是作为 `title` 节点直接渲染。
- 影响：调用方传 `title="Balance"` 时，Card 会把字符串放进 `View` 的标题容器中，绕过 `Text` 的字号、颜色、主题和文本语义控制；在 React Native 中这类裸字符串也容易产生运行时渲染问题。
- 推荐纠正方案：将字符串标题用法收敛到 `titleText`，测试改为 `titleText="Balance"`；对 `title` 的运行时渲染可在遇到字符串时转交给内部 `Text`，或在公共类型/文档中明确 `title` 仅接受自定义 React 节点并避免示例使用字符串。

## 需要人工确认

- 无
