# 截图记账草稿设计方案

> 状态：已实施（悬浮球点按截图、手绘圈选、草稿 Tab 确认）
> 范围：Android 悬浮球圈选截图 → Agent 生成草稿 → 首页草稿 Tab 确认记账
> 更新：2026-11-07
> 关联：[Agent P0 实施计划](./agent-p0-plan.md)

一句话：悬浮球负责“截得准、选得快”，Agent 负责“看懂截图”，草稿 Tab 负责“用户最终确认”。

---

## 1. 背景与目标

### 1.1 现状

- 已有 `QuickBookScreenshotModule`：读取相册最新截图，在首页触发“发现新截图”提示。
- 已有 `QuickBookShareModule`：接收系统分享图片，直接进入快捷记账。
- 已有 `startQuickBook`：准备图片、创建会话、向 Agent 发送消息，并按 `autoApproveScreenshot` 直接写入记录。
- 已有 `FloatingActionGroup`，但当前是应用内组件，不能覆盖其他 App。

### 1.2 新目标

- Android 系统级悬浮球：点按即截图，在任意 App 上用手绘路径圈出区域。
- 松手后直接在选区附近出现账本、资产、类型与提交，减少一步确认。
- 截图发送后**不打开 App 界面**，由 Headless JS 在后台生成记账草稿。
- 首页新增“草稿”Tab，用户最终检查、修改、确认后才写入业务表。
- Agent 只提供中间态，不允许直接写 `tb_record`。

### 1.3 非目标

- iOS 实现。
- 一期不做标签预设、预算、分期、退款关联等复杂字段。
- 一期不让 Agent 修改或删除已有记录。
- 一期不做多人协作与草稿跨设备同步。

---

## 2. 核心设计原则

1. **Agent 不写业务表**
   快捷记账模式下，Agent 只能调用 `listTypes`、`listAssets`、`saveRecordDrafts`，不暴露 `createRecords`、`updateRecords`、`deleteRecords`。即使截图里出现提示词注入文本，也没有直接写账本的工具可用。

2. **草稿是中间态，不是记录**
   草稿不参与余额、统计、图表、记录查询、备份与导出。只有用户点击“确定”，或在新建记录页保存后，才通过数据层事务写入 `tb_record`。

3. **先截图，后预设，不打断现场**
   悬浮球、选区、预设栏全部原生完成；用户点击发送后才启动后台任务。生成阶段不出现 MainActivity、闪屏或抽屉。

4. **最终准确性由用户确认**
   Agent 可以给出不完整草稿：金额缺失、类型不确定、资产未匹配都允许，但必须写入 `warnings`。草稿详情高亮缺失项；不完整笔不显示“确定”，用户可通过“确认”进入新建记录补全。

5. **草稿按设备保存，按账本归属**
   草稿本身是设备级中间态，不属于账本内容；每条草稿记录目标本地账本 `booksId`，逐笔确定或保存时写入对应账本。

---

## 3. 用户流程

### 3.1 生成草稿

```text
用户在任意 App 点按悬浮球
  → 直接抓取当前屏幕（无菜单）
  → 手指绘制路径圈出区域
  → 松手后按路径外接矩形裁剪
  → 选区旁出现预设栏
       账本（必选，默认当前账本）
       资产（可选）
       类型（可选）
  → 点击“提交”
  → 原生隐藏悬浮 UI，启动 Headless JS 任务
  → Agent 识别截图并调用 saveRecordDrafts
  → 草稿写入本地数据库
  → 原生显示提示：“已生成 2 笔草稿”
  → 系统通知：“截图记账草稿已生成，点击确认”
```

生成阶段没有 Activity，用户停留在原 App。

### 3.2 确认草稿

```text
用户点击通知，或下次打开 PennySpring
  → 首页“草稿”Tab
  → 查看草稿列表（截图缩略图、账本、笔数、缺失项）
  → 进入草稿详情（复用记录详情样式，多笔逐条展示）
  → 完整笔：
       点“确定” → 数据层事务直接写入该笔 → 标记已记账
       点“确认” → 打开新建记录页并预填该笔 → 用户修改保存 → 写入并回写草稿
  → 不完整笔：
       只显示“确认” → 打开新建记录页预填 → 补全后保存
  → 所有笔处理完成 → 草稿组移出待处理
```

关键规则：

