## Requirements

### Requirement: ConfigProvider 提供组件全局配置

`@pennyspring/component` SHALL export `ConfigProvider` as a provider for component default behavior configuration.

#### Scenario: 使用顶级快捷配置

- **WHEN** an application renders `ConfigProvider` with `config={{}}`
- **THEN** descendant component consumers SHALL be able to read an empty component configuration object

### Requirement: ConfigProvider 可选

Component consumers SHALL read component configuration successfully even when no `ConfigProvider` exists above them.

#### Scenario: 未包裹 Provider

- **WHEN** a component consumer calls the component config hook outside `ConfigProvider`
- **THEN** the hook SHALL return an empty component configuration object

### Requirement: ConfigProvider 支持嵌套合并

Nested `ConfigProvider` instances SHALL inherit parent configuration and shallow-merge configuration by component group, with inner values overriding same-named outer values.

#### Scenario: 内层覆盖同名字段

- **WHEN** an outer provider supplies `config={{}}`
- **AND** an inner provider supplies `config={{}}`
- **THEN** consumers under the inner provider SHALL receive a component configuration object

### Requirement: 组件通过统一 Hook 读取配置

`@pennyspring/component` SHALL export `useComponentConfig` as the supported hook for reading component configuration.

#### Scenario: Hook 公共导出

- **WHEN** a consumer imports `useComponentConfig` from `@pennyspring/component`
- **THEN** TypeScript SHALL resolve the import and its return type as `ComponentConfig`

### Requirement: TypeScript 类型完整导出

`@pennyspring/component` SHALL export public TypeScript types for component configuration.

#### Scenario: 导入配置类型

- **WHEN** a TypeScript consumer imports `ComponentConfig` and `ConfigProviderProps` from `@pennyspring/component`
- **THEN** TypeScript SHALL resolve those types from the package entry point
