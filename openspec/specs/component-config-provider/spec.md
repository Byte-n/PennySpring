## Requirements

### Requirement: ConfigProvider 提供组件全局配置

`@pennyspring/component` SHALL export `ConfigProvider` as a provider for component default behavior configuration.

#### Scenario: 使用顶级快捷配置

- **WHEN** an application renders `ConfigProvider` with `page={{ onBack }}`
- **THEN** descendant component consumers SHALL be able to read `page.onBack` from component configuration

#### Scenario: 使用 config 配置

- **WHEN** an application renders `ConfigProvider` with `config={{ page: { onBack } }}`
- **THEN** descendant component consumers SHALL be able to read `page.onBack` from component configuration

### Requirement: ConfigProvider 可选

Component consumers SHALL read component configuration successfully even when no `ConfigProvider` exists above them.

#### Scenario: 未包裹 Provider

- **WHEN** a component consumer calls the component config hook outside `ConfigProvider`
- **THEN** the hook SHALL return an empty component configuration object

### Requirement: ConfigProvider 支持嵌套合并

Nested `ConfigProvider` instances SHALL inherit parent configuration and shallow-merge configuration by component group, with inner values overriding same-named outer values.

#### Scenario: 内层覆盖同名字段

- **WHEN** an outer provider supplies `page.onBack` and an inner provider supplies another `page.onBack`
- **THEN** consumers under the inner provider SHALL receive the inner `page.onBack`

#### Scenario: 内层保留外层不同字段

- **WHEN** an outer provider supplies one `page` field and an inner provider supplies a different `page` field supported by the same config type
- **THEN** consumers under the inner provider SHALL receive both the outer field and the inner field

#### Scenario: 同层快捷配置覆盖 config 配置

- **WHEN** one `ConfigProvider` receives both `config={{ page: { onBack: first } }}` and `page={{ onBack: second }}`
- **THEN** consumers under that provider SHALL receive `second` as `page.onBack`

### Requirement: 组件通过统一 Hook 读取配置

`@pennyspring/component` SHALL export `useComponentConfig` as the supported hook for reading component configuration.

#### Scenario: Hook 公共导出

- **WHEN** a consumer imports `useComponentConfig` from `@pennyspring/component`
- **THEN** TypeScript SHALL resolve the import and its return type as `ComponentConfig`

### Requirement: Page 使用全局默认返回行为

`Page` SHALL use `page.onBack` from component configuration when its local `onBack` prop is absent.

#### Scenario: Page 使用 ConfigProvider onBack

- **WHEN** `Page` is rendered under `ConfigProvider page={{ onBack }}`
- **AND** `Page` does not receive a local `onBack` prop
- **AND** its back button is pressed
- **THEN** the configured `onBack` callback SHALL be called

#### Scenario: Page 局部 onBack 优先

- **WHEN** `Page` is rendered under `ConfigProvider page={{ onBack: globalBack }}`
- **AND** `Page` receives `onBack={localBack}`
- **AND** its back button is pressed
- **THEN** `localBack` SHALL be called
- **AND** `globalBack` SHALL NOT be called

#### Scenario: Page 无 Provider 保持现有行为

- **WHEN** `Page` is rendered without `ConfigProvider`
- **THEN** it SHALL render without requiring global component configuration

### Requirement: TypeScript 类型完整导出

`@pennyspring/component` SHALL export public TypeScript types for component configuration.

#### Scenario: 导入配置类型

- **WHEN** a TypeScript consumer imports `ComponentConfig`, `ConfigProviderProps`, and `PageConfig` from `@pennyspring/component`
- **THEN** TypeScript SHALL resolve those types from the package entry point
