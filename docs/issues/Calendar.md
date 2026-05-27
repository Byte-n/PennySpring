# Calendar 组件规范巡检报告

## 结论

- 状态：通过（2 已修复，3 跳过）
- 严重程度：medium
- 问题数量：5

## 问题列表

### 1. ✅ `Calendar.Range` 的“今天”入口会绕过日期禁用规则（已修复）

- 严重程度：medium
- 位置：`packages/pennyspring-ui/src/Calendar/Calendar.tsx:717`
- 违反规范：`.claude/rules/component/coding-style.md` 要求组件必须自行完整持有 disabled 等标准状态；`.claude/rules/common/component-visual-layout.md` 要求 disabled 状态必须由组件自身完整表达；`.claude/rules/common/testing.md` 要求测试默认只编写用户可感知行为断言
- 不符合点：单值 Calendar 的 `handleToday` 会先通过 `isValueDisabled(nextToday, { disabled, disabledDate, maxDate, minDate }, resolvedMode)` 校验今天是否被 `disabledDate`、`minDate` 或 `maxDate` 禁用（`packages/pennyspring-ui/src/Calendar/Calendar.tsx:466`-`packages/pennyspring-ui/src/Calendar/Calendar.tsx:473`）。但 `Calendar.Range` 的“今天”入口只计算 `nextToday` 后直接 `handleSelect(nextToday)`（`packages/pennyspring-ui/src/Calendar/Calendar.tsx:717`-`packages/pennyspring-ui/src/Calendar/Calendar.tsx:723`），而 `handleSelect` 只检查 `disabled` / `readonly`（`packages/pennyspring-ui/src/Calendar/Calendar.tsx:627`-`packages/pennyspring-ui/src/Calendar/Calendar.tsx:630`），不会检查 `disabledDate`、`minDate` 或 `maxDate`。因此今天按钮可以把被禁用或越界的日期放入范围草稿。
- 影响：用户通过网格无法选择的日期，仍可通过“今天”操作进入范围选择，导致同一个 disabled API 在不同入口表现不一致。现有测试只覆盖网格禁用日期（`packages/pennyspring-ui/__tests__/Calendar.test.tsx:54`-`packages/pennyspring-ui/__tests__/Calendar.test.tsx:67`），没有覆盖 range 的 today 入口。
- 修复结果：`Calendar.Range` 的 today 入口已复用 `isValueDisabled` 校验，并补充测试覆盖禁用 today 不进入范围选择流程。

### 2. ✅ 禁用态没有完整作用到导航与底部操作（已修复）

- 严重程度：medium
- 位置：`packages/pennyspring-ui/src/Calendar/Calendar.tsx:482`
- 违反规范：`.claude/rules/common/component-visual-layout.md` 的“pressed、focused、disabled、loading、selected、error 状态必须由组件自身完整表达”；`.claude/rules/component/coding-style.md` 的组件必须在内部提供完整 token 驱动默认外观，并自行持有标准视觉状态
- 不符合点：组件声明了 `disabled?: boolean`（`packages/pennyspring-ui/src/Calendar/types.ts:60`），网格单元会通过 `disabled={disabled}` 和 `styles.cellDisabled` 表达禁用（`packages/pennyspring-ui/src/Calendar/Calendar.tsx:366`-`packages/pennyspring-ui/src/Calendar/Calendar.tsx:383`）。但导航按钮只在 `onPress` 内判断 `if (!disabled)`，没有设置 `Pressable disabled`，也没有禁用样式（单值：`packages/pennyspring-ui/src/Calendar/Calendar.tsx:482`-`packages/pennyspring-ui/src/Calendar/Calendar.tsx:516`；范围：`packages/pennyspring-ui/src/Calendar/Calendar.tsx:667`-`packages/pennyspring-ui/src/Calendar/Calendar.tsx:701`）。底部 today、cancel、ok 也没有 `disabled` 状态或视觉禁用表现（单值：`packages/pennyspring-ui/src/Calendar/Calendar.tsx:540`-`packages/pennyspring-ui/src/Calendar/Calendar.tsx:566`；范围：`packages/pennyspring-ui/src/Calendar/Calendar.tsx:717`-`packages/pennyspring-ui/src/Calendar/Calendar.tsx:746`）。
- 影响：组件整体处于 `disabled` 时，仍呈现可点击的导航和底部操作；用户可感知状态与 API 语义不一致，且测试未断言 disabled 状态下这些入口不可操作或有禁用表现。
- 修复结果：导航与底部 today/cancel/ok 已设置 `Pressable disabled`，并补充测试覆盖 `disabled` 下不可操作行为。