- “确定”只在**该笔**满足新增记录全部必填字段时出现；不满足时只显示“确认”。
- “确认”始终可用，统一进入现有新建记录页，保留用户最后一次修改机会。
- 多笔草稿逐笔独立处理，不做整组强制批量写入。

### 3.3 草稿状态机

```text
generating ──成功──> pending ──全部笔完成──> confirmed
    │                   │
    │                   └──丢弃──> discarded
    └──失败──> failed ──重试──> generating
                  │
                  └──丢弃──> discarded
```

- `generating`：后台任务进行中。App 若在此期间打开，可显示“生成中”。
- `pending`：Agent 已产出草稿，至少还有一笔未处理。
- `failed`：未生成任何草稿，保留截图和错误原因，允许重试或丢弃。
- `confirmed`：草稿内所有笔都已写入记录。
- `discarded`：用户放弃草稿。

草稿组内每一笔还有独立状态：

```text
pending ──确定/新建记录保存──> confirmed
   │
   └──删除──> 从草稿中移除
```

- 部分笔完成时，组状态仍为 `pending`，展示 `confirmed_count / total`。
- 全部笔完成时，组状态变为 `confirmed`。
- 每一笔都必须独立幂等，避免“确定”和新建记录保存造成重复写入。

---

## 4. 交互与 UI

### 4.1 悬浮球与预设栏

- 悬浮球、手绘选区与裁剪均为原生实现；点按悬浮球直接截图，拖动只移动悬浮球，不再弹菜单。
- 截图后不预置选框：用户按住绘制任意路径，松手后取路径所有点的外接矩形。
- 外接矩形按笔宽外扩 3dp，再夹到屏幕内；任一边小于 64dp 视为无效，保留上一次选区并提示“区域太小，请重新圈选”。
- 矩形不旋转、不做套索遮罩；不提供拖角、拖动或手柄，空白处再画一笔即可替换。
- 预设栏出现在选区下方；空间不足时自动翻到选区上方，与选区保持 12dp 间距；顶部安全线位于右上角关闭按钮下方，避免贴近顶部时遮挡关闭入口。
- 预设栏压缩为**单行紧凑条**，高度约 56：
  - 左侧三段：`账本 | 资产 | 类型`，每段由小标签 + 当前值组成。
  - 右侧一个 44dp 圆形提交按钮。
  - 不展示标题、说明和取消按钮；右上角关闭按钮或返回键取消，空白处点击不再取消。
- 每段点击后向上弹出选项菜单，避免遮挡选区下方内容；靠近屏幕顶部时菜单改为向下。
- 预设顺序固定：**账本 → 资产 → 类型**。
- 账本默认当前账本；切换账本后清空已选资产、类型，并重新查询。
- 资产、类型均为单选，允许“不指定”。
- 多笔混合账单建议类型选“不指定”，由 Agent 逐笔判断；账本、资产仍按预设锁定。
- 一期不提供标签预设。
- 点击提交后立即收起所有浮层，避免截图被浮层污染。

预设栏数据通过原生只读查询本地 SQLite：

- `tb_books`：本地账本。
- `tb_asset`：按 `books_id` 过滤，`invisible != 'hidden'`。
- `tb_type`：按 `books_id` 过滤，按 `sort` 排序，按 `parent_id` 组树。

### 4.2 首页草稿 Tab

**路由与位置**

- 新增 `HOME_TAB_ROUTES.DraftTab`。
- 建议顺序：`明细 / 图表 / 草稿`，保留现有 Tab 位置，减少肌肉记忆变化。
- Tab 标题带角标：待处理草稿数量（`pending + failed`）。
- 图标建议使用 `NotePencilIcon` 或 `TrayIcon`。

**列表页**

每个草稿组对应一次截图，卡片本身承载全部操作：

```text
┌──────────────────────────────────┐
│ 日常账本 · 12:34        已记账 0/2 │
│ 餐饮 / 午餐            ¥36.50 [确定]│
│ 交通               金额待确认 [补全]│
│          随记录带上截图        [关] │
│ [丢弃]                            │
└──────────────────────────────────┘
```

- 不展示缩略图，不进入独立详情页。
- 显示目标账本名称、进度与逐笔内容。
- 缺失值原位作为补全入口；补齐后就地出现“确定记账”。
- 每笔可进入“新建记录”完整表单。
- 状态为 `failed` 时显示错误原因、“重试”、“丢弃”。
- 空态文案：“暂无草稿。用悬浮球截图后，草稿会出现在这里。”
- 默认只展示 `generating / pending / failed`；`confirmed / discarded` 不进入日常列表。

