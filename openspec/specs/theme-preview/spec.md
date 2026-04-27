## ADDED Requirements

### Requirement: ThemePreview component
**主题预览组件**

系统 SHALL 提供 `ThemePreview` React 组件，以可滚动列表的形式可视化当前主题 context 下的全部 alias token，按以下分区组织：品牌色、中性色、预设色调色板、字体、间距、阴影与圆角。该组件 SHALL 支持预设主题切换（`default`、`april`、`kaori`、`penny`、`spring`）以及 light/dark 模式切换。

#### Scenario: ThemePreview 从 ThemeContext 读取 token
- **WHEN** `<ThemePreview />` 在 `<ThemeProvider>` 中渲染
- **THEN** 其展示的颜色色卡、文本样例、间距条、阴影样例与圆角预览均源自当前主题的 `alias` token

#### Scenario: 支持预设主题切换
- **WHEN** 用户在 ThemePreview 顶部选择某个预设主题 chip
- **THEN** 主题切换为该预设的 seed token

#### Scenario: 支持 light/dark 模式切换
- **WHEN** 用户按下 ThemePreview 顶部的主题切换按钮
- **THEN** 主题在 light（default）与 dark 算法之间切换

#### Scenario: 在 Provider 之外使用时抛错
- **WHEN** `<ThemePreview />` 在 `<ThemeProvider>` 之外渲染
- **THEN** 抛出错误（由 `useTheme()` 触发）

### Requirement: Preset color palette section
**预设色调色板分区**

ThemePreview SHALL 渲染一个分区，展示当前主题下全部 13 个预设色族（`blue`、`purple`、`cyan`、`green`、`magenta`、`pink`、`red`、`orange`、`yellow`、`volcano`、`geekblue`、`lime`、`gold`）各自的 10 级渐变。

#### Scenario: 展示全部 13 个预设色族
- **WHEN** `ThemePreview` 渲染预设色分区
- **THEN** 展示 130 个色卡（13 × 10），分别标注为 `blue1`–`blue10`、`purple1`–`purple10` 等

### Requirement: Brand color swatches section
**品牌色色卡分区**

ThemePreview SHALL 为 5 个语义色族（primary、success、warning、error、info）分别渲染 10 级渐变色卡，每一级为一个带 token 名称与 hex 值标签的色块。

#### Scenario: 展示 primary 色渐变
- **WHEN** `ThemePreview` 渲染品牌色分区
- **THEN** 展示 10 个 primary 色块，依次标注为 `colorPrimaryBg`（step 1）至 `colorPrimaryTextActive`（step 10），并附带 hex 值

#### Scenario: 展示 5 个语义色族
- **WHEN** `ThemePreview` 渲染品牌色分区
- **THEN** 同时展示 primary、success、warning、error、info 五个色族的渐变色卡

### Requirement: Neutral color swatches section
**中性色色卡分区**

ThemePreview SHALL 渲染文本色（4 级）、填充色（4 级）、表面/背景色（6 级）与边框色（3 级）的色卡，每个色卡附带 token 名称与 hex 值。

#### Scenario: 展示文本色渐变
- **WHEN** `ThemePreview` 渲染中性色分区
- **THEN** 展示 4 个文本色卡（`colorText` 至 `colorTextQuaternary`），附带 token 名与 hex 值

#### Scenario: 展示表面色渐变
- **WHEN** `ThemePreview` 渲染中性色分区
- **THEN** 展示包括 `colorBgLayout`、`colorBgContainer`、`colorBgElevated`、`colorBgSpotlight` 在内的表面色

### Requirement: Typography samples section
**字体样例分区**

ThemePreview SHALL 为每个标题级别（H1–H5）、正文字号（SM、base、LG、XL）以及字体族渲染文本样例，使用实际的字号与行高 token 值。

#### Scenario: 各级标题按正确字号渲染
- **WHEN** `ThemePreview` 渲染字体分区
- **THEN** 每个标题样例（H1–H5）按其对应的 `fontSizeHeading*` token 值渲染

#### Scenario: 展示字体族
- **WHEN** `ThemePreview` 渲染字体分区
- **THEN** 当前 `fontFamily` token 值以标签形式展示

### Requirement: Spacing scale section
**间距刻度分区**

ThemePreview SHALL 将 `paddingXXS` 至 `paddingXL` 以横条形式渲染，横条宽度与其像素值成正比，并标注 token 名称与数值。

#### Scenario: 间距横条按比例呈现
- **WHEN** `ThemePreview` 渲染间距分区
- **THEN** `paddingLG`（24px）对应的横条视觉上宽于 `paddingSM`（12px）对应的横条

### Requirement: Shadow examples section
**阴影样例分区**

ThemePreview SHALL 为每档阴影 token（`boxShadow`、`boxShadowSecondary`、`boxShadowTertiary`）渲染一个带阴影的示例框，并标注 token 名称与其 ShadowToken 各属性。

#### Scenario: 展示三档阴影
- **WHEN** `ThemePreview` 渲染阴影分区
- **THEN** 展示 3 个带阴影的方块，分别标注为 `boxShadow`、`boxShadowSecondary`、`boxShadowTertiary`，并附带 offset、blur、opacity、elevation 值

### Requirement: Border radius examples section
**圆角样例分区**

ThemePreview SHALL 为每种圆角变体（`borderRadiusXS`、`borderRadiusSM`、`borderRadius`、`borderRadiusLG`、`borderRadiusOuter`）渲染一个示例框，并标注 token 名称与值。

#### Scenario: 展示 5 种圆角变体
- **WHEN** `ThemePreview` 渲染圆角分区
- **THEN** 展示 5 个圆角方块，分别标注其对应的 `borderRadius*` token 名与像素值

### Requirement: ThemePreview export
**ThemePreview 包导出**

系统 SHALL 从包入口（`src/index.ts`）导出 `ThemePreview`，与其他公共组件并列。

#### Scenario: ThemePreview 可从包中导入
- **WHEN** 使用方写 `import { ThemePreview } from '@pennyspring/theme'`
- **THEN** 导入能够正确解析
