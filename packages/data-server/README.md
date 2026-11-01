# @pennyspring/data-server

`@pennyspring/data` 的 Node.js 适配层，使用 [better-sqlite3](https://github.com/WiseLibs/better-sqlite3) 作为 SQLite 驱动，供 `@pennyspring/data-server-wrapper` 构建远程数据服务。

## 导出

| 导出                          | 说明                                             |
| ----------------------------- | ------------------------------------------------ |
| `createDatabase(filename)`    | 用 better-sqlite3 连接创建 Drizzle 实例          |
| `getDatabase(dbPath)`         | 打开数据库、执行迁移与默认数据初始化，并返回单例 |
| `runMigrations(db)`           | 从 `@pennyspring/data/drizzle` 目录执行迁移      |
| `createRemoteApi({ dbPath })` | 组装服务端 `Api`                                 |

## 使用

```ts
import { createRemoteApi, getDatabase } from '@pennyspring/data-server';

const db = await getDatabase('./server.db');
const api = createRemoteApi({ dbPath: './server.db' });
```

better-sqlite3 是同步驱动，适配器在出口将其断言为 `@pennyspring/data` 的 canonical 异步 `Database`；断言集中在一处，业务层不需要区分驱动。

`getDatabase` 与 RN 适配器一样是进程级单例，迁移文件通过 `require.resolve('@pennyspring/data/package.json')` 定位，因此发布时必须保证 `drizzle/` 目录随包存在。

## 开发

```bash
yarn workspace @pennyspring/data-server typecheck
yarn workspace @pennyspring/data-server build
yarn workspace @pennyspring/data-server test
```

## 许可

[MIT](../../LICENSE) © 2026 Byte-n
