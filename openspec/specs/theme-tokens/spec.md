## Purpose

定义 PennySpring 主题 token 类型、派生算法与 React Native 适配约束。
## Requirements
### Requirement: SeedToken interface
系统 SHALL 提供 `SeedToken` TypeScript 接口，用于定义用户可覆盖的最小设计 token 集合（品牌色、中性基础色、字体族、基础字号、基础字重、圆角、size unit/step、控件高度、z-index 基准、透明度与动效参数）。该接口 SHALL 扩展 `PresetColorType`，包含 13 个预设色字段。

#### Scenario: SeedToken 扩展 PresetColorType
- **WHEN** 开发者查看 `SeedToken` 类型
- **THEN** 类型包含全部 13 个预设色字段（`blue`、`purple`、`cyan`、`green`、`magenta`、`pink`、`red`、`orange`、`yellow`、`volcano`、`geekblue`、`gold`、`lime`），均为 `string` 属性

#### Scenario: SeedToken 包含动效贝塞尔曲线
- **WHEN** 开发者读取 `SeedToken` 上的 `motionEaseOutCirc` 字段
- **THEN** 其值为 `CubicBezier` 元组 `[number, number, number, number]`，而不是 CSS 字符串

#### Scenario: SeedToken 保留 wireframe 以兼容 antd v5
- **WHEN** 开发者查看 `SeedToken` 类型定义
- **THEN** 其包含 `wireframe: boolean` 字段，用于兼容 ant-design v5（字段已废弃但予以保留）

#### Scenario: SeedToken 包含 fontWeight 种子
- **WHEN** 开发者查看 `SeedToken` 类型
- **THEN** 其包含 `fontWeight: number` 字段，默认值为 `400`

### Requirement: MapToken interface
系统 SHALL 提供 `MapToken` TypeScript 接口，该接口扩展 `SeedToken`，并合并所有 map 级子接口（`ColorMapToken`、`SizeMapToken`、`HeightMapToken`、`FontMapToken`、`StyleMapToken`、`CommonMapToken`）。

#### Scenario: MapToken 包含全部颜色渐变
- **WHEN** 开发者访问一个 `MapToken` 值
- **THEN** 其包含 primary 颜色的 10 级渐变（`colorPrimaryBg`、`colorPrimaryBgHover`、`colorPrimaryBorder`、`colorPrimaryBorderHover`、`colorPrimaryHover`、`colorPrimary`、`colorPrimaryActive`、`colorPrimaryTextHover`、`colorPrimaryText`、`colorPrimaryTextActive`），以及 success / warning / error / info 的等价渐变

#### Scenario: MapToken 包含中性色渐变
- **WHEN** 开发者访问 `MapToken.colorText`
- **THEN** 其包含 4 级文本颜色渐变（`colorText`、`colorTextSecondary`、`colorTextTertiary`、`colorTextQuaternary`），以及 4 级填充渐变（`colorFill` 至 `colorFillQuaternary`）

### Requirement: FontMapToken interface
系统 SHALL 提供 `FontMapToken` 接口，其中包含字号（SM、base、LG、XL）、5 个标题级别（H1–H5）、行高（base、LG、SM、XL 及每个标题对应行高）、以及 5 个字重档位（Light、Regular、Medium、SemiBold、Bold）。所有行高字段 SHALL 以像素为单位（`round(lineHeightRatio × fontSize)`），可直接用于 React Native 的 `lineHeight` 样式。所有字重字段 SHALL 为 `number` 类型。

#### Scenario: FontMapToken 行高为像素值
- **WHEN** 开发者访问 `FontMapToken.lineHeight`
- **THEN** 其为像素值（如默认 fontSize=16 时 `lineHeight` 为 `26`），而非倍数

#### Scenario: FontMapToken 包含 lineHeightXL
- **WHEN** 开发者访问 `FontMapToken.lineHeightXL`
- **THEN** 其为 XL 字号对应的像素行高

#### Scenario: FontMapToken 包含 lineHeightHeading 字段
- **WHEN** 开发者访问 `FontMapToken.lineHeightHeading1`
- **THEN** 其为 H1 标题对应的像素行高

#### Scenario: FontMapToken 不包含 fontHeight 字段
- **WHEN** 开发者查看 `FontMapToken` 类型
- **THEN** 类型中不存在 `fontHeight`、`fontHeightSM`、`fontHeightLG` 字段（已被像素化的 `lineHeight*` 取代）

#### Scenario: FontMapToken 包含 5 个字重字段
- **WHEN** 开发者访问 `FontMapToken`
- **THEN** 其包含 `fontWeightLight`、`fontWeightRegular`、`fontWeightMedium`、`fontWeightSemiBold`、`fontWeightBold`，均为 `number` 类型

