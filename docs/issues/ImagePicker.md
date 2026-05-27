# ImagePicker 组件规范巡检报告

## 结论

- 状态：不通过
- 严重程度：high
- 问题数量：4

## 问题列表

### 1. 触发器未按组件目录约定复用 DisplayInput，且 placeholder、label、displayInputProps 未生效

- 严重程度：high
- 位置：`packages/pennyspring-ui/src/ImagePicker/ImagePicker.tsx:119`
- 违反规范：`.codex/skills/component-composer/references/component-catalog.md`；`.claude/rules/component/coding-style.md`
- 不符合点：组件目录声明 `ImagePicker` 应“以 `DisplayInput` 作为触发器”，输入类组件也必须显式支持 `placeholder`、`readonly` 和 `disabled`。但 `types.ts:69-71` 暴露了 `label`、`placeholder`、`displayInputProps`，实现的参数解构 `ImagePicker.tsx:119-143` 没有接收这些 props，实际渲染 `ImagePicker.tsx:328-355` 使用自建 `Pressable` + `View` + `Icon` + `Text`，没有渲染或转发给 `DisplayInput`。测试 `ImagePicker.test.tsx:55-64` 传入 `label`/`placeholder` 后反而断言找不到 `DisplayInput`，说明现有测试固化了与组件目录相反的行为。
- 影响：公共 API 暴露但无效，表单输入触发器在 label、placeholder、只读展示和内部样式插槽上无法与 `DisplayInput` 保持一致，调用方会得到不可预期的表单体验。
- 推荐纠正方案：用 `DisplayInput` 作为触发器承载 `label`、`placeholder`、`readonly`、`disabled`、`valueText` 和 `displayInputProps`，保留 ImagePicker 自身图标/状态语义时通过 `DisplayInput` 支持的插槽或样式映射实现；同步调整测试，验证 placeholder、readonly、disabled 与 DisplayInput 触发行为。

### 2. 多处布局用 View 手写 Row/Column 等效结构

- 严重程度：medium
- 位置：`packages/pennyspring-ui/src/ImagePicker/ImagePicker.tsx:245`
- 违反规范：`CLAUDE.md` 组件约束；`.codex/skills/component-composer/SKILL.md`
- 不符合点：项目宪章要求界面布局优先使用 `Row`、`Column`、`Spacer`、`GeometryReader`、`Grid` 等，禁止用 `View` 手写等效布局结构；component-composer 也要求展示组合优先使用布局组件。当前弹层头部、标题区、操作区、图片网格分别使用 `View` 承担行/列/网格布局：`ImagePicker.tsx:245-246`、`ImagePicker.tsx:262`、`ImagePicker.tsx:300-304`。
- 影响：基础布局语义散落在样式里，不能复用项目布局组件的 size、gap 和一致性约束，后续维护时更容易出现间距和方向语义漂移。
- 推荐纠正方案：弹层头部和操作区改用 `Row`，标题区和空状态改用 `Column`，图片列表优先评估 `Grid` 或项目已有布局组件；只在媒体节点、绝对定位删除按钮等确实无法表达的局部保留原生 View。

### 3. 删除图片的小图标按钮点击区域不足且没有 hitSlop

- 严重程度：medium
- 位置：`packages/pennyspring-ui/src/ImagePicker/ImagePicker.tsx:312`
- 违反规范：`.claude/rules/common/component-visual-layout.md`；`.codex/skills/theme-tokens/SKILL.md`
- 不符合点：视觉规范要求小图标按钮必须提供足够的 `hitSlop`，可点击区域优先保证 `controlHeight` 或 `hitSlop`；theme-tokens 说明 `controlHeightXS` 仅装饰用，可点击控件最小应使用 `controlHeightSM`。当前删除按钮是 `Pressable`，没有 `hitSlop`（`ImagePicker.tsx:312-318`），样式尺寸使用 `token.controlHeightXS`（`style.ts:97-99`）。
- 影响：删除已选图片的可点区域过小，移动端误触或点不中的概率高，且与项目交互控件尺寸规范不一致。
- 推荐纠正方案：将删除按钮可点击区域提升到至少 `token.controlHeightSM`，或保留视觉尺寸但在 `Pressable` 上提供基于 token 的 `hitSlop`；视觉圆点尺寸与交互命中区应分离，避免布局跳动。

### 4. imageGrid.gap 级别偏大一级

- 严重程度：low
- 位置：`packages/pennyspring-ui/src/ImagePicker/style.ts:78`
- 违反规范：`.claude/rules/common/component-visual-layout.md` Layout Gap
- 不符合点：`imageGrid.gap` 使用 `token.marginMD`，但规范的 "large" 级别 Layout Gap 应为 `marginSM`，偏大一级。`popupTitleArea.gap` 使用 `marginXXS` 属于 "small" 级别，可接受。
- 影响：图片网格间距比规范预期偏大，与其他使用正确 Layout Gap 映射的组件不一致。
- 推荐纠正方案：将 `imageGrid.gap` 改为 `token.marginSM`（"large" 级别）。

## 需要人工确认

- 无
