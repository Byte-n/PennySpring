# @pennyspring/adb-tui

PennySpring 开发辅助 CLI：管理 Android 设备、配对无线调试，并把真机上的 SQLite 数据库监听同步到本地。基于 Ink 构建交互式 TUI。

## 环境要求

- Node.js >= 22.13
- 可用的 `adb`
- 用于 `db:watch` 的设备上必须是 debuggable 构建（依赖 `run-as`）

ADB 路径解析顺序：

1. `ADB_PATH`
2. `$ANDROID_HOME/platform-tools/adb`
3. `~/Library/Android/sdk/platform-tools/adb`
4. `PATH` 中的 `adb`

## 命令

```bash
# 交互式 TUI（无参数）
yarn adb:tui

# 列出设备
yarn adb:tui devices

# 扫描无线调试服务
yarn adb:tui wifi scan

# 扫描 → 输入 6 位配对码 → 配对并连接
yarn adb:tui wifi pair

# 连接已扫描到的无线设备
yarn adb:tui wifi connect

# 监听真机数据库变化并拉取到本地
yarn adb:tui db watch --serial <serial> [--once]
```

`db watch` 默认参数：

| 项 | 默认值 |
|---|---|
| 包名 | `com.pennyspring` |
| 远端数据库 | `/data/data/com.pennyspring/databases/pennyspring.db` |
| 本地数据库 | `./pennyspring.db` |
| 轮询间隔 | 2000 ms |

> `db:watch` 会覆盖本地目标数据库文件。执行前请确认本地没有未备份的数据。

## 作为包使用

```ts
import { createAdbClient, listDevices, scanWireless } from '@pennyspring/adb-tui';

const { client } = createAdbClient();
const devices = await listDevices(client);
const services = await scanWireless(client);
```

## 开发

```bash
yarn workspace @pennyspring/adb-tui dev
yarn workspace @pennyspring/adb-tui typecheck
yarn workspace @pennyspring/adb-tui test
```

`bin/adb-tui.cjs` 通过 `tsx` 直接运行 TypeScript 源码，适合本地开发；如果要分发，请先自行打包。

## 许可

[MIT](../../LICENSE) © 2026 Byte-n