**角标**

- 使用设备级草稿计数，不依赖当前账本。
- 生成完成、确认、丢弃后刷新角标。
- 建议只计数 `pending + failed`；`generating` 不计入。

### 4.3 列表卡内逐笔确认

草稿不设独立详情页与独立根路由，所有操作都在草稿列表卡内完成。

**信息展示**

- 卡片头部展示目标账本、时间与 `已记账 / 总数` 进度。
- 一个草稿组可包含多笔：紧凑一行一笔，展示类型、金额、资产流向与备注。
- 已记账的笔保留内容但降权，并收起操作。
- 缺失字段原位呈现：
  - 金额缺失：显示“填写金额”补全入口。
  - 类型缺失：显示“选择类型”补全入口。
  - 转账缺资产：显示“转出资产 / 转入资产”补全入口。
- `warnings` 只做提示，不替代字段校验。

**必填字段**

| 字段     | 说明                    | 一期 |
| -------- | ----------------------- | ---- |
| 类型     | 必须选择具体子类型      | 是   |
| 金额     | 必填，正数              | 是   |
| 资产     | 支出/收入可选，转账必填 | 是   |
| 转入资产 | 仅转账                  | 是   |
| 日期时间 | 默认今天/当前时间       | 是   |
| 备注     | 可空                    | 是   |
| 手续费   | 转账/部分类型使用       | 是   |
| 可报销   | 仅支出                  | 是   |
| 标签     | 一期不提供              | 否   |

**逐笔操作**

- 缺失值原位补全：类型/资产使用浮层选择，金额复用计算器；只更新当前未确认笔。
- `确定记账`：该笔满足全部必填条件后出现，点击直接写入，不离开列表。
- `补全`：存在缺失时主按钮指向第一个缺失项。
- `新建记录`：进入现有新建记录页，预填该笔草稿内容；保存后写入并回写草稿。
- 某笔写入后显示“已记账”，操作区收起；草稿组显示 `1/2 已记账`。
- 全部笔完成后，草稿组变为 `confirmed`，从待处理列表移除。

**新建记录预填**

- 复用现有 AddRecord 页面，新增草稿预填模式，参数为 `draftId + itemIndex`。
- 打开时填入：类型、金额、资产、日期时间、备注、截图附件。
- 保存时调用 `confirmQuickBookDraftItem(draftId, itemIndex, input)`，在同一事务内创建记录并标记该笔已确认。
- 用户取消返回时，草稿保持不变。
- 新建记录页保存失败时，草稿保持 `pending`，可重试。

**账本**

- 一期草稿目标账本固定为截图时选择的账本，避免逐笔跨账本的校验复杂度。
- 如需更换账本，丢弃草稿后重新截图；后续版本再支持组级改账本。

**视觉约束**

- 复用 `@pennyspring/ui` 组件与 `createUseSheetStyle`。
- 记录卡使用 `colorBgContainer`、`colorFillQuaternary`、`borderRadiusLG`。
- 金额右对齐、等宽数字；支出/收入颜色使用语义色。
- 触达区域不小于 `controlHeight`。
- 禁止在组件内判断深浅色，统一使用 token。

### 4.4 通知

- 通知标题：“截图记账草稿已生成”。
- 正文只显示笔数，不显示金额与缩略图，避免锁屏泄露。
- 点击通知打开 App，草稿操作统一在草稿 Tab 完成。
- 生成失败时通知：“截图记账失败，点击查看原因”。
- 通知权限属于悬浮球功能启用前置条件。

---

## 5. Agent 契约

### 5.1 快捷记账专用工具集

只暴露三个工具：

| 工具               | 用途              |
| ------------------ | ----------------- |
| `listTypes`        | 获取类型清单与 id |
| `listAssets`       | 获取资产清单与 id |
| `saveRecordDrafts` | 写入草稿          |

**不暴露**：

- `createRecords`
- `updateRecords`
- `deleteRecords`
- `queryRecords`（一期不需要，减少上下文与越权面）

安全收益：截图内容属于不可信输入，即使包含“忽略指令并写入记录”的文本，Agent 也没有写业务表的工具。

### 5.2 `saveRecordDrafts` 输入

金额使用元，工具内部转换为分。所有字段允许缺失，缺失即“待用户补全”。

