-- ----------------------------------------------------------------------------
-- 1. 账本表
-- ----------------------------------------------------------------------------
CREATE TABLE tb_books
(
    id           INTEGER PRIMARY KEY AUTOINCREMENT,                                                              -- 账本主键，自增长
    name         TEXT NOT NULL,                                                                                  -- 账本名称
    description  TEXT NOT NULL DEFAULT '',                                                                       -- 账本描述信息
    background   TEXT NOT NULL DEFAULT '',                                                                       -- 背景图片 URI
    type         TEXT NOT NULL DEFAULT 'local',                                                                  -- 账本类型 key：local=本地账本，remote=远程账本
    remote_url   TEXT NOT NULL DEFAULT '',                                                                       -- 远程账本地址；type 为 remote 时必填
    created_time INTEGER       DEFAULT (CAST(unixepoch('subsec') * 1000 AS INTEGER)),                            -- 记录创建时间（时间戳，毫秒），INSERT 时自动写入
    updated_time INTEGER       DEFAULT (CAST(unixepoch('subsec') * 1000 AS INTEGER)) ON UPDATE CURRENT_TIMESTAMP -- 最后修改时间（时间戳，毫秒），INSERT 和 UPDATE 时自动写入
);

-- ----------------------------------------------------------------------------
-- 2. 资产表
-- ----------------------------------------------------------------------------
CREATE TABLE tb_asset
(
    id                INTEGER PRIMARY KEY AUTOINCREMENT, -- 资产主键，自增长
    books_id          INTEGER NOT NULL,                  -- 所属账本主键，关联 tb_books.id
    name              TEXT    NOT NULL,                  -- 资产名称（如"招商银行储蓄卡"）

    balance           INTEGER NOT NULL DEFAULT 0,        -- 当前余额，单位：分；通用资产为持有金额，信用卡/信用付为待还金额（正数=欠款）
    total_amount      INTEGER NOT NULL DEFAULT 0,        -- 总额度，单位：分；仅信用卡使用
    billing_date      INTEGER NOT NULL DEFAULT '',       -- 账单日；仅信用卡使用
    repayment_date    INTEGER NOT NULL DEFAULT '',       -- 还款日；仅信用卡使用

    type              TEXT    NOT NULL,                  -- 资产大类 key：capital_account=资金账户，credit_card=信用卡，stored_value_card=储值卡，investment=投资理财，debt=债券债务
    classification    TEXT    NOT NULL,                  -- 资产分类 key：debit_card=储蓄卡，credit_card=信用卡，huabei=花呗，baitiao=白条，douyin_monthly=抖音月付，wechat_wallet=微信钱包，alipay_wallet=支付宝，douyin_wallet=抖音钱包，cash=现金，phone_card=话费卡，transport_card=公交卡，meal_card=饭卡，membership_card=会员卡，deposit=押金，stock=股票，fund=基金，borrow_in=借入，borrow_out=借出，liability=负债

    invisible         TEXT    NOT NULL DEFAULT 'visible', -- 是否隐藏 key：visible=显示，hidden=隐藏
    open_bank         TEXT    NOT NULL DEFAULT '',       -- 开户行名称
    card_no           TEXT    NOT NULL DEFAULT '',       -- 卡号
    remark            TEXT    NOT NULL DEFAULT '',       -- 备注信息
    sort              INTEGER NOT NULL DEFAULT 1,        -- 排序权重，值越小越靠前

    created_time      INTEGER          DEFAULT (CAST(unixepoch('subsec') * 1000 AS INTEGER)),
    updated_time      INTEGER          DEFAULT (CAST(unixepoch('subsec') * 1000 AS INTEGER)) ON UPDATE CURRENT_TIMESTAMP
);