#### Scenario: 字重值与 seed 的 fontWeight 关联
- **WHEN** 以 `seed.fontWeight = 500` 调用 `genFontWeightMap`
- **THEN** `fontWeightRegular` 等于 `500`，其余档位按固定间距偏移（Light=seed-100、Medium=seed+100、SemiBold=seed+200、Bold=seed+300）

### Requirement: AliasToken interface
系统 SHALL 提供 `AliasToken` TypeScript 接口，该接口扩展 `MapToken`，补充组件直接消费的语义 token，包括语义颜色、间距比例、阴影 token、控件交互状态，以及字重别名（`fontWeightStrong` 等同于 `fontWeightSemiBold`）。

#### Scenario: AliasToken 包含语义化间距
- **WHEN** 开发者访问 `AliasToken.paddingSM`
- **THEN** 其由 `sizeXXS`（SizeMapToken 中的 XXS 值）通过 formatToken 算法派生得到

#### Scenario: AliasToken 包含结构化阴影 token
- **WHEN** 开发者读取 `AliasToken.boxShadow`
- **THEN** 其值为 `ShadowToken` 对象，包含 `shadowColor`、`shadowOffset`、`shadowOpacity`、`shadowRadius`、`elevation` 字段（而非 CSS 字符串）

#### Scenario: fontWeightStrong 等于 fontWeightSemiBold
- **WHEN** 开发者访问 `AliasToken.fontWeightStrong`
- **THEN** 其值等于 `AliasToken.fontWeightSemiBold`

### Requirement: ShadowToken type
系统 SHALL 提供 `ShadowToken` 接口，包含 `shadowColor: string`、`shadowOffset: { width: number; height: number }`、`shadowOpacity: number`、`shadowRadius: number`、`elevation: number`。

#### Scenario: ShadowToken 可赋值给 RN ViewStyle
- **WHEN** 开发者将 `toShadowStyle(shadow)` 展开到 `ViewStyle`
- **THEN** 5 个阴影属性都能被 React Native 的 `View` 组件正确类型识别

### Requirement: PresetColorType and default preset values
系统 SHALL 定义覆盖 13 个预设色 key 的 `PresetColorType` record 类型，并导出 `defaultPresetColors`，其值为 ant-design 标准十六进制色。

#### Scenario: 默认预设色与 ant-design 一致
- **WHEN** 开发者导入 `defaultPresetColors`
- **THEN** `defaultPresetColors.blue` 等于 `'#1677FF'`，`defaultPresetColors.red` 等于 `'#F5222D'`

### Requirement: derivative pipeline (default)
系统 SHALL 提供 `derivative(seed: SeedToken, isDark: boolean)` 函数，通过组合调色板、color map token、size map token、font map token、font weight map token、height map token 与 common map token 等生成器，将 `SeedToken` 转换为完整的 `MapToken`。

#### Scenario: 默认派生产出完整 MapToken
- **WHEN** 调用 `derivative(defaultSeedToken, false)`
- **THEN** 返回对象同时包含全部 `SeedToken` 字段，以及 `ColorMapToken`、`SizeMapToken`、`FontMapToken`、`HeightMapToken`、`CommonMapToken` 的所有字段

#### Scenario: 默认模式使用 darken 计算 solid color
- **WHEN** 调用 `derivative(seed, false)`
- **THEN** `colorBgContainer` 通过对 `colorBgBase` 执行 darken 得到

#### Scenario: 默认派生包含字重 map token
- **WHEN** 调用 `derivative(defaultSeedToken, false)`
- **THEN** 返回对象包含 `fontWeightLight`、`fontWeightRegular`、`fontWeightMedium`、`fontWeightSemiBold`、`fontWeightBold`

### Requirement: derivative pipeline (dark)
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
系统 SHALL 不实现 compact 算法。移动端屏幕本身已足够紧凑，compact 模式会将控件高度压至 Apple HIG 44×44pt 触控区域最小值之下。

#### Scenario: compact 算法等同于默认行为
- **WHEN** 调用 `derivative(seed, false)`（不支持 compact）
- **THEN** size 相关 token 直接使用标准 `sizeStep`，不做压缩

### Requirement: formatToken (MapToken → AliasToken)
系统 SHALL 提供 `formatToken(mapToken: MapToken)` 函数，用于派生语义化 `AliasToken` 字段，包括：语义颜色映射、间距比例、阴影 token、控件交互状态、描边颜色，以及字重别名（`fontWeightStrong` 从 `mapToken.fontWeightSemiBold` 派生）。当 `motion` 为 `false` 时，所有动效时长字段 SHALL 被置为 `0`。

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

#### Scenario: fontWeightStrong 从 MapToken 派生
- **WHEN** 调用 `formatToken(mapToken)`
- **THEN** `fontWeightStrong` 等于 `mapToken.fontWeightSemiBold`，不再硬编码为 `600`

