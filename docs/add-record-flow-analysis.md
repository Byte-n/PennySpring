# 新增记录界面流程分析报告

生成日期：2026-05-24

## 结论

新增记录界面整改前不完善，现状更接近“录入草稿壳”：已经有支出、收入、转账三类 Tab、金额输入弹层、分类网格和备注输入，但还没有形成可落库的新增流程。

按 `docs/accounting-business.md` 的新增规则，新增记录必须至少完成：当前账本、金额、分类、资产、手续费、记账时间、报销状态、退款/报销关联、标签、图片、提交校验、调用 `api.record.create`、提交后反馈与返回。整改前界面缺少其中多数关键步骤，尤其是资产选择、保存动作和特殊收入/转账流程。

更新：`feature/worktrees-add-record-flow` 已补全报告中列出的新增记录主流程，包括支出/收入/转账保存、资产选择、手续费、记账时间、标签、图片、退款/报销关联支出、特殊转账资产候选限制，以及数据层必填校验兜底。

## 分析范围

- 业务依据：`docs/accounting-business.md`
- 界面入口：`src/screens/addRecord/AddRecordScreen.tsx`
- 三类页面：
  - `src/screens/addRecord/tabs/ExpenseTabScreen.tsx`
  - `src/screens/addRecord/tabs/IncomeTabScreen.tsx`
  - `src/screens/addRecord/tabs/TransferTabScreen.tsx`
- 公共录入组件：
  - `src/screens/addRecord/AddRecordContext.tsx`
  - `src/screens/addRecord/components/AmountDisplay.tsx`
  - `src/screens/addRecord/components/FieldChips.tsx`
  - `src/screens/addRecord/components/RemarkInput.tsx`
- 数据提交入口：`packages/data/src/services/record-service.ts`、`packages/data/src/services/types.ts`

## 业务要求摘要

`docs/accounting-business.md` 对新增记录的关键约束如下：

| 业务项 | 要求 |
| --- | --- |
| 通用 | 金额 UI 输入必须转为分；新增必须选择分类；新增必须选择资产；标签、图片、记录关联写入关联表；写入记录和资产余额必须在同一事务内完成 |
| 支出 | 校验支出分类和付款资产；`final_amount = amount + charge`；`into_asset_id = 0`；可选择报销状态；扣减付款资产；写入标签、图片 |
| 收入 | 校验收入分类和收款资产；普通收入 `final_amount = amount - charge` 且不可报销；退款/报销必须关联支出并按吸收规则写入 `tb_record_with_record` |
| 转账 | 必须选择转出资产和转入资产，且不能相同；`final_amount = charge`；特殊转账按 `special_behavior` 限制资产方向 |

数据层已经提供事务型入口 `createRecord(db, input)`，并会按分类分派到支出、收入、转账服务。因此 UI 不应自行计算资产余额，只需要收集完整输入、做前置校验并调用 `api.record.create`。

## 整改前界面现状

### 已具备

- `AddRecordScreen` 提供支出、收入、转账三类 Tab。
- `AmountDisplay` 已通过 `CalculatorInput.Popup` 将金额结果转换为分。
- 三类页面均加载对应分类并用 `CategoryGrid` 选择 `typeId`。
- `AddRecordContext` 保存了 `amount`、`remark`、`recordTime`、`tags`、`images`。
- 支出页面有本地 `reimbursable` 状态。

### 未形成闭环

