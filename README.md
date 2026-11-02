# PennySpring

本地优先的移动端记账应用。用 React Native 构建，数据默认保存在设备本地，按账本管理收支、转账、资产、标签与统计视图，并提供可选的 AI 记账助手、局域网/远程数据同步与备份迁移能力。

> 为什么叫 PennySpring：每一枚 penny 都值得被认真对待，每一段财务生活都可以重新发芽。详见 [PennySpring.md](./PennySpring.md)。

## 产品功能

### 记账与账本

- **多账本**：本地账本与网络账本（自建服务）并存，账本数据相互隔离，可在账本间切换。

> 数据存储接口采用同构设计，支持数据全量本地存储与自部署服务端存储

- **三类记录**：支出、收入、转账；支持退款吸收、报销吸收、信用卡还款、债权债务等特殊记账行为。
- **月度明细**：按月切换，按支出/收入/转账筛选，按日分组，支持隐藏金额、查看详情、编辑与删除。
- **分类体系**：类型管理支持分类树；标签管理支持多标签；资产管理支持资金账户、信用卡、储值卡、投资理财、债权债务等分类。
- **快捷模板**：把常用记录保存为模板，减少重复录入。

### 统计与图表

- **综合视图**：图表页提供概览、支出、收入、资产四个视图。
- **时间对比**：支持按月切换与多月对比，按类型、标签、资产维度聚合。
- **资产视图**：查看各资产账户的余额与构成。

### AI 助手

- **多提供商**：OpenAI Responses / Chat Completions、阿里云百炼，以及任意 OpenAI 兼容端点。
- **对话记账**：流式回复、工具调用、记录创建/更新确认卡片、图片附件与会话管理。
- **截图快捷记账（Android）**：发现新截图时弹出提醒，或从其他 App 分享图片到 PennySpring 时直接发起；由支持图片的模型解析并生成记账草稿。
- **本地语音转文字（Android）**：使用内置 sherpa-onnx 模型离线识别，音频不离开设备。

### 数据与迁移

- **备份与导入**：账本级/库级导出导入，可选打包图片与 AI 会话。
- **配置迁移**：AI 配置包、设置包可单独导出导入。
- **自动备份**：按计划备份到应用私有目录。
- **局域网收发**：两台设备在同一局域网内直接发送/接收备份包。
- **应用更新（Android）**：启动时检查 GitHub Releases，下载 APK 并校验 SHA-256 后安装。

### 个性化

- **主题**：10 套预设色板，支持明暗算法与完整 token 覆盖。

> 仓库同时附带可复用的 `@pennyspring/ui` 组件库与 `@pennyspring/theme` 主题引擎，见下方包文档。

## 客户端类型

| 客户端              | 平台          | 当前状态                                                                                 |
| ------------------- | ------------- | ---------------------------------------------------------------------------------------- |
| **PennySpring App** | Android       | 正式发布。GitHub Actions 构建 `arm64-v8a`、`armeabi-v7a` 与通用 APK，支持应用内更新。    |
| **PennySpring App** | iOS           | 提供原生工程，需自行本地构建与真机验证；尚未配置正式 Bundle ID、发布流水线与应用内更新。 |
| **数据服务**        | Node.js       | 可选的自建后端，为“网络账本”提供数据与媒体 API，不是记账客户端。                         |
| **组件预览 App**    | Android / iOS | 开发工具，用于预览 `@pennyspring/ui`，不对外发布。                                       |
| **Web**             | —             | 暂无记账 Web 客户端，仅提供组件库与主题文档站。                                          |

### 平台能力差异

| 能力                               | Android | iOS            |
| ---------------------------------- | ------- | -------------- |
| 记账、账本、类型/标签/资产、图表   | ✅      | ✅（本地构建） |
| 备份导入导出、自动备份、局域网收发 | ✅      | ✅（本地构建） |
| 应用内更新（GitHub Releases APK）  | ✅      | —              |
| 截图识别快捷记账                   | ✅      | —              |
| 本地语音转文字                     | ✅      | —              |

iOS 能力未纳入 CI 发布流程，实际可用性以本地构建和真机验证为准。

## 技术栈

| 领域       | 选型                                                                |
| ---------- | ------------------------------------------------------------------- |
| 应用       | React Native 0.85、React 19、TypeScript 5.8                         |
| 数据库     | op-sqlite + Drizzle ORM（RN）；better-sqlite3 + Drizzle ORM（Node） |
| 状态与数据 | Zustand、ahooks                                                     |
| 动画与手势 | react-native-reanimated 4、react-native-gesture-handler             |
| AI         | Vercel AI SDK、assistant-ui、zod                                    |
| 远程服务   | Hono + @hono/node-server                                            |
| 文档       | Docusaurus 3 + react-native-web                                     |
| 包管理     | Yarn 1 workspaces                                                   |

## 仓库结构

```text
.
├── App.tsx                  # 应用入口
├── android/                 # Android 原生工程
├── ios/                     # iOS 原生工程
├── src/                     # 应用代码（screens / features / agent / stores ...）
├── __tests__/               # 应用级测试
├── docs/                    # 业务与实现设计说明
├── scripts/                 # 发布、版本、ADB、工作区等脚本
└── packages/
    ├── pennyspring-theme/   # 主题引擎与预设色板
    ├── pennyspring-ui/      # RN 组件库、预览与 Web 文档
    ├── data/                # Drizzle schema、迁移、服务与 Api 工厂
    ├── data-rn/             # op-sqlite 适配器
    ├── data-server/         # better-sqlite3 适配器
    ├── data-server-wrapper/ # Hono 数据服务
    ├── api/                 # 本地/远程 Api 聚合入口
    ├── adb-tui/             # ADB 设备、无线调试与数据库监听 CLI
    └── share/               # 共享工具函数
```

