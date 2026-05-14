# 记账业务分析

数据表：packages/data/src/schema

本文档描述支出、收入、转账记录的新增、修改、删除规则。所有写入记录和资产余额的操作必须在同一个数据库事务内完成。

## 全局规范

### 基础约定

- 金额字段统一使用分为单位，UI 层输入金额必须在进入数据层前转换为整数。
- 记录新增时必须选择记录分类，对应 `tb_record.type_id`，并校验 `tb_type.type_category` 与当前业务类型一致。
- 记录新增时必须选择关联资产，对应 `tb_record.asset_id`；收入和支出不使用 `into_asset_id`，按业务语义写入 `0`。
- 转账记录必须同时选择转出资产 `asset_id` 和转入资产 `into_asset_id`，且两者不能相同。
- 修改记录时允许修改分类、资产、金额、手续费、备注、标签、图片、记账时间和报销状态，包括跨大类修改（如支出改为收入、收入改为转账等）。
- 每次写入前必须重新读取当前记录、类型、资产和关联关系，不依赖 UI 传回的旧值计算差额。
- 修改记录时必须先按旧记录的类型和规则完整回滚（资产余额、关联支出吸收等），再按新记录的类型和规则重新应用，等价于"删除旧记录 + 新增新记录"的原子操作。
- 删除记录时必须先回滚该记录造成的资产余额影响，再删除关联表数据，最后删除 `tb_record`。
- `tb_record.amount` 是流水原始金额，保存后不因退款、报销吸收而改写。
- `tb_record.final_amount` 是统计用最终金额；支出表示剩余实际承担金额，收入表示实际计入收入统计的金额，转账只把手续费扣优惠后的净成本计入支出统计。
- 标签、图片、记录关联关系分别写入 `tb_tag_with_record`、`tb_image_with_related`、`tb_record_with_record`；更新时按集合差异新增和删除。

### 金额公式

| 类型 | `amount` | `final_amount` | 资产影响金额 |
| --- | --- | --- | --- |
| 支出 | 原始支出金额 | 普通支出为 `amount + charge`；被退款/报销吸收后为 `max(0, amount + charge - 累计吸收金额)` | `amount + charge` |
| 收入 | 原始收入金额 | 普通收入为 `amount - charge`；退款/报销为 `max(0, amount - charge - 实际吸收金额)` | `amount - charge` |
| 转账 | 转账本金 | `charge` | 转出资产：`amount + charge`；转入资产：`amount` |

### 特殊行为分类

特殊业务逻辑属于分类定义，不属于单条记录。`tb_record` 仍只通过 `type_id` 引用分类；业务处理时读取 `tb_type.type_category` 和
`tb_type.special_behavior` 决定处理分支。

`tb_type` 需要新增 `special_behavior` 列：

```text
special_behavior TEXT NOT NULL DEFAULT ''
```

应用层常量新增 `RECORD_TYPE_SPECIAL_BEHAVIOR` 枚举：

| 枚举值 | 标签 | 业务含义 |
| --- | --- | --- |
| `refund_absorption` | 退款吸收 | 退款收入必须关联普通支出，并按吸收规则抵扣支出统计 |
| `reimbursement_absorption` | 报销吸收 | 报销收入必须关联可报销支出，并按吸收规则抵扣支出统计 |
| `credit_card_payment` | 还信用卡 | 转入资产必须是信用卡/信用付资产，并减少信用卡/信用付待还 |
| `debt_borrow` | 债务借入 | 资金账户增加，借入债务余额增加 |
| `debt_lend` | 债权借出 | 资金账户减少，借出债权余额增加 |
| `debt_repayment` | 债务还款 | 资金账户减少，借入债务余额减少 |
| `debt_proceeds` | 债权收款 | 资金账户增加，借出债权余额减少 |

分类枚举映射：

