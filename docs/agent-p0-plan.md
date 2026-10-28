# Agent P0 实施计划与进度

> 交接文档 · 最后更新 2026-10-27
> 接手前先读：[CLAUDE.md](../CLAUDE.md)、[.claude/rules/data/coding-style.md](../.claude/rules/data/coding-style.md)、[.claude/rules/typescript/coding-style.md](../.claude/rules/typescript/coding-style.md)

## 0. 现状一句话

**S1 数据层、S2 core 循环、S3 装配与 UI 均已实现；自动化检查（lint / typecheck / test / iOS bundle）全绿。S4 的端侧人工验收（原生重建 + 真机流程）仍待执行。**

---

## 1. 硬约束（决定了整个方案）

项目**只有 App 客户端，没有后端，且明确未来也不会提供**。

因此所有依赖运行时服务端的方案全部出局：

| 被否方案 | 否因 |
|---|---|
| CopilotKit（`@copilotkit/react-native`） | 必须有 Copilot Runtime 服务端 |
| Vercel AI SDK 服务端 `streamText` | 需要服务端 |
| LangGraph / Mastra | 需要服务端进程 |
| 纯端侧推理（llama.rn / Apple Foundation Models） | 用户明确不需要 |
| Firebase AI Logic | 需绑定 GCP 项目 |
| 自有 Key 内嵌客户端 | 会被提取，且可能被封禁 |

**最终方案**：BYOK + OpenAI-compatible 直连 + 客户端自研 tool loop。

---

## 2. 已定决策

| 项 | 决策 |
|---|---|
| 协议 | 只做 OpenAI-compatible（`{baseUrl}/chat/completions`），Anthropic 原生协议留 P2 |
| Key 来源 | 用户在设置页填 Base URL / API Key / 模型名 |
| Key 存储 | `react-native-keychain`（**已装 10.0.0，尚未重建原生**） |
| 工具执行 | 设备端执行，直接调 `localApi`，不走 HTTP |
| 一期工具 | **仅 1 个只读工具** `queryRecords`，不做任何写库 |
| 上下文 | 仅全局：账本 id/名称/币种 + 类型字典；不做逐屏注入 |
| 对话持久化 | **存完整链**（含 tool_calls 与 tool 结果），落 sqlite |
| 会话模型 | 一账本多会话；启动恢复最近会话，可新建、切换、删除 |
| 上下文截断 | 拼请求时取最近 20 条，且不切断 tool_call 与其 tool 结果的配对 |
| UI 形态 | 悬浮球 + 底部抽屉 |
| 代码分层 | `src/agent/{core,adapters,tools,projection,ui}`，**core 零 RN 依赖** |
| 分包 | P0 不建 `packages/agent`；core 达到触发条件后整目录 `git mv` |

---

## 3. 端点实测结论

联调端点（凭据在 `.env.agent.local`，已被 gitignore；**不要提交、不要写进代码**）。

| 项目 | 结果 |
|---|---|
| Base URL | 必须是 `https://www.fastaitoken.com/v1`，根域不够 |
| 模型 | 8 个：`gpt-5.5`、`gpt-5.6-sol`、`gpt-6-astra`、`gpt-6-sol`、`gpt-6.1-sol`、`codex-auto-review`、`gpt-image-2`、`gpt-image-2.5` |
| tools | 支持，`arguments` 合法 JSON，`id` 正常返回 |
| 流式 | 真流式：217 chunk / 246 字 / 5241ms |
| tool loop 闭环 | 成立（回灌 `role: 'tool'` 后 `finish_reason=stop` 并正确引用结果） |
| 固定注入 | **每次请求 prompt_tokens ≈ 4387，其中 cached 4224**，是站点注入的黑盒 system prompt |
| TTFT | ≈ 2025ms，约 47 字/秒 |

两个直接影响实现的结论：

1. **上下文预算从 4.4k 起跳**。工具 schema + 历史 + 工具结果都叠在它上面。
2. **首字要等 2 秒**，抽屉必须有"思考中"态，否则用户以为没反应。

---

## 4. 目标结构

