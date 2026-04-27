## ADDED Requirements

### Requirement: getAlphaColor (blend variant — getAlphaColor.ts)
**混合变体：在给定背景下反推最优 alpha**

系统 SHALL 在 `getAlphaColor.ts` 中提供 `getAlphaColor(frontColor: string, backgroundColor: string)` 函数。该函数在 0.01 到 1.00 之间遍历 alpha 值，寻找使 `(front - bg * (1 - α)) / α` 的 RGB 分量均落在 `[0, 255]` 区间内的最优 alpha，并返回对应的 rgba 颜色字符串。此函数用于可混合颜色，例如 `colorSplit`、`controlOutline`、`colorErrorOutline`、`colorWarningOutline`。

#### Scenario: 混合能找到合法 alpha
- **WHEN** 调用 `getAlphaColor('#000', '#fff')`
- **THEN** 返回一个合法的 rgba 字符串，其在给定背景上的混合结果与原前景色在视觉上等价

#### Scenario: 混合回退到完全不透明前景
- **WHEN** 遍历过程中未找到合法 alpha
- **THEN** 返回完全不透明的前景色

#### Scenario: 对已半透明颜色保持原样
- **WHEN** 传入的前景色本身 alpha 已小于 1
- **THEN** 原色原样返回，不做修改

### Requirement: getAlphaColor (simple variant — colorAlgorithm.ts)
**简单变体：直接应用 alpha**

系统 SHALL 在 `colorAlgorithm.ts` 中提供 `getAlphaColor(baseColor: string, alpha: number)` 函数，通过 `FastColor.setA(alpha).toRgbString()` 直接对 base color 应用指定的 alpha。该简单变体用于中性色调色板的生成，此时直接设置 alpha 已足够。

#### Scenario: 简单模式直接应用 alpha
- **WHEN** 通过简单变体调用 `getAlphaColor('#1677ff', 0.5)`
- **THEN** 返回 `'rgba(22, 119, 255, 0.5)'`

### Requirement: getSolidColor (default — darken)
**默认算法：darken 加深**

系统 SHALL 在默认算法中提供 `getSolidColor(baseColor: string, brightness: number)` 函数，使用 `FastColor.darken(brightness)` 产生 base color 的加深版本。

#### Scenario: darken 降低亮度
- **WHEN** 以默认算法调用 `getSolidColor('#fff', 15)`
- **THEN** 返回的十六进制颜色比 `#fff` 更暗

### Requirement: getSolidColor (dark — lighten)
**暗色算法：lighten 提亮**

系统 SHALL 在暗色算法中提供 `getSolidColor(baseColor: string, brightness: number)` 函数，使用 `FastColor.lighten(brightness)` 产生 base color 的提亮版本。

#### Scenario: lighten 提升亮度
- **WHEN** 以暗色算法调用 `getSolidColor('#000', 8)`
- **THEN** 返回的十六进制颜色比 `#000` 更亮

### Requirement: generateColorPalettes (default)
**默认调色板生成**

系统 SHALL 使用 `@ant-design/colors` 的 `generate()` 在 default 模式下生成 10 级调色板，并按 `{1:0, 2:1, 3:2, 4:3, 5:4, 6:5, 7:6, 8:4, 9:5, 10:6}` 的索引映射将其从 10 色数组映射为最终结果。

#### Scenario: primary 色调色板生成
- **WHEN** 以 default 模式调用 `generateColorPalettes('#1677ff')`
- **THEN** 返回长度为 10 的数组，其中 index 6 等于 base color `#1677ff`

### Requirement: generateColorPalettes (dark)
**暗色调色板生成**

系统 SHALL 使用 `@ant-design/colors` 的 `generate(color, { theme: 'dark' })` 在暗色模式下生成 10 级调色板，并采用重新排序的索引映射以适配暗色模式下的对比度分布。

#### Scenario: dark 调色板重排对比度梯度
- **WHEN** 以 dark 模式调用 `generateColorPalettes('#1677ff')`
- **THEN** 调色板索引被重新映射为适合暗色模式的对比度（与 default 的映射不同）

### Requirement: generateNeutralColorPalettes (default)
**默认中性色调色板生成**

系统 SHALL 基于 `colorBgBase`（默认 `#fff`）与 `colorTextBase`（默认 `#000`）生成中性色 token，包括：4 级文本渐变（通过 alpha）、4 级填充渐变（通过 alpha）、5 级表面渐变（通过 solid color darken）以及 3 级边框渐变，均使用默认的 `getSolidColor`（darken）与 `getAlphaColor`（colorAlgorithm.ts 中的简单变体）。

#### Scenario: 默认中性色文本渐变
- **WHEN** 以 default 模式调用 `generateNeutralColorPalettes('#fff', '#000')`
- **THEN** 在 text base color 上，`colorText` 的 alpha 为 `0.88`、`colorTextSecondary` 为 `0.65`、`colorTextTertiary` 为 `0.45`、`colorTextQuaternary` 为 `0.25`