| 缺口 | 现状 | 影响 |
| --- | --- | --- |
| 没有保存入口 | 页面没有保存按钮、底部提交栏或 header action | 用户无法新增任何记录 |
| 没有调用数据层 | 全仓未发现新增记录页面调用 `api.record.create` | 即使填了金额/分类也不会写入数据库 |
| 没有当前账本接入 | 页面未读取 `useBookStore.currentBook` | 无法提供 `booksId`，数据层会拒绝或写入不完整 |
| 资产选择未实现 | 支出/收入/转账的资产 Chip `onPress` 均为空函数 | 无法满足新增必须选择资产的规则 |
| 转入资产未实现 | 转账页面有 `intoAssetId` 状态，但 setter 未使用 | 转账记录必填项缺失 |
| 手续费输入不完整 | 只有转账有 `charge` 状态，且点击为空；支出/收入没有手续费入口 | `amount + charge` / `amount - charge` 规则无法完整录入 |
| 记账时间不可修改 | 时间 Chip 仅展示 `recordTime` | 用户无法选择业务记账时间 |
| 标签不可选择 | 标签 Chip 没有 `onPress` | `tagIds` 状态无法被用户修改 |
| 图片不可添加 | 图片 Chip 只弹出“等待开发” | `imagePaths` 状态无法被用户修改 |
| 退款/报销关联缺失 | 收入页没有根据 `special_behavior` 触发关联支出选择 | 无法满足退款/报销必须关联支出的规则 |
| 特殊转账缺少引导 | 转账页没有按 `special_behavior` 限制资产候选 | 借入、借出、还款、还信用卡等容易选错资产 |
| 缺少前置校验和错误反馈 | 分类加载 `loading` 未使用，必填项也无错误状态 | 用户会在提交时才收到低层错误，体验不可控 |

## 需要补全的完整流程

### 1. 通用新增流程

1. 进入页面时读取当前账本：
   - 从 `useBookStore` 获取 `currentBook`。
   - 没有当前账本时阻断保存，并提示先创建或选择账本。
2. 加载当前账本资产、全部标签、当前 Tab 分类：
   - 资产使用 `api.asset.getByBook(currentBook.id)`。
   - 标签使用 `api.tag.getAll()`。
   - 分类沿用 `api.type.getByCategory(typeCategory)`。
3. 维护完整草稿状态：
   - 通用：`amount`、`charge`、`typeId`、`booksId`、`recordTime`、`remark`、`tagIds`、`imagePaths`。
   - 支出/收入：`assetId`、`reimbursable`。
   - 收入特殊分类：`relatedRecordIds`。
   - 转账：`assetId`、`intoAssetId`。
4. 提交前做 UI 前置校验：
   - 金额建议要求大于 `0`。
   - 必须选择分类。
   - 支出/收入必须选择资产。
   - 转账必须选择转出资产和转入资产，且不能相同。
   - 收入 `amount - charge` 不能小于 `0`。
   - 退款/报销分类必须选择至少一条可关联支出。
5. 点击保存：
   - 禁用保存按钮，避免重复提交。
   - 调用 `api.record.create(input)`。
   - 成功后刷新上游列表或返回上一页，并给出成功反馈。
   - 失败时保留草稿并展示错误。

### 2. 支出新增流程

应补全为：

1. 输入金额。
2. 选择支出分类。
3. 选择付款资产。
4. 可选输入手续费。
5. 可选切换“可报销”。
6. 可选选择记账时间、标签、图片、备注。
7. 保存时组装：

```ts
{
  typeId,
  booksId: currentBook.id,
  amount,
  charge,
  assetId,
  reimbursable,
  recordTime,
  remark,
  tagIds,
  imagePaths,
}
```

### 3. 收入新增流程

普通收入应补全为：

1. 输入金额。
2. 选择收入分类。
3. 选择收款资产。
4. 可选输入手续费。
5. 可选选择记账时间、标签、图片、备注。
6. 保存时强制 `reimbursable = REIMBURSABLE.notReimbursable`。

退款/报销收入应在选择对应分类后追加流程：

1. 根据分类的 `specialBehavior` 判断是否为 `refund_absorption` 或 `reimbursement_absorption`。
2. 打开“关联支出”选择器。
3. 候选支出必须属于当前账本：
   - 退款：只允许关联 `reimbursable = none` 的支出。
   - 报销：只允许关联 `reimbursable = able` 的支出。
4. 展示候选支出的原始金额、已吸收金额、剩余可吸收金额。
5. 保存时传入 `relatedRecordIds`，由数据层执行吸收重算。

### 4. 转账新增流程

