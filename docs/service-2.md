# 数据层多包架构方案

## 概述

把数据层拆成 5 个包，按「核心逻辑 / 驱动 / 客户端门面 / 服务端传输」彻底分离：

- **`@pennyspring/data`** — service 核心（驱动无关）：schema/relations/constants/services/`createApi`/`Database` 类型/api 形状类型。运行环境：通用。
- **`@pennyspring/data-rn`** — service + op-sqlite → api1。运行环境：RN（App 内嵌）。
- **`@pennyspring/data-server`** — service + better-sqlite3 → api2（无 HTTP）。运行环境：Node（服务器进程内）。
- **`@pennyspring/api`** — 对外暴露包装完成的 api1 / api2（api2 = HTTP+JSON 客户端，构建时注入 SERVER_URL）。运行环境：RN（客户端门面）。
- **`@pennyspring/data-server-wrapper`** — 依赖 data-server，把 api2 通过 HTTP path+json 暴露。运行环境：Node（服务器）。

调用方在构建期二选一：App 随项目打包用 api1（内嵌 SQLite）；单独脚本打包用 api2（HTTP 调服务器上的真实 api2）。

可行性根植于现状：schema/relations/constants/services 已是驱动无关（services 只依赖 `Database`/`Tx` + Drizzle 查询 API，无 op-sqlite/RN import）；驱动耦合仅 3 处薄接缝。重构 = 拆接缝 + 拆包 + 加客户端门面 + 加服务端 HTTP 层，非重写。

## 包依赖图

```
@pennyspring/data   ← 类型与契约中枢（api 形状 + 入参/返回类型定义一次）
   ▲        ▲        ▲
   │        │        │
 data-rn  data-server  api
 (api1)   (api2)       │ 依赖: data(类型) + data-rn(api1, 仅 local 子路径)
   │        │          │
   │        │          └─ api/remote ─── HTTP+JSON ──▶ data-server-wrapper
   │        │                                                    │
   │        └──────────────────────────────────────────────────── 依赖: data-server(api2)
   │                                                             + HTTP server 库
   ▼
 (RN App) imports @pennyspring/api (local 或 remote 子路径, 构建期 DATA_MODE 决定)
```

- `api/remote`（HTTP 客户端）与 `data-server-wrapper`（HTTP 服务端）**互不代码依赖**，仅靠 HTTP 契约对话；契约源是 `data` 的 api 形状 + 类型。
- `data` 是四端（api / data-rn / data-server / data-server-wrapper）的类型同步点。

## 各包职责与内容

### `@pennyspring/data`（service 核心，驱动无关）

```
src/
  schema/  relations/  constants/  services/   # 业务函数 (db, input) → result；db.transaction() 在此
  api-factory.ts       # createApi(getDatabase): Api —— api 形状定义一次
  types.ts             # Database canonical 类型 + 所有 input/output 类型
package.json: exports ".": "src/index.ts"
```

- 纯核心，无驱动、无 HTTP、无 RN。
- `createApi(getDatabase)` 归在此处（驱动无关，避免各适配层各写一遍 api 样板，DRY）。

### `@pennyspring/data-rn`（api1 = service + op-sqlite）

```
src/
  adapter-op-sqlite/
    database.ts        # createDatabase (op-sqlite drizzle)
    migrate.ts         # runMigrations (op-sqlite migrator, 用 migrations.js)
    getDatabase.ts     # 单例: open({name}) + createDatabase + runMigrations
    index.ts           # createApi1() = createApi(getDatabase) → 导出 api1
package.json: dependencies { "@pennyspring/data": "*", "@op-engineering/op-sqlite": "..." }
```

- api1 做成单例（op-sqlite `open({name})` 隐式落到 App 文档目录）。

### `@pennyspring/data-server`（api2 = service + better-sqlite3，无 HTTP）

```
src/
  adapter-better-sqlite/
    database.ts        # createDatabase (better-sqlite3 drizzle)
    migrate.ts         # runMigrations (better-sqlite3 migrator, 用 migrationsFolder)
    getDatabase.ts     # 单例: better-sqlite3(DB_PATH) + createDatabase + runMigrations
    index.ts           # createApi2({dbPath}) = createApi(getDatabase) → 导出 api2
package.json: dependencies { "@pennyspring/data": "*", "better-sqlite3": "...", "drizzle-orm": "..." }
```

- api2 做成工厂（better-sqlite3 需显式 `dbPath`）。**不含 HTTP**——传输由 data-server-wrapper 负责。

### `@pennyspring/api`（客户端门面：包装 api1 + api2-HTTP-客户端）

