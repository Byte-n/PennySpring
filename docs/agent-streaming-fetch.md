# Agent 流式 Fetch 方案与风险

> 调研文档 · 最后更新 2026-10-27
> 关联：[agent-p0-plan.md](./agent-p0-plan.md)、[README.md](../README.md)

## 0. 结论

- **当前自研 agent 的 SSE 已经解决**：`src/agent/adapters/streamTransport.ts` 用 XHR `onprogress` + 增量 `responseText` 解析 SSE，不依赖 `Response.body`，现有链路无需改动。
- **只有接入 AI SDK / assistant-ui 等需要 Web Streams 的生态时，才需要换 fetch**。`assistant-ui` 本身不解决传输层，流式能力最终仍由 AI SDK 的请求层提供。
- 两个候选：
  - `expo/fetch`：AI SDK 官方推荐路径，但绑定 Expo SDK，SDK 56 会替换全局 `fetch`，且存在已确认的断连缺陷。
  - `react-native-nitro-fetch`：独立第三方库，不替换全局 `fetch`，但需要 `stream: true` 包装、Nitro Modules 与 Cronet。
- **当前建议**：不迁移。若确定接 AI SDK / assistant-ui，先做 PoC，并强制加超时/断连兜底，再决定选哪条。

---

## 1. 问题定义

React Native 内置 `fetch` 是 whatwg-fetch 基于 XHR 的实现，`Response.body` 不可读，只能等请求结束后 `.text()` / `.json()`。

但 XHR 本身支持增量：只要注册 `onprogress` / `onreadystatechange`，RN 会开启 incremental updates（`node_modules/react-native/Libraries/Network/XMLHttpRequest.js:557`），因此可以持续拿到 `responseText` 的新增部分。

当前实现的边界：

| 能力                   | 现有 XHR transport               | AI SDK / Web Streams 需要 |
| ---------------------- | -------------------------------- | ------------------------- |
| 增量读取               | ✅ `onprogress` + `responseText` | ✅ 需要                   |
| `Response.body`        | ❌ 不存在                        | ✅ `ReadableStream`       |
| `getReader()`          | ❌                               | ✅                        |
| `TextDecoder` 增量解码 | ❌ 手动字符串拼接                | ✅                        |
| 与 fetch 生态兼容      | ❌                               | ✅                        |

另外，现有 `streamTransport` 的 `xhr.timeout = 120_000` 是**总时长**而不是空闲超时，长回答可能被 120 秒截断；迁移 fetch 时应一并改为 idle timeout。

---

## 2. 方案 A：`expo/fetch`

### 2.1 接入方式

`expo/fetch` 随 `expo` 包提供，要求 Expo SDK 52+。项目当前 RN 0.85.2 + React 19.2，对应 **Expo SDK 56**：

| Expo SDK | React Native | 说明             |
| -------- | ------------ | ---------------- |
| 56       | 0.85         | 与本项目匹配     |
| 57       | 0.86         | 不匹配           |
| 58       | 0.88         | 当前最新，不匹配 |

安装时不要用 `install-expo-modules@latest`（目前 0.18.x，对应 SDK 58 / RN 0.88），否则会找不到兼容 SDK。SDK 56 对应 `0.15.x`：

```bash
npx install-expo-modules@0.15.0
# 确认 expo 锁在 SDK 56
# expo@~56.0.24
```

### 2.2 使用

```ts
import { fetch as expoFetch } from 'expo/fetch';
import { createOpenAI } from '@ai-sdk/openai';

const openai = createOpenAI({
  apiKey,
  baseURL,
  fetch: expoFetch as unknown as typeof fetch,
});
```

AI SDK 5/6 的 transport 也支持注入 `fetch`，例如 `DefaultChatTransport({ api, fetch: expoFetch })`。具体以所用 AI SDK 版本为准。

### 2.3 关键副作用

- **SDK 56 起，`expo/fetch` 会作为全局 `fetch` 安装**（iOS/Android）。因此现有 `src/agent/adapters/connectionTest.ts` 等所有 `fetch()` 调用都会切到新实现。
- 可通过 `EXPO_PUBLIC_USE_RN_FETCH=1` 保留 RN 原生 fetch，再显式 import `expo/fetch`。
- 请求不再走 RN 的 XHR 拦截器；证书固定、代理、日志等需要重新确认。

