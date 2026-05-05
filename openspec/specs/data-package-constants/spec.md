## Requirements

### Requirement: Data package exposes enum constants
系统 MUST 在 `packages/data/src/constants` 中提供数据包当前使用的 key 枚举常量，并从数据包公共入口导出。

#### Scenario: 资产枚举常量可导入
- **WHEN** 开发者从 `@pennyspring/data` 或 `packages/data/src/constants` 导入资产相关常量
- **THEN** 可以获得 `capital_account`、`credit_card`、`stored_value_card`、`investment`、`debt` 资产大类 key
- **AND** 可以获得 `cash`、`debit_card`、`online_wallet`、`other_capital`、`credit_card`、`credit_pay`、`oth_credit_card`、`BANK_CARD_ZG`、`BANK_CARD_ZS`、`BANK_CARD_GS`、`BANK_CARD_NY`、`BANK_CARD_JS`、`BANK_CARD_JT`、`BANK_CARD_YZ`、`BANK_CARD_HX`、`BANK_CARD_BJ`、`BANK_CARD_MS`、`BANK_CARD_GD`、`BANK_CARD_ZX`、`BANK_CARD_GF`、`BANK_CARD_PF`、`BANK_CARD_XY`、`ANT_CREDIT_PAY`、`JD_IOUS`、`DOUYIN_MONTH`、`WECHAT`、`ALIPAY`、`DOUYIN`、`PHONE_CHARGE`、`BUS_CARD`、`MEAL_CARD`、`MEMBER_CARD`、`DEPOSIT`、`OTHER_TOP_UP`、`STOCK`、`FUND`、`OTHER_INVESTMENT_FINANCIAL`、`BORROW`、`LEND` 资产分类 key

#### Scenario: 通用状态枚举常量可导入
- **WHEN** 开发者从 `@pennyspring/data` 或 `packages/data/src/constants` 导入通用状态常量
- **THEN** 可以获得 `visible`、`hidden` 可见性 key
- **AND** 可以获得 `custom`、`system` 系统内置状态 key

#### Scenario: 记录类型枚举常量可导入
- **WHEN** 开发者从 `@pennyspring/data` 或 `packages/data/src/constants` 导入记录相关常量
- **THEN** 可以获得 `expense`、`income`、`transfer` 类型分类 key
- **AND** 可以获得 `not_reimbursable`、`reimbursable` 报销状态 key

#### Scenario: 类型图标语义常量可导入
- **WHEN** 开发者从 `@pennyspring/data` 或 `packages/data/src/constants` 导入类型图标相关常量
- **THEN** 可以获得 `salary`、`bonus`、`royalty`、`refund`、`reimburse`、`investment`、`provident_fund`、`medicare`、`alimony`、`pocket_money`、`lucky_money`、`convert_payment`、`windfall`、`rent`、`tax_rebate`、`dividend`、`scholarship`、`benefit`、`account_transfer`、`credit_card_payment`、`withdrawals`、`deposit`、`borrow`、`lend`、`repayment`、`proceeds`、`stock`、`fund`、`money_management`、`gold`、`bond`、`forex`、`charge`、`dining`、`three_meals`、`breakfast`、`lunch`、`dinner`、`supper`、`takeaway`、`food_ingredient`、`fruit`、`dessert`、`snacks`、`drinks`、`at`、`ats`、`daily_necessities`、`kitchen_daily_necessities`、`communication`、`call_charge`、`net_fee`、`life`、`clean`、`haircut`、`bath`、`express`、`shopping`、`digital_product`、`daily`、`electrical_appliance`、`clothes`、`furniture`、`beauty`、`body_hair`、`souvenir`、`hat`、`coat`、`pants`、`underwear`、`bag`、`shoes`、`socks`、`accessories`、`mobile_phone`、`mobile_phone_accessories`、`member`、`camera`、`amusement`、`game`、`party`、`movie`、`sing`、`show`、`travel`、`tickets`、`excursion_fare`、`sport`、`family`、`parent`、`love`、`child`、`pet`、`parenting`、`milk_powder`、`feeder`、`supplementary_food`、`diapers`、`kids`、`toy`、`early_education`、`family_trip`、`vaccination`、`car`、`refuel`、`car_charge`、`parking`、`toll`、`auto_parts`、`repair`、`car_maintenance`、`car_wash`、`illegal`、`car_insurance`、`car_inspection`、`car_loan`、`interpersonal`、`cash_gift`、`gift`、`treat`、`traffic`、`bus`、`subway`、`train`、`plane`、`taxi`、`ship`、`bicycle`、`housing`、`house_rent`、`house_loan`、`hotel`、`medical`、`medkit`、`registration`、`diagnose`、`drug`、`hospitalization`、`hygiene`、`books_education`、`study`、`stationery`、`exam`、`books`、`training`、`water_rate`、`electricity`、`gas_charge`、`garbage_fee`、`property_costs`、`heating_fee`、`other` 类型图标 key
- **AND** 这些 key 表示 `tb_type.icon` 使用的应用层硬编码图标语义，不要求创建或导出 `tb_icon` 表

### Requirement: Enum constants provide typed enum helpers
系统 MUST 通过 `@pennyspring/share` 的 `enumOf` 返回值暴露枚举 key、`values()`、`option()`、`options()`、`label()`、`labels()`、`description()` 与 `descriptions()`，以便 schema、业务逻辑和测试共享同一组 key 值。

#### Scenario: 常量值由 enumOf 派生
- **WHEN** 开发者查看 `packages/data/src/constants` 的类型导出
- **THEN** 每组枚举常量都是 `enumOf(...)` 的返回值
- **AND** 调用方可以通过常量成员或 `values()` 复用同一组 key 值，避免手写重复字符串集合

### Requirement: Schema defaults use canonical constants
系统 MUST 在适用的 schema 默认值中使用 `packages/data/src/constants` 提供的 canonical key，避免默认值散落为裸字符串。

#### Scenario: 文档默认值复用常量
- **WHEN** 开发者查看 `tb_asset.invisible`、`tb_type.is_system`、`tb_record.reimbursable`、`tb_tag.invisible`
- **THEN** 默认值来自对应 constants 导出
- **AND** 默认值与 `docs/database-tables.sql` 中记录的 key 字符串一致