```
src/agent/
├─ core/                     # 纯 TS，零 RN 依赖，将来可整目录抽成包
│  ├─ types.ts               # ChatMessage / ToolCall / StreamEvent / TokenUsage
│  ├─ protocol/openai.ts     # 请求构造 + SSE 解析 + tool_calls 分片拼装
│  ├─ protocol/errors.ts     # 401/404/429/网络错误归一化
│  └─ loop/runAgent.ts       # 循环调度，transport 与 toolExecutor 外部注入
├─ adapters/                 # RN 相关
│  ├─ streamTransport.ts     # 基于 XHR/react-native-sse 的 SSE transport
│  ├─ secureKey.ts           # react-native-keychain 读写
│  └─ configStore.ts         # zustand + persist（复用 bookStorage 的 op-sqlite Storage）
├─ tools/queryRecords.ts     # 只读查询工具
├─ projection/record.ts      # 工具结果裁剪（字段白名单 + 条数上限 + 金额单位换算）
└─ ui/
   ├─ AgentRoot.tsx          # 覆盖层容器（Provider + Fab + Drawer）
   ├─ AgentFab.tsx
   ├─ AgentDrawer.tsx
   └─ AgentSettingsPanel.tsx # Base URL / Key / 模型 / 连通性测试
```

`core` 的合法依赖只有 TypeScript 标准库与（可选）`zod`。**禁止** import `react`、`react-native`、`@pennyspring/*`。

---

## 5. 进度

### S1 数据层 ✅ 已完成

| 文件 | 状态 |
|---|---|
| `packages/data/src/schema/agent.ts` | 新增：`tb_agent_thread`、`tb_agent_message` |
| `packages/data/src/schema/index.ts` | 导出 agent 表 |
| `packages/data/src/constants/index.ts` | 新增 `AGENT_MESSAGE_ROLE` + `AgentMessageRoleValue` |
| `packages/data/src/services/agent-service.ts` | 新增：会话与消息读写 |
| `packages/data/src/services/types.ts` | 新增 `AgentThreadRow` / `AgentMessageRow` / `AgentThreadDetail` / `CreateAgentMessageInput` |
| `packages/data/src/services/index.ts` | 导出新 service 与类型 |
| `packages/data/src/api-factory.ts` | 新增 `api.agent.*` 七个方法 |
| `packages/data/drizzle/0001_jittery_ultimates.sql` | drizzle-kit 生成 |
| `packages/data/drizzle/meta/0001_snapshot.json`、`_journal.json`、`migrations.js` | 同上 |
| `packages/data/__tests__/agent-service.test.ts` | 12 个用例 |

**api 形状**（`localApi.agent.*`）：

```ts
createThread(booksId): Promise<AgentThreadRow>
listThreads(booksId): Promise<AgentThreadRow[]>
getLatestThreadWithMessages(booksId): Promise<{ thread, messages }>
getThreadDetail(threadId): Promise<{ thread, messages }>
appendMessages(threadId, inputs): Promise<AgentMessageRow[]>
updateThreadTitle(threadId, title): Promise<AgentThreadRow>
deleteThread(threadId): Promise<void>
```

**验证结果**：`npx jest --watchman=false packages/data/__tests__/agent-service.test.ts` → 9/9 通过；`yarn workspace @pennyspring/data typecheck` 通过；相关文件 eslint 无报错。

### S2 core 循环 ✅ 已完成

| 文件 | 内容 |
|---|---|
| `src/agent/core/types.ts` | `ChatMessage` / `ToolCall` / `StreamEvent` / `TokenUsage` / `Transport` / `ToolExecutor` |
| `src/agent/core/protocol/openai.ts` | 请求构造（OpenAI 消息映射）、SSE 行缓冲解析、tool_calls 按 index 分片拼装 |
| `src/agent/core/protocol/errors.ts` | 401/403/404/429/5xx/网络/超时/中断归一化为 `AgentError`（中文文案） |
| `src/agent/core/context.ts` | 历史窗口默认 20 条，保留首部 system，且不切断 assistant(tool_calls) 与 tool 结果 |
| `src/agent/core/loop/runAgent.ts` | 工具循环（默认 3 步、硬上限 5）、AbortSignal、usage 收集、工具异常回灌 |
| `src/agent/core/url.ts` | Base URL 归一化与 `/chat/completions`、`/models` 拼接 |

**接口调整**：`Transport` 不再携带 baseUrl/apiKey/model，改由适配层闭包绑定（`createXhrStreamTransport({ baseUrl, apiKey, model })`），core 保持纯函数式依赖注入。