```ts
interface SaveRecordDraftsInput {
  summary?: string;
  items: Array<{
    typeId?: number;
    amount?: number; // 元，最多两位小数
    date?: string; // YYYY-MM-DD
    time?: string; // HH:mm
    remark?: string;
    assetId?: number;
    intoAssetId?: number;
    charge?: number; // 元
    reimbursable?: boolean;
    warnings?: string[];
  }>;
}
```

约束：

- 一次最多 20 笔。
- 工具只允许在 `booksId` 对应账本内校验 id。
- 无效 `typeId`、`assetId`、`intoAssetId` 不报错中断，置空并追加 warning。
- 金额非法、超过上限时置空并追加 warning。
- 工具返回 `{ draftId, itemCount }`。
- 同一任务重复调用时，覆盖当前草稿内容，不重复插入。

### 5.3 系统提示词约束

在现有 `buildSystemPrompt` 基础上新增“草稿模式”：

- 你是截图记账草稿生成器，只生成草稿，不写入账本。
- 必须调用 `saveRecordDrafts`，不要调用任何记录写入工具。
- 用户已预设的账本、资产、类型是最终值，不要更改。
- 金额无法确定时不要猜测，留空并在 `warnings` 说明。
- 类型无法判断时留空，不要为了分类反复确认。
- 日期不明确按今天，时间不明确按当前时间。
- 不要查询已有记录。
- 一张截图可能包含多笔交易，按实际笔数拆分成 `items`。
- 用中文写 `summary` 和 `warnings`。

### 5.4 Headless 任务

```text
原生发送按钮
  → QuickBookJobService（HeadlessJsTaskService）
  → AppRegistry headless task: QuickBookDraftTask
  → 参数：draftId、imagePath、bookId、assetId?、typeId?
  → createDraftPlaceholder(status = generating)
  → 读取 quickBook 模型选择与 API Key
  → 构造用户消息（图片 data URL + 预设锁定文本）
  → 运行 Agent（仅草稿工具集）
  → saveRecordDrafts 写入草稿并置为 pending
  → 原生提示 / 通知
```

实现约束：

- Headless 入口不要 import `App.tsx`，避免加载导航、主题、Reanimated 等 UI 依赖。
- 使用 `localApi` 与 `getDatabase()`，不依赖 React 或当前账本 store。
- Headless 任务超时必须大于 Agent 总超时。
- App 在前台时，`HeadlessJsTaskConfig` 需要允许前台执行，避免崩溃。
- 生成过程不持久化 Agent 对话线程；草稿表保存 `provider_id`、`model_id`、`summary`、`error_text` 即可，避免污染会话列表和备份体积。
- 任务被系统中断时，`generating` 草稿在下次启动时按超时时间标记为 `failed`。

---

## 6. 数据模型

### 6.1 存储位置决策（必须拍板）

按《数据持久化存储规范》，新增持久化数据前需要明确存储位置与作用域。

| 方案            | 位置                    | 优点                                                     | 缺点                                                                  | 建议     |
| --------------- | ----------------------- | -------------------------------------------------------- | --------------------------------------------------------------------- | -------- |
| A. 设备级草稿表 | 本地 SQLite，无账本快照 | 可跨账本聚合同一 Tab；不随账本同步；确认前不污染账本数据 | 换设备不同步；卸载丢失                                                | **推荐** |
| B. 账本级草稿表 | 账本所在服务            | 可随账本导出/同步                                        | 草稿 Tab 只能看当前账本；远程账本也要实现接口；Agent 远程模式下不可用 | 不推荐   |

推荐 A，并明确：

- 已拍板：采用方案 A（设备级本地 SQLite 表），决策已回写 `.claude/rules/common/persistence.md`。
- 不进入自动备份、手动导出、局域网传输。
- 不进入网络账本服务器 API。
- 只有本地账本可生成草稿；远程账本模式禁用悬浮球。
- 草稿确认后写入目标本地账本。

### 6.2 表草案

新增表 `tb_quick_book_draft`（仅本地库）：

```ts
// packages/data/src/schema/quick-book-draft.ts
tb_quick_book_draft
  id: text primary key          // uuid
  books_id: integer not null    // 目标本地账本
  status: text not null         // generating | pending | failed | confirmed | discarded
  source: text not null         // floating_capture | share | screenshot_nudge
  image_path: text not null     // 草稿图片文件路径
  payload: text not null        // JSON: DraftItem[]
  preset: text not null         // JSON: { assetId, typeId }
  agent_provider_id: integer not null default 0
  agent_model_id: text not null default ''
  agent_summary: text not null default ''
  error_text: text not null default ''
  confirmed_count: integer not null default 0
  record_ids: text not null default '' // JSON: number[]
  created_at: integer not null
  updated_at: integer not null
  confirmed_at: integer not null default 0
```

