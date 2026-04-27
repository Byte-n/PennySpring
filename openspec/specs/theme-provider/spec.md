## ADDED Requirements

### Requirement: ThemeProvider component
**主题 Provider 组件**

系统 SHALL 提供 `ThemeProvider` React 组件，接收 `config: ThemeConfig`（含可选的 `token` 与 `algorithm` 字段），并向所有子节点提供 `ThemeContext`。Token SHALL 通过 `useMemo` 以 `config.token` 与 `config.algorithm` 作为依赖进行 memoize。

#### Scenario: 无 config 时提供默认 token
- **WHEN** `<ThemeProvider>` 在未传 `config` 的情况下包裹组件树
- **THEN** 子组件调用 `useTheme()` 可获得包含全部默认 AliasToken 字段的 `token` 对象

#### Scenario: 通过 config.token 覆盖 token
- **WHEN** 渲染 `<ThemeProvider config={{ token: { colorPrimary: '#ff0000' } }}>`
- **THEN** 最终的 `token.colorPrimary` 为 `'#ff0000'`
- **AND** `config.token` 中与 SeedToken 重叠的字段（如 `colorPrimary`、`borderRadius`）会进入派生管线，使派生 token（如 `colorPrimaryBg`）反映该覆盖
- **AND** 仅属于 alias 的字段（如 `colorSplit`、`paddingXXS`）直接作为最终 AliasToken 的覆盖值写入

#### Scenario: 应用 dark 算法
- **WHEN** 渲染 `<ThemeProvider config={{ algorithm: 'dark' }}>`
- **THEN** `token.colorBgBase` 为暗色背景，`token.colorTextBase` 为暗色文本

#### Scenario: 忽略不支持的 compact 算法
- **WHEN** 渲染 `<ThemeProvider config={{ algorithm: ['compact'] }}>`
- **THEN** 主题使用默认尺寸（移动端不支持 compact）

#### Scenario: 仅应用 dark 算法
- **WHEN** 渲染 `<ThemeProvider config={{ algorithm: ['dark'] }}>`
- **THEN** 主题使用暗色配色 + 标准尺寸

#### Scenario: Token 结果被 memoize
- **WHEN** `<ThemeProvider>` 以同一个 `config` 引用重新渲染
- **THEN** Context 值保持同一个对象引用（不会被重新计算）

### Requirement: ThemeConfig type
**ThemeConfig 类型**

系统 SHALL 导出 `ThemeConfig` 接口，包含 `token?: Partial<AliasToken>`（允许覆盖任意 alias token，但只有与 seed 重叠的字段会进入派生管线）与 `algorithm?: ThemeAlgorithm | ThemeAlgorithm[]`（仅支持 `'default'` 与 `'dark'`，移动端不支持 compact）。

#### Scenario: ThemeConfig 字段全部可选
- **WHEN** 开发者以空对象 `{}` 作为 `ThemeConfig`
- **THEN** 类型检查通过，ThemeProvider 全部使用默认值

#### Scenario: algorithm 接受字符串或数组
- **WHEN** 传入 `algorithm: 'dark'`（等价于 `['dark']` 的简写）
- **THEN** 行为与 `algorithm: ['dark']` 完全一致

#### Scenario: Token 覆盖对 seed 与 alias 字段都生效
- **WHEN** `config.token` 同时包含 seed 字段（如 `colorPrimary`）和纯 alias 字段（如 `colorSplit`）
- **THEN** seed 字段进入派生管线，纯 alias 字段作为最终覆盖值写入

### Requirement: useTheme hook
**useTheme Hook**

系统 SHALL 提供 `useTheme()` hook，从 `ThemeContext` 返回 `{ token: AliasToken }`。

#### Scenario: useTheme 返回 alias token
- **WHEN** `<ThemeProvider>` 内的组件调用 `useTheme()`
- **THEN** 返回值为 `{ token }`，包含所有 AliasToken 字段（颜色、间距、字体、阴影、断点）

### Requirement: ThemeContext export
**ThemeContext 导出**

系统 SHALL 导出 `ThemeContext`，用于支持高级使用场景（class 组件、测试）。Context 值的类型 SHALL 为 `ThemeContextValue`，其中 `token` 字段类型为 `AliasToken`。

#### Scenario: ThemeContext 可直接消费
- **WHEN** class 组件通过 `static contextType = ThemeContext` 消费
- **THEN** 其接收到与 `useTheme()` 完全一致的 `{ token }` 值

### Requirement: Package entry point exports
**包入口导出**

系统 SHALL 在 `src/index.ts` 中导出全部公共 API：`ThemeProvider`、`useTheme`、`ThemeContext`、`toShadowStyle`、`defaultPresetColors`、`defaultSeedToken`、所有 token 类型（`SeedToken`、`MapToken`、`AliasToken`、`ShadowToken` 等）、`PresetColorGradientToken` 以及 `ThemeConfig`。

#### Scenario: 全部公共 API 可从包根导入
- **WHEN** 使用方写 `import { ThemeProvider, useTheme, toShadowStyle } from '@pennyspring/theme'`
- **THEN** 三个导入均能正确解析