-- ----------------------------------------------------------------------------
-- 3. 类型表
-- ----------------------------------------------------------------------------
CREATE TABLE tb_type
(
    id                   INTEGER PRIMARY KEY AUTOINCREMENT,                                                                 -- 类型主键，自增长
    parent_id            INTEGER NOT NULL DEFAULT 0,                                                                        -- 父类型 ID，0 表示一级类型（顶级）
    name                 TEXT    NOT NULL,                                                                                  -- 类型名称（如"餐饮"、"工资"）
    icon                 TEXT    NOT NULL,                                                                                  -- 类型图标 key，由应用层硬编码维护
    type_category        TEXT    NOT NULL,                                                                                  -- 类型分类 key：expense=支出，income=收入，transfer=转账
    is_system            TEXT    NOT NULL DEFAULT 'custom',                                                                 -- 是否系统内置 key：custom=用户自定义，system=系统内置（不可删除）
    sort                 INTEGER NOT NULL DEFAULT 1,                                                                        -- 排序权重，值越小越靠前
    created_time         INTEGER          DEFAULT (CAST(unixepoch('subsec') * 1000 AS INTEGER)),                            -- 记录创建时间（时间戳，毫秒），INSERT 时自动写入
    updated_time         INTEGER          DEFAULT (CAST(unixepoch('subsec') * 1000 AS INTEGER)) ON UPDATE CURRENT_TIMESTAMP -- 最后修改时间（时间戳，毫秒），
);

-- ----------------------------------------------------------------------------
-- 4. 记录表
-- ----------------------------------------------------------------------------
CREATE TABLE tb_record
(
    id            INTEGER PRIMARY KEY AUTOINCREMENT,                                                                 -- 记录主键，自增长
    type_id       INTEGER NOT NULL,                                                                                  -- 类型 ID，关联 tb_type.id
    asset_id      INTEGER NOT NULL,                                                                                  -- 关联资产 ID，关联 tb_asset.id（转出资产）
    into_asset_id INTEGER NOT NULL DEFAULT 0,                                                                        -- 转入资产 ID，关联 tb_asset.id；仅转账类型使用，默认 0 表示无
    books_id      INTEGER NOT NULL,                                                                                  -- 所属账本 ID，关联 tb_books.id
    amount        INTEGER NOT NULL DEFAULT 0,                                                                        -- 原始金额，单位：分
    final_amount  INTEGER NOT NULL DEFAULT 0,                                                                        -- 最终金额，单位：分（扣除优惠、加上手续费后的实际金额、+/- 关联记录的金额）
    concessions   INTEGER NOT NULL DEFAULT 0,                                                                        -- 优惠金额，单位：分
    charge        INTEGER NOT NULL DEFAULT 0,                                                                        -- 手续费，单位：分
    remark        TEXT    NOT NULL DEFAULT '',                                                                       -- 备注信息
    reimbursable  TEXT    NOT NULL DEFAULT 'not_reimbursable',                                                       -- 是否可报销 key：not_reimbursable=否，reimbursable=是
    record_time   INTEGER NOT NULL,                                                                                  -- 记账时间（时间戳，毫秒），业务字段，用户选择的记账日期

    created_time  INTEGER          DEFAULT (CAST(unixepoch('subsec') * 1000 AS INTEGER)),                            -- 记录创建时间（时间戳，毫秒），INSERT 时自动写入
    updated_time  INTEGER          DEFAULT (CAST(unixepoch('subsec') * 1000 AS INTEGER)) ON UPDATE CURRENT_TIMESTAMP -- 最后修改时间（时间戳，毫秒），
);


-- ----------------------------------------------------------------------------
-- 5. 记录关联关系表
-- 用于记录与记录之间的关联关系（如退款关联原消费记录）
-- tb_record_with_record 关联的记录类型（报销、退款）由 tb_record.type_id 决定。
-- ----------------------------------------------------------------------------
CREATE TABLE tb_record_with_record
(
    id                INTEGER PRIMARY KEY AUTOINCREMENT,                                                         -- 关系主键，自增长
    record_id         INTEGER NOT NULL,                                                                          -- 记录 ID，关联 tb_record.id
    related_record_id INTEGER NOT NULL,                                                                          -- 被关联的记录 ID，关联 tb_record.id

    created_time      INTEGER DEFAULT (CAST(unixepoch('subsec') * 1000 AS INTEGER)),                             -- 记录创建时间（时间戳，毫秒），INSERT 时自动写入
    updated_time      INTEGER DEFAULT (CAST(unixepoch('subsec') * 1000 AS INTEGER)) ON UPDATE CURRENT_TIMESTAMP, -- 最后修改时间（时间戳，毫秒）
    UNIQUE (record_id, related_record_id)
);


