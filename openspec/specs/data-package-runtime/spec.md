## ADDED Requirements

### Requirement: Data package provides a database bootstrap API
系统 MUST 在 `packages/data` 中提供可复用的数据库启动入口，用于接收 `@op-engineering/op-sqlite` 连接并创建绑定 schema 的 Drizzle 数据库实例。

#### Scenario: 使用 op-sqlite 连接创建数据库实例
- **WHEN** 调用方传入一个 `@op-engineering/op-sqlite` 打开的 SQLite 连接
- **THEN** `packages/data` 能返回一个绑定本包 schema 的 Drizzle 数据库实例

### Requirement: Runtime uses Drizzle op-sqlite driver directly
系统 MUST 使用 `drizzle-orm/op-sqlite` 作为 React Native SQLite 运行时接入层，而不是要求业务方自己实现自定义 proxy 适配。

#### Scenario: 运行时 API 不暴露自定义 proxy 前置要求
- **WHEN** 开发者阅读 `packages/data` 的数据库初始化 API
- **THEN** 初始化仅依赖 `@op-engineering/op-sqlite` 连接与本包导出的配置/工具

### Requirement: Package exports schema and runtime from a stable public entry
系统 MUST 从 `packages/data` 的包入口统一导出 schema、relations、数据库启动函数、数据库类型与必要的共享工具类型。

#### Scenario: 包根可导入公共数据层 API
- **WHEN** 使用方写 `import { createDatabase, schema } from '@pennyspring/data'`
- **THEN** 导入可以从包根解析，而不要求引用内部文件路径

### Requirement: Package includes drizzle-kit configuration for TypeScript-first schema workflow
系统 MUST 为 `drizzle-kit` 提供可执行配置，使 TypeScript schema 可以作为数据库结构的唯一事实来源。

#### Scenario: drizzle-kit 能定位 schema 入口
- **WHEN** 开发者在 `packages/data` 或仓库根执行约定的 drizzle-kit 命令
- **THEN** 工具能够加载本包的 schema 入口，而不需要手写建表 SQL 文件

### Requirement: Schema workflow uses versioned migrations
系统 MUST 支持基于 TypeScript schema 生成并提交 migration 的数据库工作流，开发与生产结构变更都不得依赖 `db:push` 直接同步。

#### Scenario: 开发者生成结构变更 migration
- **WHEN** 开发者按照 `packages/data` 提供的工作流修改 TypeScript Drizzle schema
- **THEN** 可以通过约定脚本生成可提交的 migration SQL
- **AND** 不需要使用 `db:push` 直接修改目标数据库结构

### Requirement: Runtime can apply app-side migrations
系统 MUST 在 `packages/data` 中提供 App 侧 migration 启动入口，用于在 `@op-engineering/op-sqlite` 数据库实例上执行已提交的 migration。

#### Scenario: App 启动时执行 migration
- **WHEN** 调用方创建绑定 schema 的 Drizzle 数据库实例
- **THEN** `packages/data` 能提供迁移函数执行当前包内的 migration bundle

### Requirement: Runtime documentation defines normalization and usage boundaries
系统 MUST 在数据包内记录运行时边界与 schema 归一化规则，至少说明毫秒时间戳约定、整数字段默认值归一化、以及开发与生产均使用 migrations。

#### Scenario: 开发者可以理解 schema 的归一化策略
- **WHEN** 开发者查看 `packages/data` 的 README、注释或等价文档入口
- **THEN** 能够明确知道哪些 SQL 文档字面值被归一化为更安全的 TypeScript/Drizzle 表达
