---
paths:
  - "packages/data/src/**/*.ts"
---

# Data 包编码风格

> 本文件针对 `packages/data` 扩展 [typescript/coding-style.md](../typescript/coding-style.md)。

## 适用范围

- 本文件适用于 `packages/data/src/**/*.ts`。
- Schema 为唯一事实来源；Service 层是唯一写入路径；Migration 是唯一结构变更路径。

## Schema 层

- 表名统一使用 `tb_` 前缀，通过 `sqliteTable` 定义。
- 主键必须使用 `primaryKeyColumn()`，禁止内联 `integer('id').primaryKey()`。
- 整数字段必须使用 `integerColumn(name)`，禁止 `integer(name, { mode: 'number' })`。
- 时间戳字段必须使用 `timestampColumns()`，禁止手动定义 `createdTime` / `updatedTime`。
- 枚举字段必须使用 `enumColumn<T>(name)`。
- 时间戳统一毫秒整数，禁止 SQLite 文本时间戳（`CURRENT_TIMESTAMP`）。
- 字段默认值类型必须与字段类型一致，整数字段禁止 `default('')`。
- 禁止在 schema 中定义外键约束（`references()`）；外键约束由 Service 层业务逻辑保证。

## Service 层

- 所有写操作（insert / update / delete）必须在 `db.transaction()` 内执行。
- 事务内操作使用 `Tx` 类型参数，禁止在事务回调内直接使用外层 `db`。
- 业务校验（如金额范围）在进入 `transaction` 前执行。
- 查询不到必要行时必须抛出明确错误（`throw new Error('X not found: id')`），禁止返回 `null` / `undefined` 后在外部静默处理。
- Service 函数只接受 `Database` 或 `Tx`，禁止直接 import `drizzle` 或 `op-sqlite` 连接对象。
- 输入类型定义在 `services/types.ts`，禁止在 service 文件内联定义 input interface。
- 禁止在 service 层直接操作 `relations`，关联查询通过 Drizzle `with` 子句完成。
- 外键为 `0` 代表此字段值为 `0`, 不需要校验直接写入数据库中。
- 参数错误、外键约束不通过等违反业务规格的，统一直接抛出对应的异常(中文)

## Migration 工作流

- Schema 变更后必须运行 `yarn workspace @pennyspring/data db:generate` 生成 migration SQL。
- 新生成的 migration 必须注册到 `src/runtime/migrations/bundle.ts`。
- 禁止使用 `db:push` 作为开发或生产工作流。
- 禁止直接修改已提交的 migration SQL 文件；需要修改结构时必须生成新 migration。
- Migration 文件与 `bundle.ts` 注册必须在同一次提交中完成。
