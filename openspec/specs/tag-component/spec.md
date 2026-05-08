# tag-component Specification

## Purpose

提供 Tag 标签组件，负责轻量分类、状态和标记内容的展示，覆盖尺寸、颜色、视觉变体、按压状态、禁用状态和样式覆盖。

## Requirements

### Requirement: Tag exposes a shared component API
组件库 SHALL 提供 `Tag` 组件，并导出 `TagProps`、`TagStyles`、`TagSize`、`TagColor`、`TagVariant` 等公共类型。

#### Scenario: Package exports Tag and public types
- **WHEN** 调用方从组件包入口导入 Tag
- **THEN** 包入口导出 `Tag` 组件和 Tag 公共类型

### Requirement: Tag renders display content through Text when primitive
Tag SHALL 支持标签内容展示，并 MUST 在内容为 string 或 number 时通过组件库 `Text` 渲染。

#### Scenario: Primitive content receives content slot style
- **WHEN** `Tag` 接收 string 内容和 `styles.content`
- **THEN** 它通过内部 `Text` 渲染内容并应用 `styles.content`

#### Scenario: Custom node content stays caller controlled
- **WHEN** `Tag` 接收自定义 ReactNode 内容和 `styles.content`
- **THEN** 它直接渲染该自定义节点且不把 `styles.content` 应用到该节点

### Requirement: Tag maps size to token-driven density
Tag SHALL 支持 `small`、`normal`、`large` 三种尺寸，默认值 MUST 为 `normal`，并通过 `AliasToken` 驱动高度、内边距、圆角和字体尺寸。

#### Scenario: Size changes root and text density
- **WHEN** `Tag` 分别以 `small`、`normal`、`large` 渲染
- **THEN** 根节点高度、水平内边距、圆角和文字尺寸反映所选尺寸

### Requirement: Tag supports token-driven color and variant styles
Tag SHALL 支持默认、语义色和预设色标签场景，并提供 `filled`、`outlined`、`solid` 视觉变体，所有颜色、边框和背景 MUST 由 `AliasToken` 派生。

#### Scenario: Variant changes default visual style
- **WHEN** `Tag` 使用不同 `variant` 渲染
- **THEN** 根背景、边框和文本颜色反映对应变体

#### Scenario: Semantic and preset colors use token families
- **WHEN** `Tag` 使用语义色或预设色渲染
- **THEN** 根背景、边框和文本颜色来自对应 token 色系

### Requirement: Tag supports pressable and disabled states
Tag SHALL 在提供 `onPress` 时使用 `Pressable` 根节点，并 MUST 在 disabled 状态下阻止 `onPress`；未提供 `onPress` 时 SHALL 使用简单 `View` 根节点。

#### Scenario: Pressable tag invokes onPress when enabled
- **WHEN** `Tag` 接收 `onPress` 且 `disabled` 为 false
- **THEN** 它使用 `Pressable` 根节点并在按压时调用 `onPress`

#### Scenario: Disabled pressable tag blocks onPress
- **WHEN** `Tag` 接收 `onPress` 且 `disabled` 为 true
- **THEN** 它保持 `Pressable` 根节点但不调用 `onPress`，并应用 disabled 样式

#### Scenario: Non-pressable tag uses View root
- **WHEN** `Tag` 未接收 `onPress`
- **THEN** 它使用 `View` 根节点渲染内容

#### Scenario: Non-pressable tag forwards root props
- **WHEN** `Tag` 未接收 `onPress` 且接收根节点 props
- **THEN** 它将兼容的根节点 props 透传给 `View` 根节点

### Requirement: Tag exposes stable style overrides
Tag SHALL 支持 `style`、`pressedStyle` 和 `disabledStyle` 覆盖根元素状态，并支持 `styles` 中声明的内部 slot 覆盖；`styles` MUST NOT 暴露 `root` 或 `container` slot。

#### Scenario: Root and slot styles merge after token styles
- **WHEN** `Tag` 接收 `style`、`pressedStyle`、`disabledStyle`、`styles.content` 和 `styles.contentDisabled`
- **THEN** 对应样式在各自状态下应用在 token 样式之后