### 2.4 优点 / 缺点

| 优点                                         | 缺点                                      |
| -------------------------------------------- | ----------------------------------------- |
| AI SDK 官方 Expo 文档直接推荐                | 绑定 Expo SDK 版本，RN 升级需同步升级 SDK |
| 标准 `Response.body`，无需包装               | SDK 56 会替换全局 fetch，影响面大         |
| 同时补齐 ReadableStream / TextDecoder 等全局 | SDK 56 已不是最新，已知断连缺陷未回移     |
| 后续可复用 `expo-widgets` 等 Expo 能力       | 新增 ExpoModulesCore 原生依赖，需要重建   |

---

## 3. 方案 B：`react-native-nitro-fetch`

### 3.1 接入方式

```bash
npm i react-native-nitro-fetch react-native-nitro-modules
npm i react-native-nitro-text-decoder
```

要求 RN 0.75+、Nitro Modules、New Architecture。本项目 `android/gradle.properties` 已开启 `newArchEnabled=true`。

### 3.2 使用

```ts
import { fetch as nitroFetch } from 'react-native-nitro-fetch';

// nitro-fetch 只有 stream: true 时才返回 ReadableStream
const streamFetch = ((input, init) =>
  nitroFetch(input, { ...init, stream: true })) as typeof fetch;

const res = await streamFetch(url, { signal });
const reader = res.body!.getReader();
```

AI SDK 没有官方 nitro-fetch 集成文档，需要自行验证：

- `Response` / `ReadableStream` 的实例判断是否兼容；
- 非流式响应在 `stream: true` 下仍能正常 `.json()`；
- 错误响应与 `AbortController` 的行为。

### 3.3 优点 / 缺点

| 优点                                               | 缺点                                                                |
| -------------------------------------------------- | ------------------------------------------------------------------- |
| 不替换全局 fetch，现有调用不受影响                 | 需要自己包 `stream: true`                                           |
| 不绑定 Expo SDK，可独立升级                        | 库较新，生态和案例少于 Expo                                         |
| 支持 HTTP/3、Brotli、磁盘缓存、prefetch、WebSocket | Android 内嵌 Cronet，包体增大                                       |
| 原生 URLSession / Cronet，性能好                   | `timeoutMs` 在 `stream: true` 下无效，需要 AbortController + 定时器 |
|                                                    | 流式解码需要 `react-native-nitro-text-decoder`                      |

---

## 4. 方案 C：保持 XHR / 自研适配

- 继续使用现有 `streamTransport`：只适合自研 SSE，不满足 AI SDK 的 fetch 接口。
- 把 XHR 包成 `Response + ReadableStream`：可行，但需要自己维护 Response、Headers、backpressure、abort、错误语义。
- **不要使用 `react-native-polyfill-globals`**：npm 最后发布于 2022-01，底层 `react-native-fetch-api` 同样停更，与 RN 0.85 / 新架构组合没有保障。

---

## 5. 已知问题

### 5.1 `expo/fetch` 断连问题（重点）

