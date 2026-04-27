## ADDED Requirements

### Requirement: SeedToken interface
**种子 Token 接口**

系统 SHALL 提供 `SeedToken` TypeScript 接口，用于定义用户可覆盖的最小设计 token 集合（品牌色、中性基础色、字体族、基础字号、圆角、size unit/step、控件高度、z-index 基准、透明度与动效参数）。该接口 SHALL 扩展 `PresetColorType`，包含 13 个预设色字段。

#### Scenario: SeedToken 扩展 PresetColorType
- **WHEN** 开发者查看 `SeedToken` 类型
- **THEN** 类型包含全部 13 个预设色字段（`blue`、`purple`、`cyan`、`green`、`magenta`、`pink`、`red`、`orange`、`yellow`、`volcano`、`geekblue`、`gold`、`lime`），均为 `string` 属性

#### Scenario: SeedToken 包含动效贝塞尔曲线
- **WHEN** 开发者读取 `SeedToken` 上的 `motionEaseOutCirc` 字段
- **THEN** 其值为 `CubicBezier` 元组 `[number, number, number, number]`，而不是 CSS 字符串

#### Scenario: SeedToken 保留 wireframe 以兼容 antd v5
- **WHEN** 开发者查看 `SeedToken` 类型定义
- **THEN** 其包含 `wireframe: boolean` 字段，用于兼容 ant-design v5（字段已废弃但予以保留）

### Requirement: MapToken interface
**映射 Token 接口**

系统 SHALL 提供 `MapToken` TypeScript 接口，该接口扩展 `SeedToken`，并合并所有 map 级子接口（`ColorMapToken`、`SizeMapToken`、`HeightMapToken`、`FontMapToken`、`StyleMapToken`、`CommonMapToken`）。

#### Scenario: MapToken 包含全部颜色渐变
- **WHEN** 开发者访问一个 `MapToken` 值
- **THEN** 其包含 primary 颜色的 10 级渐变（`colorPrimaryBg`、`colorPrimaryBgHover`、`colorPrimaryBorder`、`colorPrimaryBorderHover`、`colorPrimaryHover`、`colorPrimary`、`colorPrimaryActive`、`colorPrimaryTextHover`、`colorPrimaryText`、`colorPrimaryTextActive`），以及 success / warning / error / info 的等价渐变

#### Scenario: MapToken 包含中性色渐变
- **WHEN** 开发者访问 `MapToken.colorText`
- **THEN** 其包含 4 级文本颜色渐变（`colorText`、`colorTextSecondary`、`colorTextTertiary`、`colorTextQuaternary`），以及 4 级填充渐变（`colorFill` 至 `colorFillQuaternary`）

### Requirement: FontMapToken interface
**字体 Map Token 接口**

系统 SHALL 提供 `FontMapToken` 接口，其中包含字号（SM、base、LG、XL）、5 个标题级别（H1–H5）、行高（base、LG、SM 及每个标题对应行高），以及 **font heights**（base、SM、LG，按 `lineHeight × fontSize` 以像素为单位计算）。

#### Scenario: FontMapToken 包含 fontHeight 字段
- **WHEN** 开发者访问 `FontMapToken.fontHeight`
- **THEN** 其为预计算的像素高度（`lineHeight × fontSize`），适用于 RN 中需要像素高度的布局场景

#### Scenario: FontMapToken 包含 lineHeightHeading 字段
- **WHEN** 开发者访问 `FontMapToken.lineHeightHeading1`
- **THEN** 其为 H1 标题对应的行高倍率

### Requirement: AliasToken interface
**别名 Token 接口**

系统 SHALL 提供 `AliasToken` TypeScript 接口，该接口扩展 `MapToken`，补充组件直接消费的语义 token，包括语义颜色、间距比例、阴影 token、屏幕断点与控件交互状态。

#### Scenario: AliasToken 包含语义化间距
- **WHEN** 开发者访问 `AliasToken.paddingSM`
- **THEN** 其由 `sizeXXS`（SizeMapToken 中的 XXS 值）通过 formatToken 算法派生得到

#### Scenario: AliasToken 包含结构化阴影 token
- **WHEN** 开发者读取 `AliasToken.boxShadow`
- **THEN** 其值为 `ShadowToken` 对象，包含 `shadowColor`、`shadowOffset`、`shadowOpacity`、`shadowRadius`、`elevation` 字段（而非 CSS 字符串）

#### Scenario: 屏幕断点为数值类型
- **WHEN** 开发者读取 `AliasToken.screenSM`
- **THEN** 其值为 `576`（number 类型），而不是 CSS 媒体查询字符串