```
src/
  local.ts             # api1: 直接转发 data-rn 的 api1（拉入 op-sqlite）
  remote.ts            # api2: HTTP+JSON 客户端，fetch(SERVER_URL + path, JSON body)；构建期注入 SERVER_URL
  contract.ts          # 路由约定：path = /api/<group>/<method>，body = 入参对象，resp = 返回值 | {error}
package.json:
  exports: { ".": "src/index.ts", "./local": "src/local.ts", "./remote": "src/remote.ts" }
  dependencies: { "@pennyspring/data": "*", "@pennyspring/data-rn": "*" }
```

- 对外暴露「包装完成的 api1 / api2」。`api2` = HTTP 客户端，**构建时**注入 `SERVER_URL`，内部通过 HTTP+JSON 调服务端真实 api2。
- 子路径 `./local` 与 `./remote` 分离，使 remote 模式打包产物**不含 op-sqlite**。
- `api/remote` 基于 `fetch`（RN 与 Node 18+ 原生支持）。

### `@pennyspring/data-server-wrapper`（HTTP 服务端，包装 data-server 的 api2）

```
src/
  server.ts            # hono/Fastify: POST /api/<group>/<method> → 调 data-server 的 api2 对应函数 → 返回 JSON
  bin.ts               # 启动: createApi2({dbPath: env.DB_PATH}) + 挂路由 + listen(env.PORT)
package.json:
  bin: { "data-server-wrapper": "dist/bin.js" }
  dependencies: { "@pennyspring/data": "*", "@pennyspring/data-server": "*", "hono"|"fastify": "..." }
```

- 通过 path + json 调用 data-server 的 api2 函数（in-process），序列化为 HTTP 响应。
- 监听端口是 Node **运行时** `process.env.PORT`（不走构建期内联）。

## 调用链

**内嵌模式（local，App 随项目打包）：**
```
App → @pennyspring/api (/local, 经 Metro 别名重定向) → api1 → data-rn → services → op-sqlite 本地 DB
```

**远端模式（remote，单独脚本打包）：**
```
App → @pennyspring/api (/remote) → api2(HTTP client, SERVER_URL)
  ──HTTP+JSON──▶ data-server-wrapper (server.ts 路由)
                  → data-server api2 → services → better-sqlite3 服务器 DB
```

两种模式 App 业务代码不变（只 import `@pennyspring/api`），由构建期 `DATA_MODE` + Metro 别名决定走哪条。

## 构建期与运行期配置

- 客户端 `SERVER_URL` / `DATA_MODE` —— 时机：**构建期**；机制：`babel-plugin-inline-dotenv`（react-native-dotenv）内联 `process.env.SERVER_URL`/`process.env.DATA_MODE` 为字面量。跑 `SERVER_URL=... DATA_MODE=remote yarn start` 切模式。
- App 模式选择 —— 时机：构建期；机制：Metro module-resolver 别名：`DATA_MODE=local` → `@pennyspring/api` 重定向到 `./local`；`remote` → `./remote`。
- 服务器 `DB_PATH` / `PORT` —— 时机：运行时；机制：Node `process.env`，server-wrapper 启动时读取。

## 路由契约

- 约定：`POST /api/<group>/<method>`，请求体 JSON = 入参对象，响应 JSON = 返回值或 `{ error }`。
- `api/remote` 与 `data-server-wrapper` 各自按 `data` 的 api 形状机械实现，**不共享路由表文件**（约定优先）。
- 类型来自 `data` 的 input/output 类型，四端同步。
- 若以后出现客户端/服务端路由漂移，再补一个共享路由表包。

## 事务边界（重要）

事务边界 = service 函数边界，**保留在 services 层**（`data` 核心内），不在 `createApi`/`api1`/`api2`/`getDatabase`/HTTP 层。

- `getDatabase`：取得就绪 `Database` 句柄（open → createDatabase → runMigrations → memoize）——**不开**业务事务。
- `createApi`：调度器，1 方法 → 1 service 函数——**不开**事务。
- HTTP 层（`api/remote` / `data-server-wrapper`）：只做转发/序列化——**不开**事务。
- `services`：`db.transaction(async tx => {...})` 唯一所在地——**事务在这里**。

与 `data/coding-style.md` 一致：写操作必须在 `db.transaction` 内；Service 只接受 `Database`/`Tx`。不要在 `createApi`/HTTP 层再包事务——会与 service 内部事务冲突，破坏「1 API 方法 = 1 原子操作」映射。若需跨多个 service 函数的原子编排，在 services 新增编排函数开一个事务并把 `Tx` 传给子步骤（此时需把现有 service 拆成 `createBook(db)` / `createBookTx(tx)` 两层；当前无此需求则不动）。

## 驱动类型接缝：两端 API 一致性如何保证

