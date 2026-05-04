## ADDED Requirements

### Requirement: Drizzle schema covers all documented tables
系统 MUST 在 `packages/data` 中提供基于 TypeScript 的 Drizzle schema，并完整覆盖 [docs/database-tables.sql](docs/database-tables.sql) 中定义的全部 10 张业务表：`tb_books`、`tb_asset`、`tb_type`、`tb_record`、`tb_record_with_record`、`tb_tag`、`tb_tag_with_record`、`tb_image_with_related`、`tb_icon`、`tb_asset_classification`。

#### Scenario: Schema 暴露全部表定义
- **WHEN** 开发者查看 `packages/data` 的 schema 导出入口
- **THEN** 可以导入全部 10 张表的 Drizzle `sqliteTable` 定义

### Requirement: Column types preserve documented domain semantics
系统 MUST 使用 Drizzle 列类型表达 SQL 文档中的业务语义，其中金额、排序、日期、时间戳、外键与枚举字段 MUST 建模为 integer number 语义，名称、备注、路径、别名与描述字段 MUST 建模为 text 语义。

#### Scenario: 金额字段保持整数分单位
- **WHEN** 开发者查看 `tb_asset.balance`、`tb_asset.total_amount`、`tb_record.amount`、`tb_record.final_amount`、`tb_record.concessions`、`tb_record.charge`
- **THEN** 这些字段均为 integer number 列，并保留“单位为分”的业务含义

#### Scenario: 文本字段保持非空字符串语义
- **WHEN** 开发者查看 `description`、`remark`、`background`、`image_path`、`alias`
- **THEN** 这些字段以 text 列定义，并在文档要求非空时设置为 `notNull`

### Requirement: Schema preserves constraints and uniqueness rules
系统 MUST 在 Drizzle schema 中保留 SQL 文档声明的主键、自增、唯一约束与必要的外键引用关系。

#### Scenario: 唯一约束被映射
- **WHEN** 开发者查看 `tb_record_with_record`、`tb_tag_with_record`、`tb_image_with_related`、`tb_icon`
- **THEN** schema 分别保留 `(record_id, related_record_id)`、`(record_id, tag_id)`、`(record_id, image_path)` 与 `key` 的唯一约束

#### Scenario: 关联列引用被映射
- **WHEN** 开发者查看 `books_id`、`classification_id`、`icon_id`、`type_id`、`asset_id`、`into_asset_id`、`tag_id`
- **THEN** 对应列包含指向目标表主键的引用关系定义

### Requirement: Schema exposes relational metadata for Drizzle queries
系统 MUST 为文档中的 ER 关系补充 Drizzle `relations(...)` 元数据，以支持类型安全的关联查询。

#### Scenario: 账本和资产存在一对多关系
- **WHEN** 开发者在 schema relations 中查看 `tb_books` 与 `tb_asset`
- **THEN** 可获得从账本到资产的一对多关系，以及从资产到账本的反向归属关系

#### Scenario: 记录表保留转入与转出双资产关系
- **WHEN** 开发者在 relations 中查看 `tb_record`
- **THEN** `asset_id` 与 `into_asset_id` 被建模为两个语义不同的资产关系，而不是单一模糊关联

### Requirement: Timestamp columns use millisecond integer semantics
系统 MUST 将 `created_time` 与 `updated_time` 建模为毫秒整数时间戳，而不是 SQLite 文本时间戳。

#### Scenario: 新增记录时自动写入毫秒时间
- **WHEN** 通过 Drizzle 插入任意包含 `created_time` / `updated_time` 的表记录
- **THEN** 若调用方未显式提供值，schema 会提供当前毫秒时间戳默认值

#### Scenario: 更新记录时刷新 updated_time
- **WHEN** 通过 Drizzle 更新任意包含 `updated_time` 的表记录
- **THEN** `updated_time` 会按当前毫秒时间戳自动刷新

### Requirement: Schema normalizes invalid SQL defaults into type-safe equivalents
系统 MUST 对 SQL 文档中无法安全直接映射到 TypeScript schema 的默认值做显式归一化，并保持字段业务语义稳定。

#### Scenario: 整数字段不会保留空字符串默认值
- **WHEN** 开发者查看 `billing_date` 或 `repayment_date` 的 Drizzle 定义
- **THEN** 这些 integer 字段不会使用空字符串作为默认值
- **AND** schema 会改用与业务语义一致的类型安全默认值或空值策略