各包的用途、API 与开发命令见对应目录下的 README：

- [@pennyspring/ui](./packages/pennyspring-ui/README.md)
- [@pennyspring/theme](./packages/pennyspring-theme/README.md)
- [@pennyspring/data](./packages/data/README.md)
- [@pennyspring/data-rn](./packages/data-rn/README.md)
- [@pennyspring/data-server](./packages/data-server/README.md)
- [@pennyspring/data-server-wrapper](./packages/data-server-wrapper/README.md)
- [@pennyspring/api](./packages/api/README.md)
- [@pennyspring/adb-tui](./packages/adb-tui/README.md)
- [@pennyspring/share](./packages/share/README.md)
- [UI 预览应用](./packages/pennyspring-ui/examples/README.md)

## 快速开始

### 环境要求

- Node.js >= 22.13（见 `.nvmrc`）
- Yarn 1.22
- Android：JDK 17、Android SDK、可用的 `adb`
- iOS：Xcode、CocoaPods（仅 macOS）

### 安装与运行

```bash
yarn install

# 启动 Metro（端口 8080）
yarn start

# 另开终端运行
yarn android   # debug 包使用 debug 后缀，可与正式包共存
yarn ios
```

品牌图标与启动图由 `src/assets/brand` 的 SVG 生成（需要本机 Chrome，可用 `CHROME_PATH` 覆盖）：

```bash
yarn generate:brand
```

## 常用命令

| 命令                        | 说明                                          |
| --------------------------- | --------------------------------------------- |
| `yarn format`               | 全仓格式化（Prettier / Swift / Kotlin）       |
| `yarn format:check`         | 校验全仓格式（CI 按语言分项执行）             |
| `yarn lint`                 | ESLint 全仓检查                               |
| `yarn typecheck`            | TypeScript 全仓类型检查                       |
| `yarn test`                 | Jest 全仓测试                                 |
| `yarn ws`                   | 交互式选择并执行任意 workspace 脚本           |
| `yarn android` / `yarn ios` | 运行 Android / iOS 调试包                     |
| `yarn release:android`      | 本地构建 Release APK（需要签名配置）          |
| `yarn adb:wireless`         | ADB 无线调试辅助                              |
| `yarn adb:tui`              | ADB TUI 与数据库监听（见 `packages/adb-tui`） |
| `yarn clean`                | 清理构建缓存（支持 `--app <dir>`）            |
| `yarn generate:brand`       | 生成品牌图标与启动图                          |

## 数据层

应用与数据层解耦：`@pennyspring/data` 持有 schema、迁移、services 与驱动无关的 `createApi(getDatabase)`；驱动由适配层注入。

```text
apps / api
   │
   ├── @pennyspring/data-rn ── op-sqlite（本地账本）
   └── @pennyspring/api/remote ── HTTP ── data-server-wrapper ── better-sqlite3（网络账本）
```

- 本地模式：`@pennyspring/api` 默认导出 `localApi`，数据落在应用私有目录的 `pennyspring.db`。
- 远程模式：设置 `DATA_MODE=remote` 后，Metro 将 `@pennyspring/api` 重定向到 `@pennyspring/api/remote`，通过 Bearer Token 访问自建数据服务。
- 迁移：schema 变更后运行 `yarn workspace @pennyspring/data db:generate`，迁移文件随包分发并在启动时执行。

业务约定中，数值 `0` 与空串 `''` 表示“未关联/未设置”，读取端按空值处理。

## 文档

```bash
# UI 组件文档（会先同步 preview 生成的文档文件）
yarn workspace @pennyspring/ui docs:dev

# 主题文档
yarn workspace @pennyspring/theme docs:dev
```

组件预览也可直接运行独立 App：

```bash
yarn workspace @pennyspring/ui-examples android
yarn workspace @pennyspring/ui-examples ios
```

线上文档（如已部署）：https://byte-n.github.io/pennyspring-ui/

## 安全与隐私

- 应用不包含统计、埋点或遥测。
- 记账数据默认只存于本地 SQLite；使用网络账本时，数据发往你自行部署的 `data-server-wrapper`，请求使用 Bearer Token 鉴权。
- 用户填写的模型 API Key 当前保存在本地数据库表 `tb_book_provider_key` 中（尚未接入系统 Keychain/Keystore）；账本备份包与 AI 配置包不会包含 API Key。
- 发布签名密钥不进入仓库：本地通过 `~/.gradle/gradle.properties` 注入，CI 通过 GitHub Actions Secrets 注入。
- 仓库忽略本地数据库、备份媒体、环境变量与签名文件。提交前请确认 `git status` 不包含个人数据。

如果你要基于本项目二次开发或公开演示，请先：

1. 轮换任何曾经写入本地文件、截图或提交历史的 API Key；
2. 清理 `pennyspring.db`、`packages/data-server-wrapper/server.db`、`media/` 等本地数据；
3. 检查 `.env.agent.local`、`android/app/*.keystore` 等本地文件没有被误提交。

## 贡献

欢迎 Issue 与 Pull Request。提交前请确保以下命令通过：

```bash
yarn lint
yarn typecheck
yarn test
```

提交信息使用 Conventional Commits（如 `feat:`, `fix:`, `docs:`, `chore:`）。

## 许可

[MIT](./LICENSE) © 2026 Byte-n

## 🙏 致谢

本项目开发过程中获得了 [LINUX DO](https://linux.do/latest) 社区佬友的帮助，本产品会在社区发布，感谢社区的支持。