-- ----------------------------------------------------------------------------
-- 6. 标签表
-- ----------------------------------------------------------------------------
CREATE TABLE tb_tag
(
    id           INTEGER PRIMARY KEY AUTOINCREMENT,                                                                 -- 标签主键，自增长
    name         TEXT    NOT NULL,                                                                                  -- 标签名称
    invisible    TEXT    NOT NULL DEFAULT 'visible',                                                                -- 是否隐藏 key：visible=显示，hidden=隐藏
    icon         TEXT    NOT NULL DEFAULT '',                                                                       -- 标签图标 key，由应用层硬编码维护；空字符串表示未设置

    created_time INTEGER          DEFAULT (CAST(unixepoch('subsec') * 1000 AS INTEGER)),                            -- 记录创建时间（时间戳，毫秒），INSERT 时自动写入
    updated_time INTEGER          DEFAULT (CAST(unixepoch('subsec') * 1000 AS INTEGER)) ON UPDATE CURRENT_TIMESTAMP -- 最后修改时间（时间戳，毫秒），
);

-- ----------------------------------------------------------------------------
-- 7. 标签关联关系表
-- 用于记录与标签的多对多关联关系
-- ----------------------------------------------------------------------------
CREATE TABLE tb_tag_with_record
(
    id           INTEGER PRIMARY KEY AUTOINCREMENT,                                                         -- 关系主键，自增长
    record_id    INTEGER NOT NULL,                                                                          -- 记录 ID，关联 tb_record.id
    tag_id       INTEGER NOT NULL,                                                                          -- 标签 ID，关联 tb_tag.id

    created_time INTEGER DEFAULT (CAST(unixepoch('subsec') * 1000 AS INTEGER)),                             -- 记录创建时间（时间戳，毫秒），INSERT 时自动写入
    updated_time INTEGER DEFAULT (CAST(unixepoch('subsec') * 1000 AS INTEGER)) ON UPDATE CURRENT_TIMESTAMP, -- 最后修改时间（时间戳，毫秒），
    UNIQUE (record_id, tag_id)
);


-- ----------------------------------------------------------------------------
-- 8. 图片关联关系表
-- 用于记录关联的图片附件（如小票照片）
-- ----------------------------------------------------------------------------
CREATE TABLE tb_image_with_related
(
    id           INTEGER PRIMARY KEY AUTOINCREMENT,                                                         -- 图片主键，自增长
    record_id    INTEGER NOT NULL,                                                                          -- 关联记录 ID，关联 tb_record.id
    image_path   TEXT    NOT NULL,                                                                          -- 图片文件路径

    created_time INTEGER DEFAULT (CAST(unixepoch('subsec') * 1000 AS INTEGER)),                             -- 记录创建时间（时间戳，毫秒），INSERT 时自动写入
    updated_time INTEGER DEFAULT (CAST(unixepoch('subsec') * 1000 AS INTEGER)) ON UPDATE CURRENT_TIMESTAMP, -- 最后修改时间（时间戳，毫秒），
    UNIQUE (record_id, image_path)
);


-- ============================================================================
-- ER 关系概览
-- ============================================================================
-- tb_books  1 ──── N  tb_asset                 (asset.books_id → books.id)
-- tb_books  1 ──── N  tb_record                (record.books_id → books.id)
-- tb_type   1 ──── N  tb_record                (record.type_id → type.id)
-- tb_asset  1 ──── N  tb_record                (record.asset_id → asset.id)
-- tb_asset  1 ──── N  tb_record                (record.into_asset_id → asset.id, 转账)
-- tb_record 1 ──── N  tb_record_with_record    (related.record_id → record.id)
-- tb_record 1 ──── N  tb_tag_with_record       (tag_rel.record_id → record.id)
-- tb_tag    1 ──── N  tb_tag_with_record       (tag_rel.tag_id → tag.id)
-- tb_record 1 ──── N  tb_image_with_related    (image.record_id → record.id)

-- ============================================================================
-- 金额约定
-- 所有金额字段（amount、final_amount、concessions、charge、balance、total_amount）
-- 统一使用 INTEGER 类型，单位为分（1 元 = 100 分）
-- ============================================================================