索引：

- `(status, updated_at)`
- `(books_id, status)`

### 6.3 DraftItem JSON

```ts
interface DraftItem {
  status: 'pending' | 'confirmed'; // 逐笔状态
  recordId: number; // 0 = 尚未写入；写入后关联 tb_record.id
  typeId: number; // 0 = 未选择
  typeName: string; // 展示兜底，不参与写入
  amountCents: number | null; // null = 金额待确认
  recordTime: number; // 毫秒时间戳
  remark: string;
  assetId: number; // 0 = 未选择
  assetName: string; // 展示兜底
  intoAssetId: number; // 0 = 未选择
  intoAssetName: string;
  chargeCents: number;
  tagIds: number[]; // 一期为空数组，预留
  reimbursable: boolean;
  warnings: string[];
}
```

说明：

- 金额以分存储，避免浮点误差。
- `typeId` 为 0 时，类型名仅作展示，确认前必须补选真实类型。
- `assetId` 为 0 时表示未关联；转账必须补全转出与转入资产。
- `status` 与 `recordId` 是逐笔直接“确定”或从新建记录页保存后的回写结果。
- 图片不进入草稿 JSON，统一存 `image_path`。

### 6.4 生命周期与清理

- `generating` 超过 5 分钟未被更新：下次启动标记为 `failed`。
- `pending / failed`：保留，直到所有笔确认或用户丢弃；部分确认时草稿图片继续保留。
- `discarded`：图片文件立即删除，行保留 7 天后清理。
- `confirmed`：全部笔写入后删除草稿图片；行保留 30 天后清理。
- 启动时清理无对应草稿行的孤儿图片。
- 草稿确认、丢弃、清理全部走事务或明确的文件清理顺序。

### 6.5 API

只挂本地 API：

```ts
localApi.quickBookDraft = {
  createPlaceholder(input): Promise<QuickBookDraftRow>;
  getById(id): Promise<QuickBookDraftRow>;
  list(filter?): Promise<QuickBookDraftRow[]>;
  countPending(): Promise<number>;
  updateItems(id, payload, preset): Promise<QuickBookDraftRow>;
  markFailed(id, errorText): Promise<void>;
  getItem(id, itemIndex): Promise<DraftItem>;
  confirmItem(
    id,
    itemIndex,
    input?: CreateRecordInput,
  ): Promise<{ item: DraftItem; recordId: number }>;
  discard(id): Promise<void>;
  cleanup(): Promise<void>;
};
```

- `confirmItem` 是唯一写入路径：直接“确定”传空 input 使用草稿字段；新建记录页保存时传入用户修改后的 input。
- 每笔独立事务；重复调用同一 `itemIndex` 必须幂等，返回已有 `recordId`，不得重复创建。

草稿 Tab 与悬浮球功能都使用 `localApi`，不通过 `useGlobalApi()`，避免远程账本模式下 404。

---

## 7. 确认写入

### 7.1 逐笔必填校验

每笔写入前校验：

- 类型存在且属于目标账本。
- 金额为正数，且不超过上限。
- 转账必须填写转出资产与转入资产，且两者不同。
- 支出/收入资产可空。
- 日期时间合法。
- 目标账本存在。

任一失败：阻止该笔写入，保留 `pending`；新建记录页定位到错误字段。

### 7.2 两条写入路径

**A. 直接“确定”**

- 仅当该笔所有必填字段完整时展示。
- 点击后调用 `confirmItem(draftId, itemIndex)`，使用草稿字段直接创建一条记录。
- 不进入新建记录页。

**B. “确认”进入新建记录**

- 始终可用。
- 打开现有 AddRecord 页面，参数为 `draftId + itemIndex + prefill`。
- 用户可修改任意字段，保存时调用 `confirmItem(draftId, itemIndex, input)`。
- 用户取消返回，草稿保持不变。

### 7.3 事务与幂等

新增数据层方法：

```ts
confirmQuickBookDraftItem(
  db,
  draftId,
  itemIndex,
  input?: CreateRecordInput,
): Promise<{ item: DraftItem; recordId: number }>
```

