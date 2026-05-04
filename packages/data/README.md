# @pennyspring/data

`packages/data` 数据层包，基于 Drizzle ORM + `@op-engineering/op-sqlite`，TypeScript schema 为唯一事实来源。

## 使用方式

```typescript
import { createDatabase, schema } from '@pennyspring/data'
import { open } from '@op-engineering/op-sqlite'

const connection = open({ name: 'pennyspring.db' })
const db = createDatabase(connection)
```

## Migration 工作流

本包采用 **"TS schema 为源，开发与生产都使用 migrations"** 的工作流：

- TypeScript schema（`src/schema/*.ts`）是数据库结构的唯一事实来源
- 结构变更通过 `drizzle-kit generate` 生成 migration SQL，并随 App 版本提交
- React Native 运行时不能直接读取 CLI 生成的 SQL 文件；新增 migration 后需要注册到 `src/runtime/migrations/bundle.ts`
- App 启动后先执行 `runMigrations(db)`，迁移完成后再进入业务读写
- 禁止将 `db:push` 作为开发或生产工作流；SQLite 结构变更必须可版本化、可回放

```bash
# 检查 migration 元数据一致性
yarn db:check

# 根据 TypeScript schema 生成 migration
yarn db:generate
```

```typescript
import { createDatabase, runMigrations } from '@pennyspring/data'
import { open } from '@op-engineering/op-sqlite'

const connection = open({ name: 'pennyspring.db' })
const db = createDatabase(connection)

await runMigrations(db)
```

## Schema 归一化说明

SQL 文档（`docs/database-tables.sql`）与 Drizzle TypeScript schema 之间存在以下归一化：

| 原始 SQL 写法 | 归一化后 | 原因 |
|---|---|---|
| `INTEGER NOT NULL DEFAULT ''` | `integer().notNull().default(0)` | 空字符串不是合法整数默认值 |
| `ON UPDATE CURRENT_TIMESTAMP` | `$onUpdateFn(() => Date.now())` | Drizzle ORM 写入路径下的毫秒级自动刷新 |
| `DEFAULT CURRENT_TIMESTAMP` | `$defaultFn(() => Date.now())` | 统一使用毫秒整数，而非 SQLite 文本时间戳 |

时间戳字段（`created_time` / `updated_time`）统一建模为毫秒整数（`integer({ mode: 'number' })`），与 React Native 侧消费方式保持一致。
