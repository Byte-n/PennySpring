# @pennyspring/api

PennySpring 应用的 API 聚合入口。它把 `@pennyspring/data` 的领域类型与服务重新导出，并提供本地/远程两种 `Api` 实现。

## 入口

| 导入路径                    | 内容                                                                      |
| --------------------------- | ------------------------------------------------------------------------- |
| `@pennyspring/api`          | 重新导出 `@pennyspring/data`、`localApi`、`createRemoteApi`；默认本地模式 |
| `@pennyspring/api/remote`   | 远程 HTTP 客户端 `createRemoteApi(serverUrl, options)`                    |
| `@pennyspring/api/contract` | `API_BASE`、`buildPath(group, method)` 与通用错误类型                     |

## 本地模式

```ts
import { localApi } from '@pennyspring/api';

const books = await localApi.book.getAll();
```

`localApi` 由 `@pennyspring/data-rn` 创建，使用 op-sqlite。应用默认走这个入口。

## 远程模式

```ts
import { createRemoteApi } from '@pennyspring/api/remote';

const api = createRemoteApi('http://192.168.1.10:3000', {
  token: '<SERVER_TOKEN>',
  timeoutMs: 10_000,
});
```

远程实现使用 Proxy 把 `api[group][method](...args)` 映射为 `POST /api/<group>/<method>`，请求体是参数数组；因此新增 service 会自动获得远程支持，无需逐方法维护。请求超时默认 10 秒。

构建期设置 `DATA_MODE=remote` 时，根目录 `metro.config.js` 会把 `@pennyspring/api` 重定向到 `@pennyspring/api/remote`。远程入口不依赖 op-sqlite。

## 约定

- 远程契约是纯位置式（`group + method + 参数数组`），不要依赖对象参数或命名参数。
- 不要 `await api.group`：Proxy 的 group 是拦截器而非 Promise，直接 await 会触发 thenable 行为并发起无意义请求。
- `api.get` 在远程模式下不可用。

## 开发

```bash
yarn workspace @pennyspring/api typecheck
yarn workspace @pennyspring/api test
```

## 许可

[MIT](../../LICENSE) © 2026 Byte-n
