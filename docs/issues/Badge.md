# Badge 组件规范巡检报告

## 结论

- 状态：不通过
- 严重程度：medium
- 问题数量：2

## 问题列表

### 1. 默认颜色语义被解析为错误色

- 严重程度：medium
- 位置：`packages/pennyspring-ui/src/Badge/Badge.tsx:141`
- 违反规范：`packages/pennyspring-ui/docs/guide/component-color-design.md` 的 Badge 颜色类型边界与表面组件映射职责；`.claude/rules/common/component-visual-layout.md` 的克制、清晰、可信工具型界面要求
- 不符合点：`BadgeProps.color` 默认值是 `'default'`（`packages/pennyspring-ui/src/Badge/Badge.tsx:289`），`BadgeSemanticColor` 同时声明了 `'default'` 与 `'danger'` 两个语义（`packages/pennyspring-ui/src/Badge/types.ts:6`），但 `resolveColorConfig` 没有处理 `'default'`，最终落入 fallback 并返回 `token.colorError`（`packages/pennyspring-ui/src/Badge/Badge.tsx:141`）。这会让未指定 color 的默认 Badge 呈现错误/危险语义，且与已存在的 `danger -> token.colorError` 分支（`packages/pennyspring-ui/src/Badge/Badge.tsx:123`）混同。
- 影响：默认徽标会错误传达危险状态，破坏 Badge 作为计数或状态标记的语义可信度，也让 `default` 与 `danger` 两个公共 API 语义不可区分。
- 推荐纠正方案：为 `color === 'default'` 增加显式中性色映射，例如使用 `token.colorText`、`token.colorFill` 或与 Badge 默认视觉匹配的 AliasToken 组合；保留 `danger` 使用 `token.colorError`。同时补充测试覆盖未传 `color`、`color="default"` 与 `color="danger"` 的可区分样式结果。

### 2. 隐藏徽标时会把被包裹内容一起移除

- 严重程度：medium
- 位置：`packages/pennyspring-ui/src/Badge/Badge.tsx:311`
- 违反规范：`.claude/rules/common/component-visual-layout.md` 的“状态变化不得导致布局尺寸跳动”；`.claude/rules/component/coding-style.md` 的组件必须自行完整持有状态表现；`.claude/rules/common/testing.md` 的测试默认只编写用户可感知的行为断言
- 不符合点：`shouldRenderBadge` 在 `count` 为 `undefined`、`null`、`false` 或 `0` 且 `showZero=false` 时返回 `false`（`packages/pennyspring-ui/src/Badge/Badge.tsx:186`、`packages/pennyspring-ui/src/Badge/Badge.tsx:190`），组件随后直接 `return null`（`packages/pennyspring-ui/src/Badge/Badge.tsx:311`）。由于带 children 的正常渲染路径在 `return` 中才渲染 children（`packages/pennyspring-ui/src/Badge/Badge.tsx:322`），隐藏徽标会连同 `<Badge><Avatar /></Badge>` 这类被包裹内容一起移除。现有示例多处把 Badge 作为 Avatar 包裹器使用（`packages/pennyspring-ui/examples/previews/foundation/badge/demos/count-and-dot.tsx:10`），但测试只覆盖无 children 时缺省 count 渲染为空（`packages/pennyspring-ui/__tests__/Badge.test.tsx:91`），未覆盖带 children 时隐藏徽标仍保留 children 的用户可感知行为。
- 影响：当计数从正数变为 0 或未加载完成时，头像、按钮或其它被 Badge 包裹的主体会消失，造成布局大幅跳动和内容丢失。
- 推荐纠正方案：将“是否渲染徽标指示器”和“是否渲染根节点/children”分离；当 `hasChildren` 为 `true` 且 `shouldRender` 为 `false` 时仍渲染外层和 children，只省略 `badgeNode`。补充测试覆盖带 children 的 `count={0}`、缺省 count、`count={null}` 等场景，验证 children 保留且 indicator 不渲染。

## 需要人工确认

- 无