要求：

1. 在同一个事务内重新读取草稿，校验组状态不是 `discarded`。
2. 校验目标笔当前必须是 `pending`；若已 `confirmed`，直接返回已有 `recordId`，不得重复创建。
3. 使用现有记录创建逻辑写入一条记录（复用事务内创建 helper）。
4. 更新该笔 `status = confirmed`、`recordId`。
5. 重新计算 `confirmed_count`；全部完成时组状态置为 `confirmed`，写入 `confirmed_at`。
6. 任一步失败整笔回滚，草稿保持 `pending`。

禁止先调 `createRecords` 再单独回写草稿状态，否则状态更新失败会造成重复记账。

### 7.4 图片附件

- 草稿图片在确认前只存在于草稿目录。
- 首次确认任意一笔时复制到目标账本的媒体存储；后续笔复用同一媒体路径。
- 每笔记录默认附加该截图；后续可在新建记录页取消附件。
- 全部笔确认或丢弃后删除草稿图片。
- 文件复制成功但事务失败会产生孤儿媒体文件；按现有规范接受孤儿文件，不做联动删除。

### 7.5 完成后

- 单笔直接“确定”或从新建记录页保存后，该笔显示“已记账”，操作区收起。
- 草稿组显示 `confirmed_count / total`；未全部完成时仍留在待处理列表。
- 全部笔完成后，草稿组变为 `confirmed`，从待处理列表移除。
- 角标更新；`bumpRecordVersion()` 触发明细/图表刷新。
- Toast：“已记账：餐饮 / 午餐 ¥36.50”。
- 如果当前账本不是草稿目标账本，不切换当前账本，只写入目标账本并提示。

---

## 8. 多账本、远程与备份

### 8.1 多账本

- 一张草稿只属于一个目标账本。
- 草稿 Tab 聚合所有本地账本的草稿，每张卡片显示账本名。
- 逐笔确认写入目标账本，不受当前账本影响。
- 一期目标账本固定；如需换账本，丢弃草稿后重新截图。
- 目标账本被删除时，草稿标记 `failed`，提示“目标账本已不存在”。

### 8.2 远程账本

- Agent 在远程账本模式下不可用，悬浮球快捷记账只对本地账本开放。
- 当前处于远程账本时，仍可查看和确认已有本地草稿。
- 草稿 API 只在本地 API 提供，远程服务器不实现。

### 8.3 备份与导出

- 草稿表属于设备级中间态，不进入账本快照、自动备份、手动导出与局域网传输。
- 草稿图片不进入媒体库，不参与备份。
- 确认后的记录与图片按现有账本内容规则进入备份。

---

## 9. Android 原生分工

### 9.1 原生

- 系统悬浮球：点按截图、拖动吸边，不再弹菜单。
- 无障碍服务全屏抓帧（`AccessibilityService#takeScreenshot`）、手绘路径外接矩形选区与裁剪。
- 选区旁单行预设栏：`账本 | 资产 | 类型` + 44dp 圆形提交。
- 原生只读 SQLite 查询预设数据。
- 前台服务、通知渠道、Headless 任务启动。
- 生成结果气泡/通知、点击通知打开 App 的草稿 Tab。
- 权限校验：悬浮窗、通知、无障碍截图服务。

### 9.2 JS

- Headless 草稿任务注册与执行。
- `saveRecordDrafts` 工具、草稿提示词。
- 草稿数据服务与本地 API。
- 草稿 Tab、角标。
- 草稿详情复用 `RecordDetailContent`，多笔逐条展示。
- 逐笔“确定”直接写入、“确认”进入 AddRecord 预填并回写草稿。
- 图片转存、Toast、深链参数消费与导航。

### 9.3 权限门控

- 设置页开启悬浮球时逐项校验：
  - 悬浮窗权限
  - 无障碍截图服务（用户手动启用一次）
  - 通知权限
  - 前台服务启动成功
- 自由截图通过无障碍服务抓帧，不再按次弹出屏幕录制授权；Android 11 以下没有 `takeScreenshot`，不开放该功能。
- 权限被撤销后自动关闭悬浮球开关。
- 用户强行停止 App 后服务不会启动，需重新打开一次 App。

---

## 10. 兼容与迁移

### 10.1 数据库

- 只新增 `tb_quick_book_draft`，不修改现有表与字段。
- 使用 `db:generate` 生成迁移，按现有迁移流程执行。
- 新表只存在本地库，远程服务器无需变更。