### 3. ⏭️ 样式实现没有按组件规范拆到 `style/index.ts`（本轮未修复）

- 严重程度：low
- 位置：`packages/pennyspring-ui/src/Calendar/Calendar.tsx:52`
- 违反规范：`.claude/rules/component/coding-style.md` 的目录与导出要求，规定组件样式文件为 `style/index.ts`
- 不符合点：Calendar 目录当前只有 `Calendar.tsx`、`types.ts` 和 `index.ts`（可定位片段：`packages/pennyspring-ui/src/Calendar/Calendar.tsx`、`packages/pennyspring-ui/src/Calendar/types.ts`、`packages/pennyspring-ui/src/Calendar/index.ts`），没有 `packages/pennyspring-ui/src/Calendar/style/index.ts`。默认样式直接定义在组件实现文件内的 `useCalendarStyles`（`packages/pennyspring-ui/src/Calendar/Calendar.tsx:52`-`packages/pennyspring-ui/src/Calendar/Calendar.tsx:132`）。
- 影响：样式、日期计算、单值渲染和范围渲染集中在同一实现文件中，弱化组件目录约定，也增加后续视觉调整时误触行为逻辑的风险。
- 未修复原因：本轮按最小改动优先修复中等级行为缺陷，避免引入大规模结构迁移风险。

### 4. ⏭️ 默认文本视觉优先通过 `Text style` 设置（本轮未修复）

- 严重程度：low
- 位置：`packages/pennyspring-ui/src/Calendar/Calendar.tsx:386`
- 违反规范：`CLAUDE.md` 要求展示文本统一使用 `@pennyspring/ui` 的 `Text`，且 `Text` 字号、颜色等优先使用 `TextProps` 实现，其次再用 `style`，禁止优先使用 `style`
- 不符合点：Calendar 已使用内部 `Text` 组件，但默认颜色主要写入 token 样式后通过 `style` 传给 `Text`。例如日期文本颜色定义在 `dateText: { color: token.colorText }`（`packages/pennyspring-ui/src/Calendar/Calendar.tsx:118`-`packages/pennyspring-ui/src/Calendar/Calendar.tsx:120`），渲染时使用 `<Text style={[styles.dateText, slotStyles?.dateText]}>`（`packages/pennyspring-ui/src/Calendar/Calendar.tsx:386`-`packages/pennyspring-ui/src/Calendar/Calendar.tsx:388`）；标题颜色同样通过 `title: { color: token.colorTextHeading }`（`packages/pennyspring-ui/src/Calendar/Calendar.tsx:63`-`packages/pennyspring-ui/src/Calendar/Calendar.tsx:65`）和 `<Text style={[tokenStyles.title, styles?.title]}>` 应用（`packages/pennyspring-ui/src/Calendar/Calendar.tsx:499`、`packages/pennyspring-ui/src/Calendar/Calendar.tsx:684`）；星期文本颜色也通过 style 应用（`packages/pennyspring-ui/src/Calendar/Calendar.tsx:84`-`packages/pennyspring-ui/src/Calendar/Calendar.tsx:86`、`packages/pennyspring-ui/src/Calendar/Calendar.tsx:522`）。
- 影响：`Text` 的 `color`、`size`、`weight` 等语义 API 没有成为默认文本视觉主路径，后续统一调整 Text 语义映射时 Calendar 文本不会自然跟随。
- 未修复原因：该项属于风格一致性重构，不影响本轮关键行为正确性，且会扩大改动面。

### 5. ⏭️ 手写 `View` 布局替代了已有布局组件（本轮未修复）

- 严重程度：low
- 位置：`packages/pennyspring-ui/src/Calendar/Calendar.tsx:477`
- 违反规范：`CLAUDE.md` 要求界面布局优先使用 `@pennyspring/ui` 中已有布局组件，禁止用 `View` 手写等效布局结构
- 不符合点：Calendar 直接从 `react-native` 导入 `View`，并用 `View` 手写根容器、header、weekHeader、weekCell、grid、mark、footer 等布局。这些结构主要是横向、纵向、网格和间距布局，和现有 `Row`、`Column`、`Grid`、`Space` 的职责重叠。
- 影响：Calendar 没有复用项目统一布局语义，后续 layout gap、方向间距和组合规则变化时更难统一调整。
- 未修复原因：该项属于较大范围 UI 结构改造，与本轮缺陷修复目标不匹配。


## 需要人工确认

无
