# FloatingActionGroup 组件规范巡检报告

## 结论

- 状态：不通过
- 严重程度：medium
- 问题数量：3

## 问题列表

### 1. 浮动操作按钮尺寸被硬编码为 large，组件未提供规范 size API

- 严重程度：medium
- 位置：`packages/pennyspring-ui/src/FloatingActionGroup/FloatingActionGroup.tsx:115`
- 违反规范：`.claude/rules/component/coding-style.md` 的”尺寸 API”；`packages/pennyspring-ui/src/shares/types.ts:1`
- 不符合点：`FloatingActionButton` 内部固定向 `Button` 传入 `size=”large”`，而 `FloatingActionGroupProps` 在 `packages/pennyspring-ui/src/FloatingActionGroup/types.ts:29` 起没有提供 `size?: ComponentSize`。`FloatingActionItem.buttonProps` 虽然没有排除 `ButtonProps.size`，但 `FloatingActionButton` 在展开 `restButtonProps` 后又写入 `size=”large”`，调用方传入的 `buttonProps.size` 也会被覆盖。
- 影响：浮动操作入口属于明确尺寸语义的交互控件，但无法按项目统一的 `small`、`normal`、`large` 尺寸体系配置，默认也不是规范要求的 `normal`，会导致内外组件尺寸语义不一致。
- 推荐纠正方案：在 `types.ts` 为 `FloatingActionGroupProps` 增加 `size?: ComponentSize`，默认值设为 `normal`；通过 `createUseSheetStyle<TOptions>` 将 `size` 映射到高度、内边距、图标和圆角等 token；内部 `Button` 的 `size` 应随外层 `size` 传递或明确映射，并从 `buttonProps` 中排除或合并 `size`，避免调用方传入后被静默覆盖。

### 2. 隐藏按钮动画阴影未使用 toShadowStyle

- 严重程度：medium
- 位置：`packages/pennyspring-ui/src/FloatingActionGroup/FloatingActionGroup.tsx:192`
- 违反规范：`CLAUDE.md` 的“样式约束（React Native）”；`.codex/skills/theme-tokens/SKILL.md` 的“RN 踩坑”
- 不符合点：`HiddenActionItem` 在 `useAnimatedStyle` 中读取 `token.boxShadowSecondary`，手动映射 `shadowColor`、`shadowOffset`、`shadowRadius`、`elevation`、`shadowOpacity`。项目规范要求阴影必须经 `toShadowStyle(...)`，不得直接使用 `boxShadow*` 作为 ViewStyle。
- 影响：阴影样式绕过统一转换入口，后续 `boxShadow*` 结构或 RN 平台适配变化时容易产生实现漂移；动画阴影透明度也缺少与默认阴影转换逻辑的统一基线。
- 推荐纠正方案：先用 `toShadowStyle(token.boxShadowSecondary)` 得到基础阴影样式，再只对确需动画化的 `shadowOpacity` 做受控覆盖；如果 Reanimated 对对象展开有限制，应提取明确的局部工具函数封装转换逻辑，而不是在组件内散落手动字段映射。

### 3. 公开 styles 插槽将可见根节点命名为 container

- 严重程度：low
- 位置：`packages/pennyspring-ui/src/FloatingActionGroup/types.ts:23`
- 违反规范：`.claude/rules/component/coding-style.md` 的“样式 API”
- 不符合点：`FloatingActionGroupStyles` 暴露 `container?: StyleProp<ViewStyle>`，并在 `packages/pennyspring-ui/src/FloatingActionGroup/FloatingActionGroup.tsx:326` 将 `styles?.container` 合并到可见外层根节点。组件规范要求可见内部根节点统一使用 `root`。
- 影响：样式 API 命名与其他组件的语义插槽约定不一致，增加调用方迁移和组件组合时的认知成本。
- 推荐纠正方案：将外层根节点插槽调整为 `styles.root`；若需要兼容旧 API，可短期保留 `container` 并在内部合并，但公开文档与新用法应统一到 `root`。

## 需要人工确认

- 无