### Requirement: ShadowToken type
**阴影 Token 类型**

系统 SHALL 提供 `ShadowToken` 接口，包含 `shadowColor: string`、`shadowOffset: { width: number; height: number }`、`shadowOpacity: number`、`shadowRadius: number`、`elevation: number`。

#### Scenario: ShadowToken 可赋值给 RN ViewStyle
- **WHEN** 开发者将 `toShadowStyle(shadow)` 展开到 `ViewStyle`
- **THEN** 5 个阴影属性都能被 React Native 的 `View` 组件正确类型识别

### Requirement: PresetColorType and default preset values
**预设色类型与默认值**

系统 SHALL 定义覆盖 13 个预设色 key 的 `PresetColorType` record 类型，并导出 `defaultPresetColors`，其值为 ant-design 标准十六进制色。

#### Scenario: 默认预设色与 ant-design 一致
- **WHEN** 开发者导入 `defaultPresetColors`
- **THEN** `defaultPresetColors.blue` 等于 `'#1677FF'`，`defaultPresetColors.red` 等于 `'#F5222D'`

### Requirement: derivative pipeline (default)
**派生管线（default 模式）**

系统 SHALL 提供 `derivative(seed: SeedToken, isDark: boolean)` 函数，通过组合调色板、color map token、size map token、font map token、height map token 与 common map token 等生成器，将 `SeedToken` 转换为完整的 `MapToken`。

#### Scenario: 默认派生产出完整 MapToken
- **WHEN** 调用 `derivative(defaultSeedToken, false)`
- **THEN** 返回对象同时包含全部 `SeedToken` 字段，以及 `ColorMapToken`、`SizeMapToken`、`FontMapToken`、`HeightMapToken`、`CommonMapToken` 的所有字段

#### Scenario: 默认模式使用 darken 计算 solid color
- **WHEN** 调用 `derivative(seed, false)`
- **THEN** `colorBgContainer` 通过对 `colorBgBase` 执行 darken 得到

### Requirement: derivative pipeline (dark)
**派生管线（dark 模式）**

系统 SHALL 在派生管线中支持 `isDark: true`，使用 dark 专用调色板生成器与基于 lighten 的 solid color 派生逻辑，其他生成器保持不变。

#### Scenario: 暗色派生使用 lighten
- **WHEN** 调用 `derivative(seed, true)`
- **THEN** `colorBgContainer` 通过对 `colorBgBase` 执行 lighten 得到

#### Scenario: 暗色派生使用 dark 调色板
- **WHEN** 调用 `derivative(seed, true)`
- **THEN** 预设色调色板基于 `@ant-design/colors` 的 dark 模式生成

#### Scenario: 暗色派生调整 primary 背景色
- **WHEN** 调用 `derivative(seed, true)`
- **THEN** `colorPrimaryBg` 与 `colorPrimaryBgHover` 分别被映射为 `colorPrimaryBorder` 与 `colorPrimaryBorderHover`，以在暗色模式下获得更好的可见性

### Requirement: derivative pipeline (compact) — NOT IMPLEMENTED
**派生管线（compact 模式）— 不实现**

compact 算法在移动端有意 **不实现**。移动端屏幕本身已足够紧凑，compact 模式会将控件高度压至 Apple HIG 44×44pt 触控区域最小值之下。

#### Scenario: compact 算法等同于默认行为
- **WHEN** 调用 `derivative(seed, false)`（不支持 compact）
- **THEN** size 相关 token 直接使用标准 `sizeStep`，不做压缩

### Requirement: formatToken (MapToken → AliasToken)
**formatToken：MapToken 到 AliasToken 的转换**

系统 SHALL 提供 `formatToken(mapToken: MapToken)` 函数，用于派生语义化 `AliasToken` 字段，包括：语义颜色映射、间距比例、阴影 token、屏幕断点、控件交互状态与描边颜色。当 `motion` 为 `false` 时，所有动效时长字段 SHALL 被置为 `0`。

#### Scenario: 语义色别名映射
- **WHEN** 调用 `formatToken(mapToken)`
- **THEN** `colorFillContent` 等于 `mapToken.colorFillSecondary`，`colorFillAlter` 等于 `mapToken.colorFillQuaternary`

#### Scenario: 文本语义别名映射
- **WHEN** 调用 `formatToken(mapToken)`
- **THEN** `colorTextPlaceholder` 等于 `mapToken.colorTextQuaternary`，`colorTextDisabled` 等于 `mapToken.colorTextQuaternary`