services **不碰** op-sqlite / better-sqlite3 原生 API，只碰 Drizzle 的 `BaseSQLiteDatabase`；两个驱动的 `Database` 类都继承自它 → 运行期查询构建器 API 天然一致。**Drizzle 就是那层数据库抽象层**，一致性由它保证，不靠两个驱动恰好相同。

### 实测证据（drizzle-orm@0.45.2）

```
OPSQLiteDatabase<TSchema>       extends BaseSQLiteDatabase<'async', QueryResult, TSchema>   // drizzle-orm/op-sqlite/driver.d.ts
BetterSQLite3Database<TSchema>  extends BaseSQLiteDatabase<'sync',  RunResult,  TSchema>   // drizzle-orm/better-sqlite3/driver.d.ts
SQLiteTransaction<...>         extends BaseSQLiteDatabase<...>                             // drizzle-orm/sqlite-core/session.d.ts
```

- 三者同基类 `BaseSQLiteDatabase<TResultKind, TRunResult, TFullSchema, TSchema>`（在 `drizzle-orm/sqlite-core/db.d.ts`，驱动无关）。
- `tx`（事务对象）也继承自它 → `tx.select()/insert()/...` 与 `db` 同形。
- 两个 `Database` 类差异**仅两个泛型**：`'async' vs 'sync'`、`QueryResult vs RunResult`。方法名、链式构建器、`.transaction()` 签名全一致。
- `drizzle-orm/better-sqlite3/` 适配器随 drizzle-orm 一起安装，类型一开始就可用，不依赖 native `better-sqlite3` 是否已装。

### 共享 schema → 查询构建器类型一致

`sqliteTable` 定义在 `data` core，两端 `drizzle(conn, { schema })` 传入同一份 schema → 查询构建器的列类型、`.select().from(records)` 的返回行类型由 schema 同源推出，两端完全一致。

### 唯一真实分歧：sync vs async，4 步吸收

`'async'` vs `'sync'` 使 `.all()/.get()` 在 op-sqlite 返回 `Promise<T>`、在 better-sqlite3 返回 `T`（同步）：

1. canonical `Database` 取 **async 形态**（`BaseSQLiteDatabase<'async', QueryResult, DataSchema>`），定义在 `data` core。
2. TS 强制 `await`：canonical 说 `.all(): Promise<T[]>`，services 不 await 拿不到数组（不能下标 Promise）→ 类型系统逼每条查询 await。
3. better-sqlite3 的同步值可被 await（`await syncArray === syncArray`）→ 运行期行为与 op-sqlite 一致。
4. `data-server/adapter-better-sqlite/database.ts` 出口把 `'sync'` 实例断言成 canonical `'async'` `Database`，cast 关在唯一一处，services 看不到。

选 async canonical 的妙处：**用类型系统强制 await 纪律**——正因为强制 await，sync 驱动才行为一致，没人能写「不 await 的捷径」。

### 四层保障（从硬到软）

1. **结构**：`@pennyspring/data` 的 `dependencies` 只含 `drizzle-orm` + `@pennyspring/share`，**不含** op-sqlite / better-sqlite3；`tsconfig` 不解析驱动包。services 想用驱动特定 API 根本 import 不到——硬保证。
2. **类型**：canonical `Database`/`Tx` 来自 `drizzle-orm/sqlite-core` 的 `BaseSQLiteDatabase` + 共享 `DataSchema`；两端 conform（op-sqlite 原生、better-sqlite3 cast）。
3. **运行**：Drizzle 查询构建器对两端走同一 SQLite SQL 生成路径；两端都讲 SQLite；schema SQL（含 `cast(unixepoch('subsec')*1000 as integer)`）两端可跑（集成测试确认 SQLite 版本够新）。
4. **经验**：`data-server` 集成测试用临时 db 文件把**同一批 service 函数**对着 better-sqlite3 跑一遍，断言行为与 op-sqlite 一致——证明而非假设。

### 两个分歧点都在适配器边界吸收，services 无感

- sync/async `.get()/.all()` → canonical async 类型 + await + 适配器出口 cast（见上）。
- migrator：op-sqlite `migrate(db, {journal, migrations})` 吃 `migrations.js` bundle、返回 `Promise<void>`；better-sqlite3 `migrate(db, {migrationsFolder})` 读磁盘 `.sql`、返回 `void`。各自适配器有自己的 `migrate.ts`，见「迁移产物复用」。

### 必须守的纪律（补进 data/coding-style.md）

services 不得绕开 Drizzle 抽象层：