| 记录大类 | 分类 | `type_category` | `special_behavior` |
| --- | --- | --- | --- |
| 支出 | 所有普通支出分类 | `expense` |  |
| 收入 | 所有普通收入分类 | `income` |  |
| 收入 | 退款 | `income` | `refund_absorption` |
| 收入 | 报销 | `income` | `reimbursement_absorption` |
| 转账 | 账户互转 | `transfer` |  |
| 转账 | 取款 | `transfer` |  |
| 转账 | 存款 | `transfer` |  |
| 转账 | 还信用卡 | `transfer` | `credit_card_payment` |
| 转账 | 借入 | `transfer` | `debt_borrow` |
| 转账 | 借出 | `transfer` | `debt_lend` |
| 转账 | 还款 | `transfer` | `debt_repayment` |
| 转账 | 收款 | `transfer` | `debt_proceeds` |

业务实现不得依赖分类名称、图标 key 或展示枚举判断特殊逻辑，只能依赖 `special_behavior`。

### 资产余额方向

资产余额字段 `tb_asset.balance` 的含义取决于资产大类：

- 资金类资产（资金账户、储值卡、投资理财、借出债权）：余额为实际持有/应收金额，增加表示资产变多，减少表示资产变少。
- 负债类资产（信用卡/信用付、借入债务）：余额为待还/欠款金额，增加表示欠款变多，减少表示欠款变少。

| 业务动作 | 资金类资产 | 负债类资产 |
| --- | --- | --- |
| 支出 | `balance -= amount + charge` | `balance += amount + charge` |
| 收入 | `balance += amount - charge` | `balance -= amount - charge` |
| 转出 | `balance -= amount + charge` | `balance += amount + charge` |
| 转入 | `balance += amount` | `balance -= amount` |

> 退款、报销属于收入记录，但资产到账金额按 `amount - charge` 处理；关联支出的吸收只影响统计金额 `final_amount`，不额外改变资产余额。

### 账本汇总金额

账本资产汇总以 `tb_asset.books_id` 为维度计算，只汇总当前账本下的资产余额。`tb_record.books_id` 用于记录归属校验，不直接参与资产余额汇总。

| 指标 | 计算规则 |
| --- | --- |
| 可用资金 | 资金账户余额 + 储值卡余额 + 投资理财余额 |
| 应还债务 | 借入债务余额 + 信用卡/信用付待还余额 |
| 应收债权 | 借出债权余额 |
| 净资产 | 可用资金 + 应收债权 - 应还债务 |

资产分类口径：

- 资金账户：`tb_asset.type = capital_account`。
- 储值卡：`tb_asset.type = stored_value_card`。
- 投资理财：`tb_asset.type = investment`。
- 信用卡/信用付待还：`tb_asset.type = credit_card`，其 `balance` 为待还金额，正数表示欠款。
- 借入债务：`tb_asset.type = debt` 且 `tb_asset.classification = BORROW`，其 `balance` 为应还债务金额。
- 借出债权：`tb_asset.type = debt` 且 `tb_asset.classification = LEND`，其 `balance` 为应收债权金额。

示例：

| 资产 | 余额 | 汇总归属 |
| --- | ---: | --- |
| 银行卡 | 1000 | 可用资金 +1000 |
| 储值卡 | 200 | 可用资金 +200 |
| 信用卡 | 300 | 应还债务 +300 |
| 借入债务 | 500 | 应还债务 +500 |
| 借出债权 | 400 | 应收债权 +400 |

则：

```text
可用资金 = 1000 + 200 = 1200
应还债务 = 300 + 500 = 800
应收债权 = 400
净资产 = 1200 + 400 - 800 = 800
```

## 支出

### 新增

1. 校验 `type_id` 属于支出分类。
2. 校验 `asset_id` 属于当前账本，且资产可用于记账。
3. 计算 `final_amount = amount + charge`。
4. 插入 `tb_record`：
   - `type_id` 写入支出分类。
   - `asset_id` 写入付款资产。
   - `into_asset_id` 写入 `0`。
   - `reimbursable` 可按用户选择写入。
5. 按资产余额方向扣减付款资产。
6. 写入标签、图片等关联表。

### 修改