应补全为：

1. 输入转账本金。
2. 选择转账分类。
3. 选择转出资产。
4. 选择转入资产。
5. 可选输入手续费。
6. 可选选择记账时间、标签、图片、备注。
7. 保存时组装：

```ts
{
  typeId,
  booksId: currentBook.id,
  amount,
  charge,
  assetId,
  intoAssetId,
  recordTime,
  remark,
  tagIds,
  imagePaths,
}
```

特殊转账需要在资产选择器中做候选限制：

| 特殊行为 | 资产选择限制 |
| --- | --- |
| `credit_card_payment` | 转入资产必须是信用卡/信用付资产 |
| `debt_borrow` | 转出资产必须是借入债务账户，转入资产应为资金账户 |
| `debt_lend` | 转出资产应为资金账户，转入资产必须是借出债权账户 |
| `debt_repayment` | 转出资产应为资金账户，转入资产必须是借入债务账户 |
| `debt_proceeds` | 转出资产必须是借出债权账户，转入资产应为资金账户 |

## 建议补全组件

| 组件/能力 | 用途 | 优先级 |
| --- | --- | --- |
| `AddRecordSubmitBar` 或 header 保存按钮 | 执行校验和 `api.record.create` | P0 |
| `AssetPicker` | 支出/收入选择资产，转账选择转出/转入资产 | P0 |
| `ChargeInput` | 三类记录输入手续费 | P0 |
| `DateTimePicker` 接入 | 修改 `recordTime` | P1 |
| `TagPicker` | 修改 `tagIds` | P1 |
| `ImagePicker` | 修改 `imagePaths` | P1 |
| `RelatedExpensePicker` | 退款/报销选择被吸收支出 | P0 |
| `useAddRecordDraft` | 聚合草稿、校验、提交、重置逻辑 | P0 |

## 数据层配套风险

虽然 UI 是本次重点，但有几个数据契约需要同步确认，否则 UI 即使补完也可能被低层宽松逻辑绕过：

1. 支出/收入服务使用 `getOptionalAssetForBooks`，并在无资产时写入 `assetId = 0`。这与业务文档“新增必须选择关联资产”不一致。建议数据层也强制资产必填。
2. 退款/报销收入当前只有在 `relatedRecordIds.length > 0` 时才执行关联校验。业务文档要求必须关联支出，建议数据层对特殊收入分类强制校验非空。
3. 普通收入文档要求强制不可报销，但数据层保存的是输入的 `reimbursable`。建议数据层对收入统一落 `REIMBURSABLE.notReimbursable`，或至少拒绝非预期值。
4. UI 需要候选支出列表，但当前公开 API 未提供按账本、报销状态、剩余可吸收金额查询记录的能力。建议新增记录查询服务，供 `RelatedExpensePicker` 使用。

## 推荐实施顺序

1. P0：接入当前账本、资产列表、保存按钮、通用校验和 `api.record.create`，先打通普通支出/普通收入/普通转账落库。
2. P0：补全转账转出/转入资产选择、手续费输入和同资产校验。
3. P0：补全退款/报销关联支出选择，并补数据层“特殊收入必须有关联支出”的兜底校验。
4. P1：补全记账时间、标签、图片选择。
5. P1：优化分类/资产/标签加载态、空态、错误反馈和提交中禁用状态。
6. P2：增加新增记录页面测试，覆盖普通支出、普通收入、转账、退款/报销、校验失败和提交失败场景。

## 最小可交付标准

新增记录界面至少满足以下条件后，才可认为流程完整：

- 支出、收入、转账三类都能从 UI 成功创建记录。
- 提交入参包含 `typeId`、`booksId`、`amount`、`assetId`、`recordTime` 等必填字段。
- 转账必填 `intoAssetId`，并阻止同资产转账。
- 普通收入固定不可报销。
- 退款/报销收入必须选择可关联支出。
- 保存失败不丢失用户输入，保存成功不允许重复提交。
- 标签、图片、关联支出写入对应关联表。