- 禁 `import` 自 `drizzle-orm/op-sqlite` / `drizzle-orm/better-sqlite3` / `@op-engineering/op-sqlite` / `better-sqlite3`（现有「禁直接 import 驱动」规则，强化为 `data` tsconfig 层面排除）。
- 禁 `db.run(sql\`...\`)` 裸 SQL、禁访问 `db.$client`（原始连接）——会绕过类型等价、可能用驱动特定语法。
- 只允许 Drizzle 查询构建器（`select/insert/update/delete` + `eq/and/or/count/desc` 等）+ `db.transaction()`。

一致性锁死在**结构 + 类型**两层，不靠人记得。具体类型签名在 plan 阶段定型。

## 迁移产物复用

`db:generate`（expo driver，配置在 `data` 包内）一次性产出 `drizzle/*.sql` + `meta/_journal.json` + `migrations.js`：

- api1（data-rn）：用 `drizzle-orm/op-sqlite/migrator` 的 `migrate(db, migrations.js bundle)`。
- api2（data-server）：用 `drizzle-orm/better-sqlite3/migrator` 的 `migrate(db, { migrationsFolder: '<drizzle 目录>' })`，读磁盘 `.sql` + `_journal.json`。

**一次 generate 两端共用，无需双跑、无需第二份配置。** api2 走 `migrationsFolder` 还顺带绕开 `migrations.js` 手维护的漂移。

## 关键风险与解法

1. **op-sqlite 不能在 Node 解析** → `api` 子路径 `./local` 与 `./remote` 分离 + Metro 别名，remote 模式产物不含 op-sqlite。
2. **`Database` 类型接缝** → 见「驱动类型接缝」节：两端同基类 `BaseSQLiteDatabase` + 共享 schema 保运行/类型一致；canonical async 类型强制 await + better-sqlite3 出口 cast + 四层保障（结构/类型/运行/经验）。
3. **文件路径与配置** → op-sqlite 隐式落 App 文档目录；better-sqlite3 显式 `process.env.DB_PATH`（运行时）。
4. **客户端/服务端契约漂移** → 类型中枢在 `data`（四端共用）；路由走约定。补共享路由表作为兜底。
5. **并发模型** → better-sqlite3 同步单线程；记账类低 QPS 够用。未来扩容换 libsql/外置 DB 仅再写一个适配器，services 不动。
6. **HTTP 层职责边界** → 鉴权/CORS/限流在 `data-server-wrapper`，不进 `data`/`data-server`。

## 待收拾（与架构正交）

- `.claude/rules/data/coding-style.md` 要求新迁移注册到 `src/runtime/migrations/bundle.ts`，实际是 `index.ts`，且 `drizzle/migrations.js` 手维护——文档与实现漂移。api2 走 `migrationsFolder` 已绕开。
- `@pennyspring/data` peerDep op-sqlite `^11.4.2` 与根 `package.json` 直接装的 `^15` 不一致，隐患，建议对齐（拆包后 op-sqlite 移至 data-rn 的 dependency，此问题随之消失）。
- 更新 `data/coding-style.md`：新增「services 禁裸 SQL / 禁 `db.$client` / 禁 import 驱动包（`data` tsconfig 层面排除）」纪律，把两端一致性锁死在结构+类型层（见「驱动类型接缝 · 必须守的纪律」）。

## 落地顺序

1. 建 `@pennyspring/data` 核心：抽 `createApi` 工厂 + `Database` 类型 + api 形状类型，迁入 schema/relations/constants/services。`yarn test` 全绿验证无回归。
2. 建 `@pennyspring/data-rn`：op-sqlite 适配器 + `createApi1`。App 暂仍走此包（等价于现状）。
3. 建 `@pennyspring/data-server`：better-sqlite3 适配器 + `createApi2`。补 Node 端集成测试（临时 db 文件跑 `createApi2` 全流程），证明 services 在 better-sqlite3 下行为与 RN 一致。
4. 建 `@pennyspring/data-server-wrapper`：HTTP 路由层 + `bin`。
5. 建 `@pennyspring/api`：`./local`（转发 api1）+ `./remote`（HTTP 客户端）+ `contract.ts`。配 Metro 别名与 `babel-plugin-inline-dotenv`。
6. App 切到从 `@pennyspring/api` 导入；验证 local/remote 两种构建期模式。
7. 收尾：`yarn lint && yarn typecheck` 强制通过。

## 核心收益

- **业务逻辑只写一份**（`data` 核心的 services），驱动是可替换接缝，传输是可替换层。
- **客户端门面**（`api`）让 App 业务代码与「本地内嵌 / 远端服务」解耦，切模式只改构建配置。
- **服务端逻辑与传输分离**（`data-server` vs `data-server-wrapper`），换传输层（HTTP→CLI→消息队列）不动业务。
- 今天换 better-sqlite3 上 Node，明天换 libsql/外置 DB 仅再写一个适配器，services 不动。