**测试**：`__tests__/agent/openai.test.ts`（15）、`runAgent.test.ts`（11）、`url.test.ts`（6），全部通过。

### S3 装配与 UI ✅ 已完成

| 文件 | 内容 |
|---|---|
| `src/agent/adapters/streamTransport.ts` | XHR `onprogress` + 增量 `responseText` 手写 SSE；120s 超时、AbortSignal、HTTP/网络错误归一化 |
| `src/agent/adapters/secureKey.ts` | `react-native-keychain` 读写，service = `pennyspring.agent`；Key 不进入配置库 |
| `src/agent/adapters/configStore.ts` | zustand + persist（复用 op-sqlite Storage），仅持久化 `baseUrl` / `model` |
| `src/agent/adapters/connectionTest.ts` | `GET {baseUrl}/models` 连通性测试，中文结果提示 |
| `src/agent/tools/queryRecords.ts` | 只读查询工具，本地 API 拉取后在内存过滤/聚合 |
| `src/agent/projection/record.ts` | 金额分→元、字段白名单、条数/分组上限、按类型祖先展开 |
| `src/agent/projection/context.ts` | system prompt：账本、当前日期、类型字典、只读约束、相对时间规则 |
| `src/agent/ui/chatModel.ts` | 持久化行 ↔ `ChatMessage` 双向映射、tool_calls/usage 解析、token 汇总 |
| `src/agent/ui/useAgentChat.ts` | 会话加载/切换/新建/删除、持久化、标题、流式文本、工具状态、停止 |
| `src/agent/ui/AgentRoot.tsx` | 覆盖层 + 错误边界；Home 显示悬浮球，其他路由隐藏；远程模式提示后禁用 |
| `src/agent/ui/AgentDrawer.tsx` | 底部抽屉：消息气泡、空态建议、流式输出、思考/工具状态、输入与停止 |
| `src/agent/ui/AgentSettingsPanel.tsx` | Base URL / 模型 / Key、连通性测试、token 统计、删除当前会话 |
| `src/stores/bookStorage.ts` | 抽出 `createSqliteStateStorage()`，配置库复用同一 op-sqlite Storage |
| `App.tsx` | 成功分支在 `RootStackNavigator` 同级挂载 `AgentRoot` |

**测试**：`__tests__/agent/queryRecords.test.ts`（18）、`chatModel.test.ts`（8）、`AgentDrawer.test.tsx`（6），全部通过。

**UI 选择**：设置入口采用抽屉内 `FloatingPanel`；`DATA_MODE=remote` 下悬浮球点击提示「当前为远程账本模式，助手不可用」。

### S4 验收 🟡 自动化已完成，端侧待验

- ✅ 端点探针（2026-10-27）：`/models`、非流式 tools、流式 tool_calls 均正常；`finish_reason=tool_calls`，usage 透传。
- ✅ lint / typecheck / test / iOS JS bundle：0 error，107 套件 / 1159 用例全绿。
- ⬜ 真机：原生重建后确认 Keychain 可用；跑通「上个月吃饭花了多少」并核对数字。
- ⬜ 真机：断网 / Key 错误 / 未配置三种状态的中文提示与主流程隔离。
- ⬜ 真机：重启 App 后对话恢复，模型能复用历史 tool 结果。

---

## 6. 已踩过的坑（重要）

1. **better-sqlite3 是同步驱动，不接受 async 事务回调**（`Transaction function cannot return a promise`）。生产用的 op-sqlite 是异步驱动，两者行为不同。
   - 测试里的处理：把 `db.transaction` 替换为直通函数（见 `agent-service.test.ts` 的 `createTestDatabase`），事务原子性由真实驱动保证。
   - **连带发现**：`packages/data-server`（better-sqlite3）的写操作在真实运行时会因同样原因失败。不建议在本任务里修，但要知道这是既有隐患。
