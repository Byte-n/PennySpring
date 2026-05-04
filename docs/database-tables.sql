-- ----------------------------------------------------------------------------
-- 1. 账本表
-- ----------------------------------------------------------------------------
CREATE TABLE tb_books
(
    id           INTEGER PRIMARY KEY AUTOINCREMENT,                                                              -- 账本主键，自增长
    name         TEXT NOT NULL,                                                                                  -- 账本名称
    description  TEXT NOT NULL DEFAULT '',                                                                       -- 账本描述信息
    background   TEXT NOT NULL DEFAULT '',                                                                       -- 背景图片 URI
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

    type              INTEGER NOT NULL,                  -- 资产大类（枚举 AssetTypeEnum）：1=银行储蓄卡，2=信用卡/信用付（含花呗、白条、月付），3=网络钱包（微信、支付宝、抖音），4=现金，5=储值卡（话费、公交卡、饭卡、会员卡、押金），6=投资理财（股票、基金），7=债权债务（借入、借出、负债）
    classification_id INTEGER NOT NULL,                  -- 资产分类 ID，关联 tb_asset_classification.id

    invisible         INTEGER NOT NULL DEFAULT 1,        -- 是否隐藏：1=显示，2=隐藏
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
    icon_id              INTEGER NOT NULL,                                                                                  -- 类型图标 ID，关联 tb_icon.id；
    type_category        INTEGER NOT NULL,                                                                                  -- 类型分类（枚举 RecordTypeCategoryEnum）：1=支出，2=收入，3=转账
    is_system            INTEGER NOT NULL DEFAULT 1,                                                                        -- 是否系统内置：1=用户自定义，2=系统内置（不可删除）
    sort                 INTEGER NOT NULL DEFAULT 1,                                                                        -- 排序权重，值越小越靠前
    relative_record_type text null default '',                                                                              -- 关联记录类型，仅‘收入类型’可选，报销 、 退款、返现等
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
    reimbursable  INTEGER NOT NULL DEFAULT 1,                                                                        -- 是否可报销：1=否，2=是
    record_time   INTEGER NOT NULL,                                                                                  -- 记账时间（时间戳，毫秒），业务字段，用户选择的记账日期

    created_time  INTEGER          DEFAULT (CAST(unixepoch('subsec') * 1000 AS INTEGER)),                            -- 记录创建时间（时间戳，毫秒），INSERT 时自动写入
    updated_time  INTEGER          DEFAULT (CAST(unixepoch('subsec') * 1000 AS INTEGER)) ON UPDATE CURRENT_TIMESTAMP -- 最后修改时间（时间戳，毫秒），
);


-- ----------------------------------------------------------------------------
-- 5. 记录关联关系表
-- 用于记录与记录之间的关联关系（如退款关联原消费记录）
-- tb_record_with_record 关联的记录类型（报销、退款）由 tb_record.type_id 决定。
-- type_id 对应 tb_type.id。tb_type.relative_record_type 决定关联记录的类型
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
    invisible    INTEGER NOT NULL DEFAULT 1,                                                                        -- 是否隐藏：1=显示，2=隐藏
    icon_id      INTEGER NOT NULL DEFAULT 0,                                                                        -- 标签图标 ID，关联 tb_icon.id；0 表示未设置

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


-- ----------------------------------------------------------------------------
-- 9. 图标库表
-- 统一图标资源管理，支持 内置 key、图片路径三种类型
-- 系统内置图标 (is_system=2) 所有账本共享；用户自定义图标 (is_system=1) 归属特定账本
-- ----------------------------------------------------------------------------
CREATE TABLE tb_icon
(
    id           INTEGER PRIMARY KEY AUTOINCREMENT, -- 图标主键，自增长
    key          TEXT    NOT NULL,                  -- 图标唯一标识（内置key 名称: key:xx / 图片 URI: md5:xx.jpg/png/...）
    type         INTEGER NOT NULL DEFAULT 1,        -- 图标类型（枚举 IconTypeEnum）：1=内置key，2=图片路径
    label        TEXT    NOT NULL DEFAULT '',       -- 图标显示名称
    value        TEXT    NOT NULL,                  -- 图标值（内置key 名称 / 图片 URI）
    alias        TEXT    NOT NULL,                  -- 别名，默认为 label，多个用英文逗号分割。用于在内存中执行搜匹配
    is_system    INTEGER NOT NULL DEFAULT 1,        -- 是否系统内置：1=用户自定义，2=系统内置（不可删除）
    sort         INTEGER NOT NULL DEFAULT 1,        -- 排序权重，值越小越靠前

    created_time INTEGER          DEFAULT (CAST(unixepoch('subsec') * 1000 AS INTEGER)),
    updated_time INTEGER          DEFAULT (CAST(unixepoch('subsec') * 1000 AS INTEGER)) ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE (key)
);

-- ----------------------------------------------------------------------------
-- 10. 资产分类定义表
-- 定义资产分类的元数据（名称、图标等），替代原 tb_asset.classification 硬编码枚举
-- 系统内置分类 (is_system=2) 所有账本共享；用户自定义分类 (is_system=1) 归属特定账本
-- ----------------------------------------------------------------------------
CREATE TABLE tb_asset_classification
(
    id           INTEGER PRIMARY KEY AUTOINCREMENT, -- 分类主键，自增长
    label        TEXT    NOT NULL,                  -- 分类显示名称（如"储蓄卡"、"信用卡"）
    icon_id      INTEGER NOT NULL,                  -- 分类图标 ID，关联 tb_icon.id
    asset_type   INTEGER NOT NULL,                  -- 所属资产大类（枚举 AssetTypeEnum）
    is_system    INTEGER NOT NULL DEFAULT 1,        -- 是否系统内置：1=用户自定义，2=系统内置（不可删除）
    sort         INTEGER NOT NULL DEFAULT 1,        -- 排序权重，值越小越靠前

    created_time INTEGER          DEFAULT (CAST(unixepoch('subsec') * 1000 AS INTEGER)),
    updated_time INTEGER          DEFAULT (CAST(unixepoch('subsec') * 1000 AS INTEGER)) ON UPDATE CURRENT_TIMESTAMP
);

-- ============================================================================
-- ER 关系概览
-- ============================================================================
-- tb_books  1 ──── N  tb_asset                 (asset.books_id → books.id)
-- tb_books  1 ──── N  tb_record                (record.books_id → books.id)
-- tb_icon   1 ──── N  tb_asset_classification  (classification.icon_id → icon.id)
-- tb_icon   1 ──── N  tb_type                  (type.icon_id → icon.id)
-- tb_icon   1 ──── N  tb_tag                   (tag.icon_id → icon.id)
-- tb_asset_classification 1 ──── N tb_asset    (asset.classification_id → classification.id)
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
