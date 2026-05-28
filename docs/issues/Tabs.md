# Tabs 组件规范巡检报告

## 结论

- 状态：通过
- 严重程度：medium
- 问题数量：5
- 修复数量：5

## 问题列表

### 1. 样式实现未放入组件样式文件

- 严重程度：low
- 位置：`packages/pennyspring-ui/src/Tabs/Tabs.tsx:81`
- 违反规范：`.claude/rules/component/coding-style.md` 目录与导出（样式文件：`style/index.ts`）
- 不符合点：`Tabs` 在组件实现文件内直接定义 `useStyles`，组件目录实际只包含 `Tabs.tsx`、`index.ts`、`types.ts`，缺少规范要求的 `style/index.ts`。
- 影响：样式 token、尺寸映射与渲染逻辑耦合，后续维护视觉规范时容易扩大修改范围。
- 推荐纠正方案：新增 `packages/pennyspring-ui/src/Tabs/style/index.ts`，将 `SIZE_STYLE_MAP`、`TabsStyleOptions` 与 `createUseSheetStyle` 样式定义迁移到该文件，组件实现只消费样式 hook。
- 状态：已修复
- 修复方式：新建 `style/index.ts`，迁移 `SIZE_STYLE_MAP`、`TabsStyleOptions`、`SizeStyleConfig` 和 `useStyles`；组件改为从 `./style` 导入 `useStyles`。

### 2. 使用 `View` 手写等效布局结构

- 严重程度：medium
- 位置：`packages/pennyspring-ui/src/Tabs/Tabs.tsx:182`
- 违反规范：`CLAUDE.md` 组件约束；`.codex/skills/component-composer/SKILL.md` 工作流程
- 不符合点：根节点、非滚动标签列表和内容面板使用 `View` 搭配 `flexDirection`、`flexWrap`、`alignItems`、`gap` 等样式手写布局，而项目要求共享组件布局优先使用 `Row`、`Column`、`Space`、`Spacer`、`Grid`、`GeometryReader` 等已有布局组件。
- 影响：布局语义无法复用统一布局组件，后续间距、对齐和尺寸语义容易与其它组件漂移。
- 推荐纠正方案：根布局和面板容器改用 `Column`，标签列表在非滚动场景优先用 `Row` 或 `Space` 表达；滚动场景可保留 `ScrollView`，但内部内容布局仍应尽量通过布局原语承载。
- 状态：已修复
- 修复方式：根布局改用 `Column`，非滚动标签列表改用 `Row`（`wrap` 属性交由 Row 管理），`ScrollView` 场景保留但内部由 `renderItems()` 统一渲染。

### 3. 标签 API 使用 `label?: ReactNode`，未区分文本 prop 与节点 prop

- 严重程度：medium
- 位置：`packages/pennyspring-ui/src/Tabs/types.ts:17`
- 违反规范：`.claude/rules/component/coding-style.md` 内部渲染节点
- 不符合点：`TabsItem` 只提供 `label?: ReactNode`，实现中在 `Tabs.tsx:65` 根据 `string | number | ReactNode` 分支渲染；规范要求内部节点同时支持文本和自定义节点时，文本 prop 使用 `xxxText`，节点 prop 使用 `xxx`，禁止使用 `{ title: string | ReactNode }` 这类混合语义。
- 影响：调用方无法从类型上区分文本标签与自定义标签节点，`null`、`undefined` 的默认行为也难以按项目插槽规范表达。
- 推荐纠正方案：将 API 调整为 `labelText?: string` 与 `label?: ReactNode | null`；仅在 `label === undefined` 时回退 `labelText`，`label === null` 表示明确不渲染。
- 状态：已修复
- 修复方式：`TabsItem` 新增 `labelText?: string`，`label` 类型改为 `ReactNode | null`；组件内 `getLabel()` 函数按 `label !== undefined` 优先、`labelText` 回退的顺序解析；`null` 明确不渲染，`undefined` 走默认行为。

### 4. `Text` 字号、颜色和字重优先通过 `style` 设置

- 严重程度：medium
- 位置：`packages/pennyspring-ui/src/Tabs/Tabs.tsx:72`
- 违反规范：`CLAUDE.md` 组件约束；`.claude/rules/component/coding-style.md` 内部渲染节点
- 不符合点：标签文本虽然使用了 `Text size="sm"`，但实际字号、行高、颜色和字重由 `tokenStyles.label`、`tokenStyles.labelActive`、`tokenStyles.labelDisabled` 通过 `style` 传入；项目要求 `Text` 字号、颜色等优先使用 `TextProps` 实现，其次才是 `style`。
- 影响：文本排版和颜色语义绕过 `Text` 组件 API，可能与其它组件的文本和图标色彩语义漂移。
- 推荐纠正方案：将 `Tabs.size` 与选中/禁用状态映射到 `Text` 的 `size`、`weight`、`color` props；外部 `styles?.label`、`styles?.labelActive`、`styles?.labelDisabled` 仅作为补充覆盖。
- 状态：已修复
- 修复方式：
  - `toTextSize()` 将 `ComponentSize` 映射为 `TextSize`（`small→sm`、`normal→md`、`large→lg`）。
  - 选中态使用 `weight="strong"` + `color="heading"`，默认态使用 `weight="regular"` + `color="secondary"`，禁用态使用 `color="disabled"`。
  - 样式文件中移除 `label` 的 `fontSize`、`lineHeight`、`color`、`fontWeight`，仅保留 `fontFamily`。
  - 外部 `styles?.label` 仍可通过 `Text` 的 `style` prop 补充覆盖。

### 5. `disabled` 状态样式未合并外部语义插槽

- 严重程度：low
- 位置：`packages/pennyspring-ui/src/Tabs/Tabs.tsx:217`
- 违反规范：`.claude/rules/component/coding-style.md` 样式 API / 样式实现
- 不符合点：`TabsStyles` 定义了 `labelDisabled`，但未定义 `tabDisabled`；实现中 item 禁用时只合并 `tokenStyles.tabDisabled`，没有为外部 `styles` 提供与 `tabPressed`、`tabActive` 同级的禁用标签项语义插槽。
- 影响：外部调用方无法按组件语义覆盖禁用标签项容器状态，只能覆盖全部 `tab`，会降低样式覆盖的精确性。
- 推荐纠正方案：补充 `tabDisabled?: StyleProp<ViewStyle>` 并在禁用分支中按 token 样式、组件运行时样式、外部样式顺序合并。
- 状态：已修复
- 修复方式：`TabsStyles` 新增 `tabDisabled?: StyleProp<ViewStyle>`；`renderItem` 中禁用分支按 `tokenStyles.tabDisabled` → `styles?.tabDisabled` 顺序合并。

## 测试

- 新增测试：12
- 总测试数：20
- 全部通过：是