1. 读取旧记录、旧分类、旧资产和旧关联数据。
2. 校验新 `type_id` 属于支出分类。
3. 按旧记录的资产影响金额回滚资产余额，不使用可能已被吸收为 `0` 的旧 `final_amount`。
4. 根据新字段重新计算 `final_amount = amount + charge`。
5. 更新 `tb_record` 主表字段。
6. 按新记录重新应用资产余额影响。
7. 按集合差异同步标签和图片。

如果支出记录已被退款/报销记录关联，修改金额、优惠、手续费、分类或报销状态时，必须同步重算相关退款/报销记录和被吸收支出的 `final_amount`。

### 删除

1. 读取旧记录、旧资产和所有关联关系。
2. 如果该支出已被退款/报销关联，先恢复或重算相关退款/报销记录，确保不再吸收被删除支出。
3. 按旧记录的资产影响金额回滚资产余额，不使用可能已被吸收为 `0` 的旧 `final_amount`。
4. 删除 `tb_tag_with_record`、`tb_image_with_related` 中该记录的关联数据。
5. 删除 `tb_record_with_record` 中 `record_id = 当前记录` 或 `related_record_id = 当前记录` 的关联数据。
6. 删除 `tb_record`。

## 收入

### 退款/报销吸收

- 退款和报销是收入分类中的固定特殊分类。
- 报销必须关联可报销支出；退款必须关联 `reimbursable = not_reimbursable` 的支出。
- 一笔支出允许被多笔退款/报销关联。
- 关联关系写入 `tb_record_with_record`：`record_id` 为退款/报销收入记录，`related_record_id` 为被关联支出记录。
- 每次新增退款/报销时，实时计算被关联支出的"累计已吸收金额"（= 该支出所有已关联退款/报销的实际吸收金额之和）。
- 本次实际吸收金额 = `min(本次到账金额, 支出原始影响金额 - 累计已吸收金额)`。
- 被关联支出的 `final_amount` 表示剩余实际承担金额：`max(0, 支出原始影响金额 - 累计吸收金额)`。
- 退款/报销记录的 `final_amount` 表示超出抵扣支出后仍要计入收入统计的金额：`max(0, amount - charge - 实际吸收金额)`。
- `amount` 始终保留原始流水金额。全额退款/报销时，支出 `amount` 仍是原支出金额，退款/报销 `amount` 仍是实际到账金额。
- 修改或删除退款/报销记录时，必须重算该支出所有关联退款/报销的吸收分配，并更新各记录的 `final_amount`。

示例：

| 场景 | 支出 `amount` | 支出 `final_amount` | 退款 `amount` | 退款 `final_amount` |
| --- | ---: | ---: | ---: | ---: |
| 支出 100，退款 100 | 100 | 0 | 100 | 0 |
| 支出 100，退款 30 | 100 | 70 | 30 | 0 |
| 支出 100，退款 120 | 100 | 0 | 120 | 20 |
| 支出 100，退款 60 后再退款 50 | 100 | 0 | 第一笔 60→吸收 60，final 0；第二笔 50→吸收 40，final 10 | — |

### 新增

1. 校验 `type_id` 属于收入分类。
2. 校验 `asset_id` 属于当前账本，且资产可用于记账。
3. 普通收入计算 `final_amount = amount - charge`，并强制 `reimbursable = not_reimbursable`。
4. 如果是退款或报销：
   - 校验关联支出记录存在且属于同一账本。
   - 报销只能关联 `reimbursable` 支出。
   - 退款只能关联 `reimbursable = not_reimbursable` 的支出。
   - 写入 `tb_record_with_record`。
   - 按吸收规则更新收入记录和被关联支出的 `final_amount`。
5. 插入 `tb_record`：
   - `type_id` 写入收入分类。
   - `asset_id` 写入收款资产。
   - `into_asset_id` 写入 `0`。
6. 按资产余额方向增加收款资产。
7. 写入标签、图片等关联表。

### 修改

1. 读取旧记录、旧分类、旧资产、旧关联支出和附件关系。
2. 校验新 `type_id` 属于收入分类。
3. 按旧记录的资产到账金额回滚资产余额。
4. 如果旧记录是退款/报销，先恢复旧关联支出的 `final_amount`。
5. 按新字段重新计算普通收入或退款/报销收入的 `final_amount`。
6. 更新 `tb_record` 主表字段。
7. 如果新记录是退款/报销，写入新的 `tb_record_with_record` 并吸收新关联支出。
8. 按新记录重新应用资产余额影响。
9. 按集合差异同步标签和图片。

