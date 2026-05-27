# Stepper 组件规范巡检报告

## 结论

- 状态：不通过
- 严重程度：medium
- 问题数量：4

## 问题列表

### 1. 样式实现未放入组件样式文件

- 严重程度：low
- 位置：`packages/pennyspring-ui/src/Stepper/Stepper.tsx:39`
- 违反规范：`.claude/rules/component/coding-style.md` 目录与导出（样式文件：`style/index.ts`）
- 不符合点：`Stepper` 在组件实现文件内直接定义 `useStyles`，且组件目录只包含 `Stepper.tsx`、`index.ts`、`types.ts`，缺少 `style/index.ts`。
- 影响：样式与行为实现耦合，和共享组件目录组织规范不一致，后续维护样式 token 或尺寸映射时更容易扩大修改范围。
- 推荐纠正方案：新增 `packages/pennyspring-ui/src/Stepper/style/index.ts`，将 `createUseSheetStyle`、尺寸样式映射和样式相关类型迁移到该文件，再由 `Stepper.tsx` 引用。

### 2. 使用 `View` 手写水平布局结构

- 严重程度：medium
- 位置：`packages/pennyspring-ui/src/Stepper/Stepper.tsx:137`
- 违反规范：`CLAUDE.md` 组件约束；`.codex/skills/component-composer/SKILL.md` 工作流程
- 不符合点：根节点用 `View` 搭配 `flexDirection: 'row'`、`alignItems: 'center'` 手写横向布局，而项目要求布局优先使用 `Row`、`Column`、`Space`、`Spacer`、`Grid`、`GeometryReader` 等已有布局组件，禁止用 `View` 手写等效布局结构。
- 影响：布局语义不能复用统一布局组件，后续间距、对齐和尺寸语义容易与其它组件漂移。
- 推荐纠正方案：根布局改用 `Row` 承载减号按钮、数值展示区和加号按钮；仅在确无现有布局组件覆盖的内部测量或平台限制场景保留原生 `View`。

### 3. `Text` 字号和颜色优先通过 `style` 设置

- 严重程度：medium
- 位置：`packages/pennyspring-ui/src/Stepper/Stepper.tsx:157`
- 违反规范：`CLAUDE.md` 组件约束；`.claude/rules/component/coding-style.md` 内部渲染节点
- 不符合点：按钮文本和数值文本通过 `tokenStyles.buttonText`、`tokenStyles.inputText` 写入 `fontSize` 与 `color`，再作为 `Text` 的 `style` 传入；项目要求展示文本使用项目 `Text` 组件，并且 `Text` 字号、颜色等优先使用 `TextProps` 实现，其次才是 `style`。
- 影响：文本尺寸和颜色语义绕过 `Text` 组件公开 API，容易与 `Icon` 色彩语义、排版 token 映射不一致，也削弱外部 `styles` 覆盖时的可预期性。
- 推荐纠正方案：将 `Stepper` 的 `size` 映射到 `Text` 的 `size` prop，将禁用/普通状态映射到 `Text` 的 `color` prop；`styles?.buttonText`、`styles?.inputText` 仅作为调用方覆盖补充。

### 4. 点击热区使用硬编码数字

- 严重程度：low
- 位置：`packages/pennyspring-ui/src/Stepper/Stepper.tsx:37`
- 违反规范：`CLAUDE.md` 样式约束；`.claude/rules/common/coding-style.md` Magic Numbers；`.codex/skills/theme-tokens/SKILL.md` Token 取值规则
- 不符合点：`STEPPER_BUTTON_HIT_SLOP = 8` 直接硬编码点击热区数值，未通过主题 token 或经查询确认的语义化 token 派生。
- 影响：触控热区无法随主题尺寸体系统一调整，也会在不同交互组件之间形成不可追踪的魔法数。
- 推荐纠正方案：将热区数值改为 token 驱动的语义值，例如在样式/主题读取逻辑中使用合适的 spacing token，并在需要具体 token 时先通过 `get-tokens.js` 查询确认。

## 需要人工确认

- 无
