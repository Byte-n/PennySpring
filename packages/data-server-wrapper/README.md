# @pennyspring/data-server-wrapper

把 `@pennyspring/data-server` 提供的 `Api` 包装成可远程访问的 HTTP 服务。使用 [Hono](https://hono.dev)，同时提供通用 RPC 路由与图片读写路由。

## 启动

```bash
# 开发（tsx 直接运行源码）
DB_PATH=server.db SERVER_TOKEN=dev yarn workspace @pennyspring/data-server-wrapper dev

# 生产（先构建，再运行 dist/bin.js）
yarn workspace @pennyspring/data-server-wrapper build
DB_PATH=/data/pennyspring.db SERVER_TOKEN=<strong-token> \
  yarn workspace @pennyspring/data-server-wrapper start
```

### 环境变量

| 变量           | 必填 | 说明                                                     |
| -------------- | ---- | -------------------------------------------------------- |
| `DB_PATH`      | 是   | SQLite 文件路径；文件不存在会自动创建并执行迁移          |
| `SERVER_TOKEN` | 是   | Bearer 访问令牌，至少 3 个字符（生产环境请使用强随机值） |
| `PORT`         | 否   | 监听端口，默认 `3000`                                    |
| `MEDIA_DIR`    | 否   | 图片目录，默认与数据库同级的 `media/`                    |

启动后会打印本机、iOS 模拟器、Android 模拟器与局域网访问地址。

## 路由

所有请求（包括媒体读写）都必须携带 `Authorization: Bearer <SERVER_TOKEN>`。

### 通用 RPC

```http
POST /api/:group/:method
Content-Type: application/json

["参数1", "参数2"]
```

响应为 `{ "result": ... }` 或 `{ "error": "..." }`。`group` 只允许 `record / tag / type / book / asset / agent / provider / credential / quickTemplate / quickBook / agentConfig`，方法由 `@pennyspring/data` 的 `Api` 形状决定。服务端不在这里开启事务，事务边界保留在 services。

### 媒体

| 方法   | 路径                   | 说明                                                                       |
| ------ | ---------------------- | -------------------------------------------------------------------------- |
| `POST` | `/api/media/upload`    | `multipart/form-data`，字段 `booksId` 与 `file`；返回 `media:<uuid>.<ext>` |
| `GET`  | `/api/media/:fileName` | 按 UUID 文件名读取图片，带私有缓存头                                       |

上传会同时校验声明 MIME 与文件头，仅接受 JPEG / PNG / WebP，单文件上限 10 MB。

## 安全注意

- 令牌使用 SHA-256 + `timingSafeEqual` 比较，避免时序侧信道。
- 媒体文件名使用严格正则，拒绝路径穿越。
- 服务默认面向局域网使用；如需暴露到公网，请在反向代理层增加 TLS、限流与访问控制。

## 开发

```bash
yarn workspace @pennyspring/data-server-wrapper typecheck
yarn workspace @pennyspring/data-server-wrapper test
```

路由与启动逻辑的测试位于仓库根目录 `__tests__/dataServerWrapper*.test.ts`。

## 许可

[MIT](../../LICENSE) © 2026 Byte-n