#### Scenario: 图标色别名映射
- **WHEN** 调用 `formatToken(mapToken)`
- **THEN** `colorIcon` 等于 `mapToken.colorTextTertiary`，`colorIconHover` 等于 `mapToken.colorText`

#### Scenario: 间距比例由 size token 派生
- **WHEN** 调用 `formatToken(mapToken)`
- **THEN** `paddingXXS` 等于 `mapToken.sizeXXS`，`paddingXS` 等于 `mapToken.sizeXS`，`marginXXL` 等于 `mapToken.sizeXXL`

#### Scenario: 关闭 motion 时时长清零
- **WHEN** 以 `mapToken.motion === false` 调用 `formatToken(mapToken)`
- **THEN** `motionDurationFast`、`motionDurationMid`、`motionDurationSlow` 均为 `0`

#### Scenario: 屏幕断点常量
- **WHEN** 调用 `formatToken(mapToken)`
- **THEN** `screenXS` 为 `480`、`screenSM` 为 `576`、`screenMD` 为 `768`、`screenLG` 为 `992`、`screenXL` 为 `1200`、`screenXXL` 为 `1600`、`screenXXXL` 为 `1920`

### Requirement: genSizeMapToken
**尺寸 Map Token 生成器**

系统 SHALL 按公式 `sizeUnit * (sizeStep + offset)` 计算 `SizeMapToken`，其中 offset 分别为：XXL=+8、XL=+4、LG=+2、MD=+1、MS=0、size=0、SM=-1、XS=-2、XXS=-3。

#### Scenario: sizeUnit=4、sizeStep=4 的默认尺寸计算
- **WHEN** 调用 `genSizeMapToken({ sizeUnit: 4, sizeStep: 4 })`
- **THEN** `sizeXXL` 等于 `48`，`size` 等于 `16`，`sizeXXS` 等于 `4`

### Requirement: genCompactSizeMapToken — NOT IMPLEMENTED
**紧凑尺寸生成器 — 不实现**

紧凑模式的 size map token 生成器有意 **不实现**。移动端统一使用标准 `sizeStep`，因为 compact 会违反 Apple HIG 44×44pt 触控区域要求。

#### Scenario: 改用标准尺寸计算
- **WHEN** 调用 `genSizeMapToken({ sizeUnit: 4, sizeStep: 4 })`
- **THEN** 尺寸按标准 `sizeStep = 4` 计算

### Requirement: genFontMapToken
**字体 Map Token 生成器**

系统 SHALL 按指数增长公式 `base * e^(i/5)` 计算字号，结果取最接近的偶数整数，index 1 为基础字号。结果 SHALL 包含 5 个标题级别（index 6–2 对应 H1–H5）、SM/LG/XL 字号，以及按 `(fontSize + 10) / fontSize` 计算的行高（相较 ant-design 的 +8 调整为 +10，以更好地适配中文文字的阅读间距）。

#### Scenario: 字号按指数增长
- **WHEN** 调用 `genFontMapToken(16)`
- **THEN** `fontSize` 等于 `16`，`fontSizeLG` 大于 `fontSize`，`fontSizeHeading1` 为最大的标题字号

#### Scenario: 行高包含额外 padding（针对中文调整）
- **WHEN** 调用 `genFontMapToken(16)`
- **THEN** 各 `lineHeight*` 字段等于 `(fontSize + 10) / fontSize`（保留 3 位小数），以获得更好的中文字符间距

### Requirement: genCommonMapToken
**通用 Map Token 生成器**

系统 SHALL 从 seed 生成 `CommonMapToken`，其中动效时长以毫秒表示（Fast=100、Mid=200、Slow=300），`lineWidthBold = lineWidth + 1`，圆角各变体由 `genRadius` 计算。

#### Scenario: 动效时长以毫秒为单位
- **WHEN** 调用 `genCommonMapToken(seed)`
- **THEN** `motionDurationFast` 为 `100`（而不是 CSS 字符串 `"0.1s"`）

### Requirement: genRadius
**圆角生成器**

系统 SHALL 基于 `borderRadius` 基值自适应计算各圆角变体：LG 根据基值为 +1 或 +2；SM 根据基值在 4–8 之间递增；XS 以 `基值 < 6` 为阈值取 1 或 2；Outer 根据基值区间取 4 或 6。

#### Scenario: 圆角随基值自适应
- **WHEN** 调用 `genRadius(6)`
- **THEN** `borderRadiusLG` 等于 `8`，`borderRadiusSM` 等于 `4`，`borderRadiusXS` 等于 `2`