2. **事务回调内抛错会变成未捕获 rejection 并杀掉进程**。所以 service 的业务校验必须放在 `db.transaction()` 之前（这也是 data 包规则的要求）。已按此实现。
3. **`packages/api/src/remote.ts` 只导出 `createRemoteApi`，没有 `localApi`**。`DATA_MODE=remote` 时 Metro 会把 `@pennyspring/api` 重定向到该文件，此时 agent 若依赖 `localApi` 会在 import 阶段失败。**已在 S3 处理**：`currentBookRef.kind === 'remote'` 时禁用助手并提示，且不渲染抽屉/设置。
4. **RN fetch 无 streaming**。探针脚本用的是 Node 原生 fetch，**不能直接搬进 RN**。**已在 S3 处理**：`streamTransport` 使用 XHR `onprogress` + 增量 `responseText`。
5. **Keychain 是新增原生依赖**，必须重建才能跑起来（见下）。
6. `packages/data-server-wrapper` 的 `KNOWN_GROUPS` 不含 `agent`，remote 模式调用 `api.agent.*` 会 404。agent 只走 local，故未加入。

---

## 7. 命令

```bash
# 数据层
yarn workspace @pennyspring/data typecheck
yarn workspace @pennyspring/data db:generate
npx jest --watchman=false packages/data/__tests__/agent-service.test.ts

# 端点探针（凭据读 .env.agent.local）
node scripts/agent-probe.mjs

# 原生重建（react-native-keychain 已加，必须执行）
yarn
cd ios && bundle install && bundle exec pod install && cd ..
yarn ios       # 或 yarn android（autolinking 自动处理）

# 收尾检查（Node 22；本机无 yarn，直接用 node_modules/.bin）
~/.nvm/versions/node/v22.13.1/bin/node node_modules/.bin/jest --watchman=false
node_modules/.bin/eslint .
node_modules/.bin/tsc --noEmit

# 不启动模拟器也能验证模块图
node_modules/.bin/react-native bundle --entry-file index.js --platform ios \
  --dev true --bundle-output /tmp/pennyspring-agent.bundle
```

---

## 8. 工作区状态（交接必读）

工作区里**混有两批未提交改动**，请勿混淆：

### 本次 agent 相关（可以一起提交）

```
 M .gitignore
 M package.json                       # + react-native-keychain
 M yarn.lock
 M App.tsx                            # 挂载 AgentRoot
 M src/stores/bookStorage.ts          # 抽出 createSqliteStateStorage
 M packages/data/src/{api-factory.ts,constants/index.ts,schema/index.ts,services/index.ts,services/types.ts}
 M packages/data/drizzle/{migrations.js,meta/_journal.json}
?? packages/data/src/schema/agent.ts
?? packages/data/src/services/agent-service.ts
?? packages/data/__tests__/agent-service.test.ts
?? packages/data/drizzle/0001_jittery_ultimates.sql
?? packages/data/drizzle/meta/0001_snapshot.json
?? scripts/agent-probe.mjs
?? .env.agent.example
?? docs/agent-p0-plan.md
?? src/agent/**
?? __tests__/agent/**
```

`.env.agent.local`（真实凭据）已被 `.gitignore` 忽略，**不要提交**。

### 与本任务无关的既有改动（不要一起提交）

```
 M packages/pennyspring-ui/src/Popup/{FloatingPanel.tsx,types.ts}
 M packages/pennyspring-ui/__tests__/FloatingPanel.test.tsx
 M src/screens/addRecord/**  src/screens/home/tabs/detail/RecordDetailPanel.tsx
 M src/screens/tagManage/TagManageScreen.tsx
 D src/constants/tagIcon.ts
?? src/component/TagChip.tsx  src/screens/addRecord/components/TagField.tsx
```

---

## 9. 交接 checklist

- [ ] 执行原生重建，确认 `react-native-keychain` 链接成功
- [x] S2 单测骨架完成，core 在 Node 里跑通 SSE 拼装与 tool loop
- [x] 端点探针重跑通过（2026-10-27，tools + 流式均正常）
- [ ] 真机验证 XHR 流式（`streamTransport` 是 RN 侧最容易翻车的一环）
- [x] UI 接入完成；`AgentRoot` 有错误边界，失败时返回 null，不影响记账主流程
- [x] 收尾按 CLAUDE.md 跑 lint / typecheck / test，全绿
- [ ] 联调结束后轮换联调用的 API Key（该 Key 曾在对话中明文出现）

## 10. 开放问题

1. 设置入口最终形态（抽屉内 FloatingPanel vs 独立设置页）——**已定**：抽屉内 FloatingPanel。
2. `DATA_MODE=remote` 构建下 agent 是禁用还是隐藏入口——**已定**：禁用并提示「当前为远程账本模式，助手不可用」。
3. 是否要在设置页展示累计 token 用量——**已定**：展示 token 数，不做金额估算。
