# @pennyspring/data

PennySpring 的驱动无关数据层：Drizzle schema、关系、迁移、业务服务与 `Api` 工厂。包本身不打开数据库连接，由 `@pennyspring/data-rn`（op-sqlite）或 `@pennyspring/data-server`（better-sqlite3）注入。

## 目录

```text
src/
├── schema/       # sqliteTable 定义
├── relations/    # Drizzle relations
├── shared/       # 列定义、时间戳、枚举列
├── constants/    # 资产/类型/可见性等业务枚举
├── services/     # 账本、记录、标签、资产、AI 配置、快照等业务逻辑
├── seeds/        # 默认账本与系统类型
├── api-factory.ts# createApi(getDatabase)
└── db.ts         # schema 聚合
drizzle/          # 生成的 SQL 迁移、migrations.js 与 meta
```

核心表：`tb_books`、`tb_record`、`tb_type`、`tb_tag`、`tb_asset`、`tb_quick_template`、`tb_agent_*`、`tb_book_provider_key`，以及 `tb_record_with_record`、`tb_tag_with_record`、`tb_image_with_related` 关联表。

## 使用

```ts
import { createApi, type Database } from '@pennyspring/data';

export function createLocalApi(getDatabase: () => Promise<Database>) {
  return createApi(getDatabase);
}
```

`createApi` 按 `record / tag / type / book / asset / provider / quickBook / agentConfig / credential / quickTemplate / transfer / agent` 分组暴露方法，每个方法对应一个 service 函数；事务边界保留在 services 内。

业务约定：数值 `0` 与空串 `''` 表示“未关联/未设置”，写入允许空值，读取端按空值处理。

## 迁移

```bash
yarn workspace @pennyspring/data db:generate  # 根据 schema 生成 SQL 迁移
yarn workspace @pennyspring/data db:check     # 校验迁移一致性
```

生成的迁移位于 `drizzle/`，由适配层在数据库打开后执行。当前项目尚未进入正式使用阶段，schema 允许破坏性调整；正式发布后请改为增量迁移。

## 开发

```bash
yarn workspace @pennyspring/data typecheck
yarn workspace @pennyspring/data test
```

测试位于 `__tests__/`，覆盖 AI 配置、Agent、标签与账本迁移等主要 service 行为。

## 许可

[MIT](../../LICENSE) © 2026 Byte-n
