## MODIFIED Requirements

### Requirement: ConfigProvider 提供组件全局配置

`@pennyspring/component` SHALL export `ConfigProvider` as a provider for component default behavior configuration.

#### Scenario: 使用 config 配置

- **WHEN** an application renders `ConfigProvider` with `config={{}}`
- **THEN** descendant component consumers SHALL be able to read an empty component configuration object

### Requirement: ConfigProvider 支持嵌套合并

Nested `ConfigProvider` instances SHALL inherit parent configuration and shallow-merge configuration by component group, with inner values overriding same-named outer values.

#### Scenario: 内层继承外层配置

- **WHEN** an outer provider supplies `config={{}}`
- **AND** an inner provider supplies `config={{}}`
- **THEN** consumers under the inner provider SHALL receive a component configuration object

### Requirement: TypeScript 类型完整导出

`@pennyspring/component` SHALL export public TypeScript types for component configuration.

#### Scenario: 导入配置类型

- **WHEN** a TypeScript consumer imports `ComponentConfig` and `ConfigProviderProps` from `@pennyspring/component`
- **THEN** TypeScript SHALL resolve those types from the package entry point

## REMOVED Requirements

### Requirement: Page 使用全局默认返回行为

**Reason**: `Page` is removed from `@pennyspring/component`, so it SHALL NOT define behavior through `ConfigProvider`.

**Migration**: Consumers SHALL implement page-level back behavior in their application navigation or another page container outside `@pennyspring/component`.

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