### 10.2 现有快捷记账入口

现状：

- 截图提醒与系统分享会通过 `startQuickBook` 直接写入记录。
- `autoApproveScreenshot` 控制是否跳过确认。

本方案定义悬浮球入口为草稿模式。现有入口是否统一，作为待拍板项：

| 方案                | 行为                                                                 |
| ------------------- | -------------------------------------------------------------------- |
| A. 全部统一（推荐） | 截图提醒、系统分享、悬浮球全部生成草稿；`autoApproveScreenshot` 废弃 |
| B. 仅悬浮球         | 悬浮球生成草稿；现有入口保持直接写入                                 |

推荐 A：草稿 Tab 成为统一入口，避免两套确认逻辑；需要同步修改 `QuickBookNudge` 文案与相关测试。

> 已拍板：本轮采用方案 B。仅悬浮球入口生成草稿；截图提醒与系统分享保持现有直接写入行为，`autoApproveScreenshot` 暂不废弃。

### 10.3 Agent 会话

- 草稿生成不创建用户可见的 Agent 会话线程。
- 草稿表保存 provider/model/summary/error，用于诊断。
- 如果后续需要“查看生成过程”，再单独评估是否持久化线程。

---

## 11. 实施阶段

| 阶段 | 内容                                                                     | 预估   |
| ---- | ------------------------------------------------------------------------ | ------ |
| P0   | Headless JS 真机验证：RN 0.85 新架构、SQLite、Keychain、网络、工具写草稿 | 2~3 天 |
| P1   | 数据层：草稿表、service、API、迁移、TDD 用例                             | 2~3 天 |
| P2   | Agent：`saveRecordDrafts` 工具、草稿提示词、Headless runner              | 2~3 天 |
| P3   | 原生：悬浮球、自由截图、预设栏、Headless 任务、通知/深链                 | 5~8 天 |
| P4   | UI：草稿 Tab、角标、记录详情复用、逐笔确定/确认、AddRecord 预填与回写    | 5~7 天 |
| P5   | 集成与硬化：权限、多账本、失败重试、清理、备份排除、真机矩阵             | 3~5 天 |

总计约 3~4 周（单人）。

### P0 验证清单

- Headless 任务无 Activity 启动。
- App 前台时 Headless 任务可运行。
- op-sqlite 可读写。
- Keychain 可读取 API Key。
- AI 请求与工具调用可用。
- 工具只写草稿表，`tb_record` 行数不变。
- 任务完成后 JS 可正常暂停，进程可被前台服务保持。

---

## 12. 测试计划

### 12.1 数据层

- 草稿创建、读取、组状态与逐笔状态流转、非法状态拒绝。
- 逐笔 `confirmItem`：成功、字段不合法回滚、重复调用幂等。
- 部分确认后 `confirmed_count` 正确；全部确认后组状态变为 `confirmed`。
- 从 AddRecord 传入修改后的 input 保存，草稿回写正确。
- 目标账本删除后的确认失败。
- 草稿清理与孤儿图片清理；部分确认时图片保留。

### 12.2 Agent

- `saveRecordDrafts` 正确写入草稿，不写记录。
- 预设账本/资产/类型被锁定。
- 无效 id 被置空并产生 warning。
- 金额缺失产生 warning，不猜测。
- 多笔拆分正确。
- 工具集不包含 create/update/delete。

### 12.3 UI

- 草稿 Tab 空态、pending、failed、generating。
- 角标计数与刷新。
- 草稿详情复用记录详情样式：Hero、信息卡、多笔逐条。
- 完整笔显示“确认 + 确定”；不完整笔只显示“确认”。
- “确定”直接写入并更新 `1/2 已确认`；重复点击不重复写入。
- “确认”打开 AddRecord 预填；取消后草稿不变，保存后该笔变为已记账。
- 全部笔完成后草稿移出待处理，角标与列表刷新。
- 通知深链打开正确草稿。

### 12.4 原生

- 悬浮窗权限、通知权限、无障碍截图服务。
- 手绘路径外接矩形、最小尺寸、边界夹取与图片裁剪。
- 预设栏定位、上下翻转与菜单滚动。
- Headless 任务启动与超时。
- 通知在锁屏与后台的展示。

### 12.5 回归

