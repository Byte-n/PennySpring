# Spacer 组件规范巡检报告

## 结论

- 状态：不通过
- 严重程度：high
- 问题数量：4

## 问题列表

### 1. 样式实现绕过 createUseSheetStyle 且直接修改运行时样式对象

- 严重程度：high
- 位置：`packages/pennyspring-ui/src/Spacer/Spacer.tsx:7`
- 违反规范：`CLAUDE.md` “样式约束（React Native）”；`.claude/rules/common/component-visual-layout.md` “Token 边界”；`.claude/rules/common/coding-style.md` “Immutability”
- 不符合点：组件在 `const baseStyle: ViewStyle = {};` 后通过 `baseStyle.width = size`、`baseStyle.flex = flex ?? 1`、`baseStyle.minWidth = min`、`baseStyle.maxWidth = max` 等语句逐步 mutation 样式对象，并直接传给 `View`；未使用 `createUseSheetStyle` 作为唯一样式构建方式，也未通过 AliasToken 生成样式。
- 影响：样式路径绕过主题系统，后续难以统一处理主题、token、动态样式和静态检查；运行时 mutation 也违背不可变约束，降低可维护性。
- 推荐纠正方案：将 Spacer 的内部样式改为 `createUseSheetStyle<TOptions>`，把方向、尺寸语义、flex/min/max 等必要动态选项作为 options 传入；样式对象在工厂内一次性返回，避免在组件渲染过程中修改同一对象。

### 2. Spacer 的 `size` API 使用裸数字，且无方向区分

- 严重程度：high
- 位置：`packages/pennyspring-ui/src/Spacer/types.ts:4`
- 违反规范：`.claude/rules/component/coding-style.md` “尺寸 API”；`.claude/rules/common/component-visual-layout.md` “Size 与间距 Token”
- 不符合点：`SpacerProps` 定义 `size?: number`，调用方可以传任意数字来决定空白尺寸；且 `size` 同时设置 `width` 和 `height`，无方向区分。在水平 `Row` 中设置 `size={16}` 会同时添加 16px 高度，造成非预期布局。
- 影响：Spacer 作为布局组件会把任意硬编码数字扩散到业务调用点，破坏 spacing token 体系；无方向区分会导致布局不符合预期。
- 推荐纠正方案：将 `size` 调整为 `ComponentSize`（`small`/`normal`/`large`），映射到布局 gap token：`small -> token.paddingXXS`、`normal -> token.paddingXS`、`large -> token.paddingSM`，默认 `normal`；增加 `direction` prop 区分水平/垂直方向，垂直方向尺寸基于同语义水平 token `/ 2`。

### 3. `flex`、`min`、`max` 暴露裸数字并让调用方承担布局正确性

- 严重程度：medium
- 位置：`packages/pennyspring-ui/src/Spacer/types.ts:5`
- 违反规范：`CLAUDE.md` “样式约束（React Native）”；`.claude/rules/component/coding-style.md` “公共 API” 与 “样式实现”
- 不符合点：`flex?: number`、`min?: number`、`max?: number` 暴露给调用方，并在 `packages/pennyspring-ui/src/Spacer/Spacer.tsx:13` 直接写入 `flex`、`minWidth/minHeight`、`maxWidth/maxHeight`。除 `flex: 1` 外，样式值中的数字字面量原则上应来自 token、语义常量或动态计算；当前 API 使任意裸数字成为组件正确布局的常规用法。
- 影响：调用方可以绕过 token 体系生成不可控尺寸；`min`/`max` 同时作用于宽高，也无法表达水平/垂直语义差异，容易造成布局不符合预期。
- 推荐纠正方案：优先提供语义化布局 props，例如 `direction`、`basisSize`/`minSize`/`maxSize` 的 token 化语义值；确需数值例外时用语义命名常量或受限动态计算，并在类型和文档中明确这是局部例外，避免将裸数字作为主路径。

### 4. 缺少 Spacer 关键布局行为测试

- 严重程度：medium
- 位置：`packages/pennyspring-ui/src/Spacer/Spacer.tsx:6`
- 违反规范：`CLAUDE.md` “测试约束”；`.claude/rules/common/testing.md` “Minimum Test Coverage” 与 “Test Structure”；`.claude/rules/typescript/testing.md`
- 不符合点：当前组件没有相关测试文件；对 `__tests__` 与 `packages/pennyspring-ui` 下 `*.test.ts` / `*.test.tsx` 搜索未发现 Spacer 覆盖。当前没有测试保护默认弹性占位、固定尺寸占位、min/max 约束和外部 style 合并顺序等用户可感知布局行为。
- 影响：Spacer 是基础布局组件，回归会影响大量页面布局但缺少自动化信号，测试可信度和变更安全性不足。
- 推荐纠正方案：在 `packages/pennyspring-ui/__tests__/` 或对应包测试目录补充 `Spacer` 行为测试，按 AAA 组织并使用描述性测试名；优先覆盖默认占位、语义 size 映射、外部 style 合并顺序，以及水平/垂直尺寸语义。

## 需要人工确认

- 无