对应 Expo issue [#50213](https://github.com/expo/expo/issues/50213)，指**响应头已收到、响应体传输中途连接中断**的场景。

#### iOS（SDK 56/57 受影响）

- `Response.text()` / `arrayBuffer()` / `json()` 等待 `.bodyCompleted` 状态。
- 连接中途断开时，URLSession 回调 `errorReceived`，状态永远到不了 `.bodyCompleted`。
- 结果：Promise 永久 pending，`AbortController.abort()` 也无法解开。
- 修复 PR [#48230](https://github.com/expo/expo/pull/48230) 于 2026-07-28 合并，**只进了 SDK 58，没有回移到 SDK 56/57**。

#### Android

- 响应体中途 `IOException` 被记录后，又被 `BODY_COMPLETED` 覆盖。
- 结果：`text()` / `arrayBuffer()` 把截断内容当成功返回，不抛错；`json()` 可能解析失败或静默拿到不完整数据。
- 修复 PR [#49324](https://github.com/expo/expo/pull/49324) 截至 2026-10 仍为 open。

#### 对项目的影响

- SDK 56 起 `expo/fetch` 是全局 fetch，`connectionTest.ts` 这类普通调用也会受影响。
- `connectionTest.ts` 现有的 `AbortController` 超时，在 expo/fetch 下可能无法让已经挂住的 `response.json()` 结束，需要外层 `Promise.race` 兜底。
- 流式聊天使用 `body.getReader()` 时，断连语义需要实测；至少不能假设 `abort()` 一定能终止，建议增加 idle timeout（例如 30 秒无新 chunk 就 cancel 并报错）。

### 5.2 版本锁定

- 项目 RN 0.85.2 只能匹配 Expo SDK 56。
- SDK 56 发布于 2026-05，早于 iOS 修复；不能指望它包含后续修复。
- 想拿到 iOS 修复需要升级到 RN 0.88 + SDK 58，属于一次较大的 RN 升级。

### 5.3 `nitro-fetch` 风险

- 非官方 AI SDK 集成，`Response` / `ReadableStream` 兼容性需要 PoC 验证。
- Android Cronet 会增加包体，并引入与 RN 原生网络栈不同的行为。
- `stream: true` 是库的扩展参数，不是标准 fetch 行为。
- 需要额外的 TextDecoder 依赖与超时管理。

### 5.4 旧 polyfill 风险

- `react-native-polyfill-globals`：最后发布 2022-01。
- `react-native-fetch-api`：最后发布 2022-01。
- 不建议在 RN 0.85 + 新架构上继续使用。

---

## 6. 决策建议

| 场景                                               | 建议                                                                                    |
| -------------------------------------------------- | --------------------------------------------------------------------------------------- |
| 只维护现有自研 agent                               | 保持 XHR transport，不引入原生依赖                                                      |
| 确定接 AI SDK / assistant-ui，且愿意引入 Expo 体系 | `expo/fetch` + SDK 56；必须加超时/断连兜底；长期看需升级 RN 0.88 + SDK 58 获取 iOS 修复 |
| 确定接 AI SDK / assistant-ui，但坚持裸 RN          | `react-native-nitro-fetch`；包一层 `stream: true`，配 TextDecoder，保留 XHR 作为回退    |
| 只想快速验证 AI SDK 可行性                         | 先 PoC `expo/fetch`（官方路径、代码最少），同时记录断连表现                             |

---

## 7. PoC 验收清单

在迁移 `useAgentChat` / `streamTransport` 前，至少验证：

- [ ] `GET /models` 非流式请求正常
- [ ] `POST /chat/completions` 流式文本逐块到达
- [ ] 流式 `tool_calls` 分片能正确拼装
- [ ] 流式中途 `AbortController.abort()` 能及时停止并释放资源
- [ ] 响应头到达后、body 中途断网（飞行模式/代理断开）：请求能在设定时间内失败，而不是永久挂起
- [ ] 超过 120 秒的长回答不会被总时长超时截断
- [ ] 401 / 403 / 404 / 429 / 5xx 仍能归一化为现有 `AgentError`
- [ ] 断连/超时后再次发起请求不受影响

---

## 8. 参考

- [Expo fetch API](https://docs.expo.dev/versions/latest/sdk/expo/)
- [AI SDK — Expo getting started](https://ai-sdk.dev/docs/getting-started/expo)
- [Expo SDK 56 changelog](https://expo.dev/changelog/sdk-56)
- [Expo SDK 57 changelog](https://expo.dev/changelog/sdk-57)
- [Expo SDK 58 changelog](https://expo.dev/changelog/sdk-58)
- [Install Expo modules in an existing React Native project](https://docs.expo.dev/bare/installing-expo-modules/)
- [expo/expo issue #50213](https://github.com/expo/expo/issues/50213)
- [PR #48230 — iOS text()/arrayBuffer() hang fix](https://github.com/expo/expo/pull/48230)
- [PR #49324 — truncated responses fix (open)](https://github.com/expo/expo/pull/49324)
- [react-native-nitro-fetch](https://github.com/margelo/react-native-nitro-fetch)
- [nitro-fetch Cronet 说明](https://github.com/margelo/react-native-nitro-fetch/blob/main/docs/cronet-android.md)
