# TabBar 组件规范巡检报告

## 结论

- 状态：不通过
- 严重程度：medium
- 问题数量：6

## 问题列表

### 1. 样式实现未放入组件样式文件

- 严重程度：low
- 位置：`packages/pennyspring-ui/src/TabBar/TabBar.tsx:71`
- 违反规范：`.claude/rules/component/coding-style.md` 目录与导出（样式文件：`style/index.ts`）
- 不符合点：`TabBar` 在组件实现文件内直接定义 `useStyles`，组件目录实际只包含 `TabBar.tsx`、`index.ts`、`types.ts`，缺少规范要求的 `style/index.ts`。
- 影响：样式 token、尺寸映射与渲染逻辑耦合，后续维护视觉规范时容易扩大修改范围。
- 推荐纠正方案：新增 `packages/pennyspring-ui/src/TabBar/style/index.ts`，将 `SIZE_STYLE_MAP`、`TabBarStyleOptions` 与 `createUseSheetStyle` 样式定义迁移到该文件，组件实现只消费样式 hook。

### 2. 使用 `View` 手写等效布局结构

- 严重程度：medium
- 位置：`packages/pennyspring-ui/src/TabBar/TabBar.tsx:217`
- 违反规范：`CLAUDE.md` 组件约束；`.codex/skills/component-composer/SKILL.md` 工作流程
- 不符合点：根节点、标签列表、图标容器和徽标容器使用 `View` 搭配 `flexDirection`、`alignItems`、`justifyContent` 等样式手写布局，而项目要求共享组件布局优先使用 `Row`、`Column`、`Space`、`Spacer`、`Grid`、`GeometryReader` 等已有布局组件。
- 影响：布局语义无法复用统一布局组件，后续间距和对齐规则容易与其它组件漂移。
- 推荐纠正方案：将标签列表改用 `Row`，单个标签内容改用 `Column` 或现有布局原语组织图标、标题和徽标；仅在必须承载绝对定位徽标的局部节点保留原生 `View`。

### 3. iconContainer.marginBottom 级别偏小（normal/large 各偏小一级）

- 严重程度：medium
- 位置：`packages/pennyspring-ui/src/TabBar/TabBar.tsx:109`
- 违反规范：`.claude/rules/common/component-visual-layout.md` Layout Gap
- 不符合点：`iconContainer.marginBottom` 的值 small 使用 `marginXXS`（正确），normal 使用 `marginXXS`（应为 `marginXS`，偏小一级），large 使用 `marginXS`（应为 `marginSM`，偏小一级）。
- 影响：图标与标题之间的垂直间距比规范预期偏小，normal 和 large 尺寸下的视觉密度偏紧。
- 推荐纠正方案：将 normal 的 `iconBottomGap` 改为 `marginXS`，large 改为 `marginSM`。

### 4. `Text` 字号、颜色和字重优先通过 `style` 设置

- 严重程度：medium
- 位置：`packages/pennyspring-ui/src/TabBar/TabBar.tsx:166`
- 违反规范：`CLAUDE.md` 组件约束；`.claude/rules/component/coding-style.md` 内部渲染节点
- 不符合点：标题文本和徽标文本通过 `tokenStyles.titleText`、`tokenStyles.titleTextActive`、`tokenStyles.badgeText` 等样式设置字号、行高、颜色和字重，再传入 `Text` 的 `style`；项目要求 `Text` 字号、颜色等优先使用 `TextProps` 实现，其次才是 `style`。
- 影响：文本语义绕过 `Text` 组件 API，可能造成排版 token、颜色语义和图标颜色语义在不同组件中漂移。
- 推荐纠正方案：将 `TabBar.size` 与选中/禁用状态映射到 `Text` 的 `size`、`weight`、`color` props；外部 `styles?.titleText`、`styles?.badgeText` 仅作为补充覆盖。

### 5. 点击热区使用硬编码数字

- 严重程度：low
- 位置：`packages/pennyspring-ui/src/TabBar/TabBar.tsx:34`
- 违反规范：`CLAUDE.md` 样式约束；`.claude/rules/common/coding-style.md` Magic Numbers；`.codex/skills/theme-tokens/SKILL.md` Token 取值规则
- 不符合点：`TAB_ITEM_HIT_SLOP` 直接写入 `top/right/bottom/left: 6`，未通过主题 token 或经查询确认的语义化 token 派生。
- 影响：标签点击热区无法随主题尺寸体系统一调整，也会在交互组件之间形成不可追踪的魔法数。
- 推荐纠正方案：将热区数值改为 token 驱动的语义值，例如在样式/主题读取逻辑中使用合适的 spacing token，并在需要具体 token 时先通过 `get-tokens.js` 查询确认。

### 6. `title={null}` / `badge={null}` 未按插槽语义显式不渲染

- 严重程度：medium
- 位置：`packages/pennyspring-ui/src/TabBar/TabBar.tsx:222`
- 违反规范：`.claude/rules/component/coding-style.md` 内部渲染节点
- 不符合点：`titleNode = item.title ?? item.titleText`、`badgeNode = item.badge ?? item.badgeText` 会在 `title` 或 `badge` 为 `null` 时回退到文本 prop；但规范要求插槽类 prop 为 `null` 时表示明确不渲染该部分内容，`undefined` 才表示走默认行为。
- 影响：调用方无法通过 `title={null}` 或 `badge={null}` 明确关闭对应插槽，公共 API 语义与项目组件规范不一致。
- 推荐纠正方案：仅在 `item.title === undefined` 时回退 `titleText`，仅在 `item.badge === undefined` 时回退 `badgeText`；`null` 应直接传递给渲染函数并返回不渲染。

## 需要人工确认

- 无