#### Scenario: 默认中性色表面渐变
- **WHEN** 以 default 模式调用 `generateNeutralColorPalettes('#fff', '#000')`
- **THEN** `colorBgContainer` 与 `colorBgElevated` 通过对 `colorBgBase` 施加不同 brightness 的 darken 生成

### Requirement: generateNeutralColorPalettes (dark)
**暗色中性色调色板生成**

系统 SHALL 为暗色模式生成中性色 token，`colorBgBase` 默认 `#000`、`colorTextBase` 默认 `#fff`，使用更高的填充 alpha（`0.18`、`0.12`、`0.08`、`0.04`）以及基于 lighten 的表面派生。

#### Scenario: 暗色中性色使用更高对比度填充
- **WHEN** 以 dark 模式调用 `generateNeutralColorPalettes('#000', '#fff')`
- **THEN** 各填充 alpha 均高于 default 模式的对应值（如 `colorFill` 为 `0.18` vs `0.15`）

#### Scenario: 暗色表面使用 lighten
- **WHEN** 以 dark 模式调用 `generateNeutralColorPalettes('#000', '#fff')`
- **THEN** `colorBgContainer` 由 `#000` 以 `brightness = 8` 执行 lighten 得到

### Requirement: generatePresetColorPalettes
**预设色调色板生成**

系统 SHALL 迭代 13 个预设色并对每个颜色调用 `generateColorPalettes`，生成 13 × 10 的调色板（从 `blue1..blue10` 到 `gold1..gold10`）。

#### Scenario: 生成全部 130 个预设色 key
- **WHEN** 调用 `generatePresetColorPalettes(seed, 'default')`
- **THEN** 返回结果包含 `blue1` 至 `blue10`、`purple1` 至 `purple10`、……、`gold1` 至 `gold10`，共 130 个 key

### Requirement: genColorMapToken
**颜色 Map Token 生成**

系统 SHALL 从 seed 值生成完整的 `ColorMapToken`：对 primary / success / warning / error / info / link 分别调用调色板生成器，并将每条 10 级渐变映射到语义 token 名称（step 1 = bg，step 6 = base，step 7 = active 等）。

#### Scenario: primary 色的语义映射
- **WHEN** 调用 `genColorMapToken(seed, { generateColorPalettes, generateNeutralColorPalettes })`
- **THEN** `colorPrimary` 等于调色板 step 6、`colorPrimaryBg` 等于 step 1、`colorPrimaryActive` 等于 step 7

#### Scenario: error 色含 bg filled hover
- **WHEN** `genColorMapToken` 处理 error 色
- **THEN** `colorErrorBgFilledHover` 等于 error 调色板 step 1 与 step 3 按 50% 比例混合的结果

### Requirement: toShadowStyle helper
**toShadowStyle 工具函数**

系统 SHALL 提供 `toShadowStyle(shadow: ShadowToken)` 函数，返回一个 React Native 的 `ViewStyle` 对象，其中的 `shadowColor`、`shadowOffset`、`shadowOpacity`、`shadowRadius`、`elevation` 字段直接来自 `ShadowToken`。

#### Scenario: toShadowStyle 映射五个属性
- **WHEN** 调用 `toShadowStyle({ shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.15, shadowRadius: 4, elevation: 3 })`
- **THEN** 返回 `{ shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.15, shadowRadius: 4, elevation: 3 }`

#### Scenario: toShadowStyle 结果可展开到 ViewStyle
- **WHEN** 开发者写 `<View style={[styles.base, toShadowStyle(token.boxShadow)]} />`
- **THEN** TypeScript 不报类型错误

### Requirement: ShadowToken generation from colorShadow
**从 colorShadow 生成 ShadowToken**

系统 SHALL 在 `formatToken` 中基于 `colorShadow` 基色，施加不同 alpha、预设 offset、模糊半径与 elevation，生成 `boxShadow`、`boxShadowSecondary`、`boxShadowTertiary` 三档 `ShadowToken`（相关参数已针对 RN iOS 的阴影表现进行调整，因为其默认比 CSS 阴影更"硬"）。

#### Scenario: boxShadow 为最深档阴影
- **WHEN** `formatToken(mapToken)` 生成 `boxShadow`
- **THEN** 其 blur radius 为 `12`、Y offset 为 `4`、opacity 为 `0.06`、elevation 为 `4`

#### Scenario: boxShadowSecondary 为中档阴影
- **WHEN** `formatToken(mapToken)` 生成 `boxShadowSecondary`
- **THEN** 其 blur radius 为 `8`、Y offset 为 `2`、opacity 为 `0.04`、elevation 为 `3`

#### Scenario: boxShadowTertiary 为最浅档阴影
- **WHEN** `formatToken(mapToken)` 生成 `boxShadowTertiary`
- **THEN** 其 blur radius 为 `4`、Y offset 为 `1`、opacity 为 `0.02`、elevation 为 `2`

#### Scenario: 阴影 token 含 Android elevation
- **WHEN** `formatToken(mapToken)` 生成任意一个阴影 token
- **THEN** 其 `elevation` 字段为一个整数，可直接用于 Android 的 `elevation` 属性