### 删除

1. 读取旧记录、旧资产和所有关联关系。
2. 如果旧记录是退款/报销，恢复被关联支出的 `final_amount`，并删除对应 `tb_record_with_record`。
3. 按旧记录的资产到账金额回滚资产余额。
4. 删除 `tb_tag_with_record`、`tb_image_with_related` 中该记录的关联数据。
5. 删除 `tb_record_with_record` 中 `record_id = 当前记录` 或 `related_record_id = 当前记录` 的关联数据。
6. 删除 `tb_record`。

## 转账

### 普通转账

普通转账使用统一的转出、转入资产规则：

- `asset_id` 写入转出资产。
- `into_asset_id` 写入转入资产。
- 转出影响金额为 `amount + charge`。
- 转入影响金额为 `amount`。
- `final_amount = charge`。

### 特殊转账分类

- 还信用卡：`special_behavior = credit_card_payment`，转出资产为还款来源，转入资产必须是信用卡/信用付资产。
- 取款：`special_behavior = none`，转出资产通常为银行卡或钱包，转入资产通常为现金。
- 存款：`special_behavior = none`，转出资产通常为现金，转入资产通常为银行卡或钱包。
- 借入：`special_behavior = debt_borrow`，`asset_id` = 借入债务账户（转出，负债类），`into_asset_id` = 资金账户（转入）。通用公式下借入债务余额增加、资金账户余额增加。
- 借出：`special_behavior = debt_lend`，`asset_id` = 资金账户（转出），`into_asset_id` = 借出债权账户（转入）。通用公式下资金账户余额减少、借出债权余额增加。
- 还款：`special_behavior = debt_repayment`，`asset_id` = 资金账户（转出），`into_asset_id` = 借入债务账户（转入，负债类）。通用公式下资金账户余额减少、借入债务余额减少。
- 收款：`special_behavior = debt_proceeds`，`asset_id` = 借出债权账户（转出），`into_asset_id` = 资金账户（转入）。通用公式下借出债权余额减少、资金账户余额增加。

### 新增

1. 校验 `type_id` 属于转账分类。
2. 校验 `asset_id` 和 `into_asset_id` 都属于当前账本。
3. 校验转出资产和转入资产不同。
4. 计算转出影响金额、转入影响金额和 `final_amount`。
5. 插入 `tb_record`：
   - `asset_id` 写入转出资产。
   - `into_asset_id` 写入转入资产。
   - `reimbursable` 写入 `not_reimbursable`。
6. 按资产余额方向更新转出资产和转入资产。
7. 写入标签、图片等关联表。

### 修改

1. 读取旧记录、旧分类、旧转出资产、旧转入资产和旧关联数据。
2. 校验新 `type_id` 属于转账分类。
3. 回滚旧转账对转出资产和转入资产的影响。
4. 根据新字段重新计算转出影响金额、转入影响金额和 `final_amount`。
5. 更新 `tb_record` 主表字段。
6. 按新记录重新应用两端资产余额影响。
7. 按集合差异同步标签和图片。

### 删除

1. 读取旧记录、旧转出资产、旧转入资产和所有关联关系。
2. 回滚旧转账对转出资产和转入资产的影响。
3. 删除 `tb_tag_with_record`、`tb_image_with_related` 中该记录的关联数据。
4. 删除 `tb_record_with_record` 中 `record_id = 当前记录` 或 `related_record_id = 当前记录` 的关联数据。
5. 删除 `tb_record`。

## 事务

- 任一步骤失败必须回滚整个事务，不能留下记录已写入但资产余额未更新的中间状态。
- 唯一约束冲突如重复标签、重复图片、重复记录关联，应在同步关联表时去重后再写入。
- 金额计算结果小于 `0` 时应在业务层显式校验并拒绝保存，除非后续明确支持负数统计语义。
