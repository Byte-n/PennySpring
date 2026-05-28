# Result 组件规范巡检报告

## 结论

- 状态：通过
- 严重程度：medium
- 问题数量：5

## 问题列表

### 1. 插槽类 prop 不支持 `null` 明确关闭默认内容 ✅

- 严重程度：medium
- 位置：`packages/pennyspring-ui/src/Result/Result.tsx:147`
- 违反规范：`.claude/rules/component/coding-style.md`「内部渲染节点」
- 不符合点：`icon`、`title`、`subtitle`、`extra` 都是插槽类 prop，但实现使用 `??` 或 truthy 判断处理显隐：`const resolvedTitle = title ?? titleText`、`const resolvedSubtitle = subtitle ?? subtitleText`、`{icon ?? (...)}`、`{extra ? (...) : null}`。根据规范，`xxx` 插槽为 `null` 时表示调用方明确不渲染该部分，`undefined` 才表示走默认行为。当前 `icon={null}` 会继续渲染默认图标，`title={null}` 且传入 `titleText` 时会继续渲染文本，`subtitle={null}` 且传入 `subtitleText` 时也会继续渲染文本；`extra` 还会把 `0`、空字符串等合法 ReactNode 当作不渲染处理。
- 影响：调用方无法可靠关闭 Result 的默认图标、标题或副标题，插槽空值语义与组件库规范不一致，组合自定义结果面板时可能出现多余内容。
- 推荐纠正方案：区分 `undefined` 与 `null`。例如 `icon === undefined` 时渲染默认图标，`icon === null` 时不渲染图标；`title === undefined` 时才回退 `titleText`，`title === null` 时不渲染标题区域；`extra` 使用 `extra !== undefined && extra !== null` 判断是否渲染，并为这些语义补充测试。

### 2. 基础布局使用 `View` 手写等效布局 ✅

- 严重程度：medium
- 位置：`packages/pennyspring-ui/src/Result/Result.tsx:3`
- 违反规范：`CLAUDE.md`「组件约束」；`.codex/skills/component-composer/SKILL.md`「工作流程」
- 不符合点：组件直接从 `react-native` 导入 `View`，并在根节点和内部容器上手写 `alignItems`、`justifyContent`、`gap`、`marginTop` 等布局。项目规范要求界面布局优先使用 `@pennyspring/ui` 中已有布局组件，如 `Row`、`Column`、`Space`、`Spacer`、`Grid`、`GeometryReader`，禁止用 `View` 手写等效布局结构。
- 影响：Result 的布局语义脱离共享布局组件，后续 spacing、size 或布局策略调整时容易与其他反馈/状态组件不一致。
- 推荐纠正方案：将图标、标题、副标题和 extra 的垂直排列改为复用 `Column` 或 `Space`；仅在图标圆形背景这类非等效布局容器上保留必要原生容器。

### 3. Layout Gap 级别偏移（各偏大一级） ✅

- 严重程度：low
- 位置：`packages/pennyspring-ui/src/Result/Result.tsx:39`
- 违反规范：`.claude/rules/common/component-visual-layout.md` Layout Gap
- 不符合点：`SIZE_STYLE_MAP` 中 `gap` 使用 `marginXS`（small）、`marginSM`（normal）、`marginMD`（large），比规范的 `marginXXS`（small）、`marginXS`（normal）、`marginSM`（large）各偏大一级。同一配置中的 `paddingVertical` 已按 `/ 2` 处理，但 `gap` 级别选择错误。与 Empty 组件同一模式。
- 影响：Result 在不同 size 下的间距比规范预期偏大，与组件库统一的 Layout Gap 映射不一致。
- 推荐纠正方案：将 gap 级别下调一级：small→`marginXXS`、normal→`marginXS`、large→`marginSM`。

### 4. 缺少规范要求的样式文件入口 ✅

- 严重程度：low
- 位置：`packages/pennyspring-ui/src/Result/style/index.ts:1`
- 违反规范：`.claude/rules/component/coding-style.md`「目录与导出」
- 不符合点：规范要求组件目录包含样式文件 `style/index.ts`，但 `packages/pennyspring-ui/src/Result/` 下只有 `Result.tsx`、`index.ts`、`types.ts`，没有 `style/index.ts`。当前 token 样式定义全部内联在 `Result.tsx`。
- 影响：Result 的目录结构与组件规范不一致，样式职责和实现逻辑耦合在同一文件中，后续扩展尺寸、状态或插槽样式时更容易增加实现文件复杂度。
- 推荐纠正方案：新增 `packages/pennyspring-ui/src/Result/style/index.ts` 承载 `createUseSheetStyle`、尺寸样式映射和状态样式映射；`Result.tsx` 只保留渲染逻辑与必要的配置引用。

### 5. 公共 API 的关键行为缺少测试保护 ✅

- 严重程度：medium
- 位置：`packages/pennyspring-ui/__tests__/Result.test.tsx:12`
- 违反规范：`CLAUDE.md`「测试约束」；`.claude/rules/common/testing.md`「Test Structure (AAA Pattern)」；`.claude/rules/typescript/testing.md`
- 不符合点：现有测试只覆盖默认渲染、`subtitleText` 和自定义节点优先级，未覆盖 Result 暴露的 `status`、`size`、`icon={null}`、`title={null}`、`subtitle={null}`、`extra` 等关键用户可感知行为。特别是插槽 `null` 语义属于组件编码规范明确要求的公共 API 行为，但当前没有测试能发现其回归或违规。
- 影响：Result 的状态图标、尺寸映射和插槽显隐语义缺少自动保护，后续修改容易在不触发测试失败的情况下改变公共行为。
- 推荐纠正方案：按 AAA 补充 `Result.test.tsx`，测试名直接描述行为；覆盖不同 `status` 的默认图标、不同 `size` 的可观察尺寸/文本尺寸映射、自定义节点优先级、`null` 插槽明确不渲染以及 `extra` 合法 ReactNode 的渲染。

## 需要人工确认

- 无