- 明细、图表、余额统计不受草稿影响。
- 现有记录详情面板不受草稿复用影响。
- 现有截图提醒/分享行为按最终决策回归。
- 自动备份、手动导出、局域网传输不包含草稿。
- 远程账本模式不出现本地草稿写入。

---

## 13. 风险与待拍板

| 事项                 | 说明                                   | 建议               |
| -------------------- | -------------------------------------- | ------------------ |
| 草稿存储作用域       | 设备级 vs 账本级，必须按持久化规范拍板 | 设备级本地表       |
| 现有快捷入口是否统一 | 截图提醒/分享是否也改草稿              | 统一               |
| Headless JS 可用性   | RN 0.85 新架构需真机验证               | P0 先验证          |
| 草稿是否进备份       | 中间态、设备级                         | 不进备份           |
| 草稿保留时长         | confirmed/discarded 清理策略           | 30 / 7 天          |
| 草稿 Tab 展示范围    | 所有本地账本 vs 当前账本               | 所有本地账本       |
| 详情页是否允许改账本 | 改账本会触发逐笔重校验                 | 一期固定，后续支持 |
| 截图附加范围         | 多笔记录是否都附图                     | 默认全部附加       |
| Agent 会话是否保留   | 草稿生成过程是否进入会话列表           | 不保留             |
| 失败草稿是否计数     | 角标是否包含 failed                    | 包含，提醒用户处理 |

---

## 附录 A：代码落点

### 数据层

- `packages/data/src/schema/quick-book-draft.ts`
- `packages/data/src/services/quick-book-draft-service.ts`
- `packages/data/src/services/record-service.ts`（复用事务内创建逻辑）
- `packages/data/src/api-factory.ts`
- `packages/data/drizzle/*`（迁移产物）

### Agent

- `src/agent/tools/saveRecordDrafts.ts`
- `src/agent/headless/QuickBookDraftTask.ts`
- `src/agent/headless/runQuickBookDraft.ts`
- `src/agent/projection/context.ts`（草稿模式提示词）
- `src/agent/core/*`（复用现有 Agent 创建与工具循环）

### 业务与 UI

- `src/features/quickBookDraft/*`（草稿查询、状态、逐笔确认）
- `src/screens/home/tabs/DraftTabScreen.tsx`
- `src/screens/home/tabs/draft/DraftListCard.tsx`
- `src/screens/home/tabs/draft/DraftItemRow.tsx`
- `src/screens/addRecord/AddRecordScreen.tsx`（草稿预填模式 + `draftId/itemIndex`）
- `src/navigation/routes.ts`
- `src/navigation/HomeTabsNavigator.tsx`
- `src/component/TopTabNavigator/types.ts`（角标如需扩展）
- `src/stores/draftVersionStore.ts`（角标与刷新版本）

### Android

- `android/app/src/main/java/com/pennyspring/quickbook/draft/FloatingBallService.kt`
- `android/app/src/main/java/com/pennyspring/quickbook/draft/ScreenCaptureActivity.kt`
- `android/app/src/main/java/com/pennyspring/quickbook/draft/CropOverlayView.kt`
- `android/app/src/main/java/com/pennyspring/quickbook/draft/SelectionBoundsCalculator.kt`
- `android/app/src/main/java/com/pennyspring/quickbook/draft/PresetBarView.kt`
- `android/app/src/main/java/com/pennyspring/quickbook/draft/QuickBookJobService.kt`
- `android/app/src/main/java/com/pennyspring/quickbook/draft/QuickBookDraftModule.kt`
- `android/app/src/main/AndroidManifest.xml`

---

## 附录 B：与现有 quickBook 的关系

| 现有能力                    | 本方案处理                                           |
| --------------------------- | ---------------------------------------------------- |
| `QuickBookScreenshotModule` | 保留，作为截图提醒入口；若统一草稿模式则改为生成草稿 |
| `QuickBookShareModule`      | 保留，作为系统分享入口；若统一草稿模式则改为生成草稿 |
| `startQuickBook`            | 普通聊天入口继续保留；快捷记账改为草稿任务           |
| `autoApproveScreenshot`     | 若统一草稿模式则废弃；否则仅保留给旧入口             |
| `QuickBookNudge`            | 若统一草稿模式，文案改为“生成记账草稿”               |
| `QuickBookImageProcessor`   | 可复用于草稿图片压缩与落盘                           |
| `buildQuickBookThreadTitle` | 草稿模式不创建线程，可仅旧入口使用                   |