### Requirement: genSizeMapToken
系统 SHALL 按公式 `sizeUnit * (sizeStep + offset)` 计算 `SizeMapToken`，其中 offset 分别为：XXL=+8、XL=+4、LG=+2、MD=+1、MS=0、size=0、SM=-1、XS=-2、XXS=-3。

#### Scenario: sizeUnit=4、sizeStep=4 的默认尺寸计算
- **WHEN** 调用 `genSizeMapToken({ sizeUnit: 4, sizeStep: 4 })`
- **THEN** `sizeXXL` 等于 `48`，`size` 等于 `16`，`sizeXXS` 等于 `4`

### Requirement: genCompactSizeMapToken — NOT IMPLEMENTED
系统 SHALL 不实现紧凑模式的 size map token 生成器。移动端统一使用标准 `sizeStep`，因为 compact 会违反 Apple HIG 44×44pt 触控区域要求。

#### Scenario: 改用标准尺寸计算
- **WHEN** 调用 `genSizeMapToken({ sizeUnit: 4, sizeStep: 4 })`
- **THEN** 尺寸按标准 `sizeStep = 4` 计算

### Requirement: genFontMapToken
系统 SHALL 按指数增长公式 `base * e^(i/5)` 计算字号，结果取最接近的偶数整数，index 1 为基础字号。结果 SHALL 包含 5 个标题级别（index 6–2 对应 H1–H5）、SM/LG/XL 字号，以及按 `round((fontSize + 10) / fontSize * fontSize)` 计算的像素行高（相较 ant-design 的 +8 调整为 +10，以更好地适配中文文字的阅读间距）。所有 `lineHeight*` 字段 SHALL 为像素值，可直接用于 RN `lineHeight` 样式。

#### Scenario: 字号按指数增长
- **WHEN** 调用 `genFontMapToken(16)`
- **THEN** `fontSize` 等于 `16`，`fontSizeLG` 大于 `fontSize`，`fontSizeHeading1` 为最大的标题字号

#### Scenario: 行高为像素值
- **WHEN** 调用 `genFontMapToken(16)`
- **THEN** `lineHeight` 等于 `round(1.625 * 16)` = `26`（像素值），`lineHeightSM` 等于 `round(1.714 * 14)` = `24`

#### Scenario: 包含 lineHeightXL
- **WHEN** 调用 `genFontMapToken(16)`
- **THEN** 返回对象包含 `lineHeightXL` 字段，其值等于 `lineHeightHeading4`（因 `fontSizeXL = fontSizeHeading4`）

#### Scenario: 不包含 fontHeight 字段
- **WHEN** 调用 `genFontMapToken(16)`
- **THEN** 返回对象不包含 `fontHeight`、`fontHeightSM`、`fontHeightLG` 字段

### Requirement: genCommonMapToken
系统 SHALL 从 seed 生成 `CommonMapToken`，其中动效时长以毫秒表示（Fast=100、Mid=200、Slow=300），`lineWidthBold = lineWidth + 1`，圆角各变体由 `genRadius` 计算。

#### Scenario: 动效时长以毫秒为单位
- **WHEN** 调用 `genCommonMapToken(seed)`
- **THEN** `motionDurationFast` 为 `100`（而不是 CSS 字符串 `"0.1s"`）

### Requirement: genRadius
系统 SHALL 基于 `borderRadius` 基值自适应计算各圆角变体：LG 根据基值为 +1 或 +2；SM 根据基值在 4–8 之间递增；XS 以 `基值 < 6` 为阈值取 1 或 2；Outer 根据基值区间取 4 或 6。

#### Scenario: 圆角随基值自适应
- **WHEN** 调用 `genRadius(6)`
- **THEN** `borderRadiusLG` 等于 `8`，`borderRadiusSM` 等于 `4`，`borderRadiusXS` 等于 `2`

### Requirement: genFontWeightMap
系统 SHALL 提供 `genFontWeightMap(fontWeight: number)` 函数，以种子字重为基准生成 `FontMapToken` 中的 5 个字重字段。阶梯为固定偏移：Light = seed - 100、Regular = seed、Medium = seed + 100、SemiBold = seed + 200、Bold = seed + 300。

#### Scenario: 默认种子生成标准字重
- **WHEN** 调用 `genFontWeightMap(400)`
- **THEN** 返回 `{ fontWeightLight: 300, fontWeightRegular: 400, fontWeightMedium: 500, fontWeightSemiBold: 600, fontWeightBold: 700 }`

#### Scenario: 自定义种子整体平移
- **WHEN** 调用 `genFontWeightMap(500)`
- **THEN** 返回 `{ fontWeightLight: 400, fontWeightRegular: 500, fontWeightMedium: 600, fontWeightSemiBold: 700, fontWeightBold: 800 }`

#### Scenario: 边界值裁剪
- **WHEN** 调用 `genFontWeightMap(100)`
- **THEN** `fontWeightLight` 不低于 `100`（RN 最小值），其余按偏移计算

