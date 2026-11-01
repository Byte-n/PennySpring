# @pennyspring/data-rn

`@pennyspring/data` 的 React Native 适配层，使用 [op-sqlite](https://github.com/OP-Engineering/op-sqlite) 作为 SQLite 驱动。

## 导出

| 导出 | 说明 |
|---|---|
| `createDatabase(connection)` | 用 op-sqlite 连接创建 Drizzle 实例 |
| `getDatabase()` | 打开 `pennyspring.db`、执行迁移与默认数据初始化，并返回单例 |
| `runMigrations(db)` | 执行 `@pennyspring/data/drizzle/migrations` 中打包的迁移 |
| `createLocalApi()` | 组装本地 `Api`，即应用默认使用的 `localApi` |

## 使用

```ts
import { createLocalApi, getDatabase } from '@pennyspring/data-rn';

const api = createLocalApi();
await getDatabase(); // 首次访问时打开数据库并完成迁移
```

`getDatabase()` 的初始化顺序为：`open({ name: 'pennyspring.db' })` → `createDatabase` → `runMigrations` → `ensureDefaultBook`。数据库文件由 op-sqlite 落在应用文档目录。

连接驱动类型在出口统一断言为 `@pennyspring/data` 的 canonical `Database`，避免把 op-sqlite 的私有类型泄漏到业务层。

## 开发

```bash
yarn workspace @pennyspring/data-rn typecheck
yarn workspace @pennyspring/data-rn test
```

`react-native` 是 peer dependency，需要在宿主 App 中安装。

## 许可

[MIT](../../LICENSE) © 2026 Byte-n
