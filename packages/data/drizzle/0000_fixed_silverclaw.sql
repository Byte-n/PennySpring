CREATE TABLE `tb_asset` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`books_id` integer NOT NULL,
	`name` text NOT NULL,
	`balance` integer DEFAULT 0 NOT NULL,
	`total_amount` integer DEFAULT 0 NOT NULL,
	`billing_date` integer DEFAULT 0 NOT NULL,
	`repayment_date` integer DEFAULT 0 NOT NULL,
	`type` text NOT NULL,
	`classification` text NOT NULL,
	`invisible` text DEFAULT 'visible' NOT NULL,
	`open_bank` text DEFAULT '' NOT NULL,
	`card_no` text DEFAULT '' NOT NULL,
	`remark` text DEFAULT '' NOT NULL,
	`sort` integer DEFAULT 1 NOT NULL,
	`created_time` integer DEFAULT (cast(unixepoch('subsec') * 1000 as integer)) NOT NULL,
	`updated_time` integer DEFAULT (cast(unixepoch('subsec') * 1000 as integer)) NOT NULL
);


CREATE TABLE `tb_books` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`description` text DEFAULT '' NOT NULL,
	`background` text DEFAULT '' NOT NULL,
	`created_time` integer DEFAULT (cast(unixepoch('subsec') * 1000 as integer)) NOT NULL,
	`updated_time` integer DEFAULT (cast(unixepoch('subsec') * 1000 as integer)) NOT NULL
);


CREATE TABLE `tb_image_with_related` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`record_id` integer NOT NULL,
	`image_path` text NOT NULL,
	`created_time` integer DEFAULT (cast(unixepoch('subsec') * 1000 as integer)) NOT NULL,
	`updated_time` integer DEFAULT (cast(unixepoch('subsec') * 1000 as integer)) NOT NULL
);


CREATE UNIQUE INDEX `tb_image_with_related_record_id_image_path_unique` ON `tb_image_with_related` (`record_id`,`image_path`);


CREATE TABLE `tb_record_with_record` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`record_id` integer NOT NULL,
	`related_record_id` integer NOT NULL,
	`created_time` integer DEFAULT (cast(unixepoch('subsec') * 1000 as integer)) NOT NULL,
	`updated_time` integer DEFAULT (cast(unixepoch('subsec') * 1000 as integer)) NOT NULL
);


CREATE UNIQUE INDEX `tb_record_with_record_record_id_related_record_id_unique` ON `tb_record_with_record` (`record_id`,`related_record_id`);


CREATE TABLE `tb_record` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`type_id` integer NOT NULL,
	`asset_id` integer NOT NULL,
	`into_asset_id` integer DEFAULT 0 NOT NULL,
	`books_id` integer NOT NULL,
	`amount` integer DEFAULT 0 NOT NULL,
	`final_amount` integer DEFAULT 0 NOT NULL,
	`charge` integer DEFAULT 0 NOT NULL,
	`remark` text DEFAULT '' NOT NULL,
	`reimbursable` text DEFAULT 'none' NOT NULL,
	`record_time` integer NOT NULL,
	`created_time` integer DEFAULT (cast(unixepoch('subsec') * 1000 as integer)) NOT NULL,
	`updated_time` integer DEFAULT (cast(unixepoch('subsec') * 1000 as integer)) NOT NULL
);


CREATE TABLE `tb_tag_with_record` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`record_id` integer NOT NULL,
	`tag_id` integer NOT NULL,
	`created_time` integer DEFAULT (cast(unixepoch('subsec') * 1000 as integer)) NOT NULL,
	`updated_time` integer DEFAULT (cast(unixepoch('subsec') * 1000 as integer)) NOT NULL
);


CREATE UNIQUE INDEX `tb_tag_with_record_record_id_tag_id_unique` ON `tb_tag_with_record` (`record_id`,`tag_id`);

CREATE TABLE `tb_tag` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`invisible` text DEFAULT 'visible' NOT NULL,
	`icon` text DEFAULT '' NOT NULL,
	`created_time` integer DEFAULT (cast(unixepoch('subsec') * 1000 as integer)) NOT NULL,
	`updated_time` integer DEFAULT (cast(unixepoch('subsec') * 1000 as integer)) NOT NULL
);


CREATE TABLE `tb_type` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`parent_id` integer DEFAULT 0 NOT NULL,
	`name` text NOT NULL,
	`icon` text NOT NULL,
	`type_category` text NOT NULL,
	`is_system` text DEFAULT 'custom' NOT NULL,
	`special_behavior` text DEFAULT '' NOT NULL,
	`sort` integer DEFAULT 1 NOT NULL,
	`created_time` integer DEFAULT (cast(unixepoch('subsec') * 1000 as integer)) NOT NULL,
	`updated_time` integer DEFAULT (cast(unixepoch('subsec') * 1000 as integer)) NOT NULL
);




-- 初始化系统类型数据
-- 支出类型
INSERT INTO tb_type (parent_id, name, icon, type_category, is_system, sort) VALUES
(0, '餐饮', 'ForkKnife', 'expense', 'system', 1),
(0, '日常', 'Heart', 'expense', 'system', 2),
(0, '购物', 'ShoppingCart', 'expense', 'system', 3),
(0, '服饰', 'TShirt', 'expense', 'system', 4),
(0, '数码', 'DeviceMobile', 'expense', 'system', 5),
(0, '娱乐', 'GameController', 'expense', 'system', 6),
(0, '家庭', 'Users', 'expense', 'system', 7),
(0, '育儿', 'BabyCarriage', 'expense', 'system', 8),
(0, '汽车', 'Car', 'expense', 'system', 9),
(0, '人际关系', 'Handshake', 'expense', 'system', 10),
(0, '交通', 'TrafficSignal', 'expense', 'system', 11),
(0, '住房', 'House', 'expense', 'system', 12),
(0, '医疗', 'Hospital', 'expense', 'system', 13),
(0, '文教', 'GraduationCap', 'expense', 'system', 14),
(0, '物业', 'Building', 'expense', 'system', 15),
(0, '其它', 'DotsThreeCircle', 'expense', 'system', 16);


-- 餐饮二级类型
INSERT INTO tb_type (parent_id, name, icon, type_category, is_system, sort) VALUES
(1, '餐饮', 'ForkKnife', 'expense', 'system', 1),
(1, '三餐', 'BowlFood', 'expense', 'system', 2),
(1, '早餐', 'Sun', 'expense', 'system', 3),
(1, '午餐', 'CookingPot', 'expense', 'system', 4),
(1, '晚餐', 'BowlSteam', 'expense', 'system', 5),
(1, '夜宵', 'MoonStars', 'expense', 'system', 6),
(1, '外卖', 'Package', 'expense', 'system', 7),
(1, '食材', 'Carrot', 'expense', 'system', 8),
(1, '柴米油盐', 'CookingPot', 'expense', 'system', 9),
(1, '水果', 'OrangeSlice', 'expense', 'system', 10),
(1, '甜点', 'Cake', 'expense', 'system', 11),
(1, '零食', 'Cookie', 'expense', 'system', 12),
(1, '饮料', 'Coffee', 'expense', 'system', 13),
(1, '烟酒', 'Cigarette', 'expense', 'system', 14),
(1, '烟酒零食', 'Storefront', 'expense', 'system', 15);


-- 日常二级类型
INSERT INTO tb_type (parent_id, name, icon, type_category, is_system, sort) VALUES
(2, '日用', 'Basket', 'expense', 'system', 1),
(2, '柴米油盐', 'CookingPot', 'expense', 'system', 2),
(2, '通讯', 'ChatCircle', 'expense', 'system', 3),
(2, '话费', 'Phone', 'expense', 'system', 4),
(2, '网费', 'WifiHigh', 'expense', 'system', 5),
(2, '生活', 'Heart', 'expense', 'system', 6),
(2, '清洁', 'Broom', 'expense', 'system', 7),
(2, '理发', 'Scissors', 'expense', 'system', 8),
(2, '洗澡', 'Shower', 'expense', 'system', 9),
(2, '快递', 'Package', 'expense', 'system', 10),
(2, '水费', 'Drop', 'expense', 'system', 11),
(2, '电费', 'Lightning', 'expense', 'system', 12),
(2, '燃气费', 'Flame', 'expense', 'system', 13),
(2, '垃圾费', 'Recycle', 'expense', 'system', 14),
(2, '物业费', 'Building', 'expense', 'system', 15),
(2, '取暖费', 'ThermometerHot', 'expense', 'system', 16);


-- 购物二级类型
INSERT INTO tb_type (parent_id, name, icon, type_category, is_system, sort) VALUES
(3, '购物', 'ShoppingCart', 'expense', 'system', 1),
(3, '数码', 'DeviceMobile', 'expense', 'system', 2),
(3, '日用', 'Basket', 'expense', 'system', 3),
(3, '电器', 'Plug', 'expense', 'system', 4),
(3, '美妆', 'Sparkle', 'expense', 'system', 5),
(3, '鞋服', 'TShirt', 'expense', 'system', 6),
(3, '饰品', 'Watch', 'expense', 'system', 7),
(3, '家具', 'Armchair', 'expense', 'system', 8);


-- 服饰二级类型
INSERT INTO tb_type (parent_id, name, icon, type_category, is_system, sort) VALUES
(4, '帽子', 'BaseballCap', 'expense', 'system', 1),
(4, '外套', 'Hoodie', 'expense', 'system', 2),
(4, '裤子', 'Pants', 'expense', 'system', 3),
(4, '内衣', 'TShirt', 'expense', 'system', 4),
(4, '包包', 'Handbag', 'expense', 'system', 5),
(4, '鞋子', 'Sneaker', 'expense', 'system', 6),
(4, '袜子', 'Sock', 'expense', 'system', 7),
(4, '饰品', 'Watch', 'expense', 'system', 8);


-- 数码二级类型
INSERT INTO tb_type (parent_id, name, icon, type_category, is_system, sort) VALUES
(5, '手机', 'DeviceMobile', 'expense', 'system', 1),
(5, '手机配件', 'Headphones', 'expense', 'system', 2),
(5, '付费会员', 'CrownSimple', 'expense', 'system', 3),
(5, '相机', 'Camera', 'expense', 'system', 4);


-- 娱乐二级类型
INSERT INTO tb_type (parent_id, name, icon, type_category, is_system, sort) VALUES
(6, '娱乐', 'GameController', 'expense', 'system', 1),
(6, '游戏', 'Joystick', 'expense', 'system', 2),
(6, '聚会', 'Confetti', 'expense', 'system', 3),
(6, '宠物', 'PawPrint', 'expense', 'system', 4),
(6, 'K歌', 'MusicNotes', 'expense', 'system', 5),
(6, '电影', 'FilmSlate', 'expense', 'system', 6),
(6, '演出', 'Megaphone', 'expense', 'system', 7),
(6, '旅行', 'Airplane', 'expense', 'system', 8),
(6, '门票', 'Ticket', 'expense', 'system', 9),
(6, '团费', 'MoneyWavy', 'expense', 'system', 10),
(6, '酒店', 'Bed', 'expense', 'system', 11),
(6, '纪念品', 'Gift', 'expense', 'system', 12),
(6, '运动', 'PersonSimpleRun', 'expense', 'system', 13);


-- 家庭二级类型
INSERT INTO tb_type (parent_id, name, icon, type_category, is_system, sort) VALUES
(7, '家人', 'Users', 'expense', 'system', 1),
(7, '父母', 'User', 'expense', 'system', 2),
(7, '恋爱', 'Heart', 'expense', 'system', 3),
(7, '孩子', 'Baby', 'expense', 'system', 4),
(7, '宠物', 'PawPrint', 'expense', 'system', 5);


-- 育儿二级类型
INSERT INTO tb_type (parent_id, name, icon, type_category, is_system, sort) VALUES
(8, '育儿', 'BabyCarriage', 'expense', 'system', 1),
(8, '奶粉', 'BowlFood', 'expense', 'system', 2),
(8, '奶瓶', 'Jar', 'expense', 'system', 3),
(8, '辅食', 'CookingPot', 'expense', 'system', 4),
(8, '纸尿裤', 'Pants', 'expense', 'system', 5),
(8, '洗护', 'SprayBottle', 'expense', 'system', 6),
(8, '玩具', 'PuzzlePiece', 'expense', 'system', 7),
(8, '童装', 'TShirt', 'expense', 'system', 8),
(8, '早教', 'BookOpen', 'expense', 'system', 9),
(8, '亲子游', 'Airplane', 'expense', 'system', 10),
(8, '疫苗接种', 'Syringe', 'expense', 'system', 11);


-- 汽车二级类型
INSERT INTO tb_type (parent_id, name, icon, type_category, is_system, sort) VALUES
(9, '汽车', 'Car', 'expense', 'system', 1),
(9, '停车', 'Garage', 'expense', 'system', 2),
(9, '加油', 'GasPump', 'expense', 'system', 3),
(9, '充电', 'BatteryCharging', 'expense', 'system', 4),
(9, '保养', 'Wrench', 'expense', 'system', 5),
(9, '洗车', 'SprayBottle', 'expense', 'system', 6),
(9, '维修', 'Hammer', 'expense', 'system', 7),
(9, '违章', 'WarningCircle', 'expense', 'system', 8),
(9, '车险', 'ShieldCheck', 'expense', 'system', 9),
(9, '车检', 'ClipboardText', 'expense', 'system', 10),
(9, '车贷', 'Bank', 'expense', 'system', 11),
(9, '通行费', 'RoadHorizon', 'expense', 'system', 12),
(9, '汽车配件', 'Gear', 'expense', 'system', 13);


-- 人际关系二级类型
INSERT INTO tb_type (parent_id, name, icon, type_category, is_system, sort) VALUES
(10, '人际关系', 'Handshake', 'expense', 'system', 1),
(10, '礼金', 'MoneyWavy', 'expense', 'system', 2),
(10, '礼品', 'Gift', 'expense', 'system', 3),
(10, '请客', 'ForkKnife', 'expense', 'system', 4);


-- 交通二级类型
INSERT INTO tb_type (parent_id, name, icon, type_category, is_system, sort) VALUES
(11, '交通', 'TrafficSignal', 'expense', 'system', 1),
(11, '公交', 'Bus', 'expense', 'system', 2),
(11, '地铁', 'Subway', 'expense', 'system', 3),
(11, '打车', 'Taxi', 'expense', 'system', 4),
(11, '火车', 'Train', 'expense', 'system', 5),
(11, '飞机', 'AirplaneTilt', 'expense', 'system', 6),
(11, '轮船', 'Boat', 'expense', 'system', 7),
(11, '自行车', 'Bicycle', 'expense', 'system', 8);


-- 住房二级类型
INSERT INTO tb_type (parent_id, name, icon, type_category, is_system, sort) VALUES
(12, '住房', 'House', 'expense', 'system', 1),
(12, '房租', 'Key', 'expense', 'system', 2),
(12, '房贷', 'Bank', 'expense', 'system', 3);


-- 医疗二级类型
INSERT INTO tb_type (parent_id, name, icon, type_category, is_system, sort) VALUES
(13, '医疗', 'Hospital', 'expense', 'system', 1),
(13, '挂号', 'ClipboardText', 'expense', 'system', 2),
(13, '看诊', 'Stethoscope', 'expense', 'system', 3),
(13, '药品', 'Pill', 'expense', 'system', 4),
(13, '住院', 'Bed', 'expense', 'system', 5),
(13, '保健', 'Heartbeat', 'expense', 'system', 6);


-- 文教二级类型
INSERT INTO tb_type (parent_id, name, icon, type_category, is_system, sort) VALUES
(14, '文教', 'GraduationCap', 'expense', 'system', 1),
(14, '学费', 'BookOpen', 'expense', 'system', 2),
(14, '文具', 'PencilRuler', 'expense', 'system', 3),
(14, '考试', 'Exam', 'expense', 'system', 4),
(14, '培训', 'Chalkboard', 'expense', 'system', 5),
(14, '书籍', 'Books', 'expense', 'system', 6);


-- 物业二级类型 (已在日常中包含)
-- 其它二级类型
INSERT INTO tb_type (parent_id, name, icon, type_category, is_system, sort) VALUES
(16, '其它', 'DotsThreeCircle', 'expense', 'system', 1);


-- 收入类型
INSERT INTO tb_type (parent_id, name, icon, type_category, is_system, special_behavior, sort) VALUES
(0, '收入', 'Briefcase', 'income', 'system', '', 100);


-- 收入二级类型
INSERT INTO tb_type (parent_id, name, icon, type_category, is_system, special_behavior, sort) VALUES
(17, '报销', 'Receipt', 'income', 'system', 'reimbursement_absorption', 1),
(17, '退款', 'ArrowULeftDown', 'income', 'system', 'refund_absorption', 2),
(17, '薪资', 'Briefcase', 'income', 'system', '', 3),
(17, '奖金', 'Coin', 'income', 'system', '', 4),
(17, '投资', 'ChartLineUp', 'income', 'system', '', 5),
(17, '外快', 'ShootingStar', 'income', 'system', '', 6),
(17, '其它', 'DotsThreeCircle', 'income', 'system', '', 7),
(17, '提成', 'Crown', 'income', 'system', '', 8),
(17, '公积金', 'Bank', 'income', 'system', '', 9),
(17, '医保', 'FirstAidKit', 'income', 'system', '', 10),
(17, '生活费', 'HandHeart', 'income', 'system', '', 11),
(17, '零花钱', 'Wallet', 'income', 'system', '', 12),
(17, '压岁钱', 'HandCoins', 'income', 'system', '', 13),
(17, '红包', 'CurrencyCny', 'income', 'system', '', 14),
(17, '租金', 'House', 'income', 'system', '', 15),
(17, '退税', 'ReceiptX', 'income', 'system', '', 16),
(17, '分红', 'ChartPieSlice', 'income', 'system', '', 17),
(17, '奖学金', 'GraduationCap', 'income', 'system', '', 18),
(17, '津贴', 'Gift', 'income', 'system', '', 19);


-- 转账类型
INSERT INTO tb_type (parent_id, name, icon, type_category, is_system, special_behavior, sort) VALUES
(0, '转账', 'ArrowsLeftRight', 'transfer', 'system', '', 200);


-- 转账二级类型
INSERT INTO tb_type (parent_id, name, icon, type_category, is_system, special_behavior, sort) VALUES
(18, '账户互转', 'ArrowsLeftRight', 'transfer', 'system', '', 1),
(18, '还信用卡', 'CreditCard', 'transfer', 'system', 'CreditCard', 2),
(18, '取款', 'ArrowLineUp', 'transfer', 'system', '', 3),
(18, '存款', 'ArrowLineDown', 'transfer', 'system', '', 4),
(18, '借入', 'HandWithdraw', 'transfer', 'system', 'debt_borrow', 5),
(18, '借出', 'HandDeposit', 'transfer', 'system', 'debt_lend', 6),
(18, '还款', 'ArrowULeftDown', 'transfer', 'system', 'debt_repayment', 7),
(18, '收款', 'Coins', 'transfer', 'system', 'debt_proceeds', 8),
(18, '其他', 'DotsThreeCircle', 'transfer', 'system', '', 9);


-- 理财类型
INSERT INTO tb_type (parent_id, name, icon, type_category, is_system, sort) VALUES
(0, '理财', 'PiggyBank', 'transfer', 'system', 300);


-- 理财二级类型
INSERT INTO tb_type (parent_id, name, icon, type_category, is_system, sort) VALUES
(19, '股票', 'ChartLineUp', 'transfer', 'system', 1),
(19, '基金', 'ChartBar', 'transfer', 'system', 2),
(19, '理财', 'PiggyBank', 'transfer', 'system', 3),
(19, '黄金', 'CoinVertical', 'transfer', 'system', 4),
(19, '债券', 'Certificate', 'transfer', 'system', 5),
(19, '外汇', 'CurrencyCircleDollar', 'transfer', 'system', 6),
(19, '手续费', 'Receipt', 'transfer', 'system', 7);

INSERT INTO tb_books (name, description, background) VALUES
('默认账本', '', '');


-- Custom SQL migration file, put your code below! --
-- 测试数据：在 1 号账本（默认账本）seed 资产、标签，并插入 100+ 条记录（支出/收入/转账）。
-- type_id 一律用子查询按 type_category + name (+ parent_id) 匹配，不依赖自增 ID。
-- 金额单位：分；时间戳：毫秒整数。

-- ── 资产 seed（books_id = 1）──────────────────────────────────────────────
INSERT INTO tb_asset (books_id, name, balance, type, classification, open_bank, card_no, remark, sort) VALUES
(1, '现金钱包', 88000, 'capital_account', 'cash', '', '', '日常现金', 1),
(1, '招商银行储蓄卡', 1865000, 'capital_account', 'BANK_CARD_ZS', '招商银行', '6225********8888', '工资卡', 2),
(1, '支付宝', 423000, 'capital_account', 'ALIPAY', '', '', '', 3),
(1, '微信钱包', 156000, 'capital_account', 'WECHAT', '', '', '', 4);
--> statement-breakpoint
INSERT INTO tb_asset (books_id, name, balance, total_amount, billing_date, repayment_date, type, classification, open_bank, card_no, remark, sort) VALUES
(1, '招行信用卡', 320000, 5000000, 5, 23, 'credit_card', 'credit_card', '招商银行', '5187********1234', '主信用卡', 5),
(1, '花呗', 128000, 1500000, 1, 10, 'credit_card', 'ANT_CREDIT_PAY', '', '', '', 6);
--> statement-breakpoint
-- ── 标签 seed ───────────────────────────────────────────────────────────
INSERT INTO tb_tag (name, icon) VALUES
('工作', 'Briefcase'),
('报销', 'Receipt'),
('家庭', 'House'),
('旅行', 'Airplane'),
('必需', 'CheckCircle'),
('计划外', 'WarningCircle');
--> statement-breakpoint
-- ── 支出记录（expense）─────────────────────────────────────────────────────
-- 紧凑写法：VALUES 携带 (类型名, 资产名, 金额, 手续费, 备注, 可报销, 天数偏移)，
-- 通过 JOIN tb_type / tb_asset 解析出真实外键；record_time = 当前往前推 d 天的毫秒时间戳。
WITH v(tname, aname, amount, charge, remark, reimb, d) AS (VALUES
  ('三餐', '微信钱包', 3500, 0, '楼下快餐', 'none', 1),
  ('早餐', '现金钱包', 800, 0, '包子豆浆', 'none', 1),
  ('打车', '支付宝', 2400, 0, '通勤打车', 'none', 2),
  ('外卖', '支付宝', 4200, 0, '加班外卖', 'able', 2),
  ('电影', '招行信用卡', 6800, 0, '周末电影', 'none', 3),
  ('水果', '微信钱包', 2960, 0, '超市水果', 'none', 3),
  ('话费', '招商银行储蓄卡', 10000, 0, '月度话费', 'none', 4),
  ('加油', '招行信用卡', 35000, 0, '加满一箱', 'none', 5),
  ('药品', '花呗', 8800, 0, '感冒药', 'able', 6),
  ('房租', '招商银行储蓄卡', 280000, 0, '本月房租', 'none', 6),
  ('三餐', '微信钱包', 2800, 0, '工作日午餐', 'none', 7),
  ('外卖', '支付宝', 3600, 0, '晚餐外卖', 'none', 8),
  ('打车', '支付宝', 1800, 0, '加班打车', 'able', 8),
  ('水果', '现金钱包', 1500, 0, '路边摊水果', 'none', 9),
  ('电影', '招行信用卡', 9000, 0, 'IMAX 场', 'none', 10),
  ('早餐', '现金钱包', 600, 0, '煎饼果子', 'none', 11),
  ('药品', '招商银行储蓄卡', 4500, 0, '维生素', 'none', 12),
  ('加油', '招行信用卡', 32000, 0, '高速前加油', 'none', 13),
  ('三餐', '花呗', 5200, 0, '同事聚餐', 'none', 14),
  ('打车', '支付宝', 2600, 0, '雨天打车', 'none', 15),
  ('外卖', '微信钱包', 3900, 0, '周末外卖', 'none', 16),
  ('话费', '招商银行储蓄卡', 10000, 0, '宽带续费', 'none', 18),
  ('水果', '微信钱包', 3400, 0, '车厘子', 'none', 20),
  ('三餐', '现金钱包', 2200, 0, '快餐', 'none', 22),
  ('电影', '招行信用卡', 7200, 0, '情侣场', 'none', 24),
  ('房租', '招商银行储蓄卡', 280000, 0, '上月房租', 'none', 33),
  ('加油', '招行信用卡', 34000, 0, '上月加油', 'none', 35),
  ('药品', '花呗', 12000, 0, '常备药', 'able', 38),
  ('三餐', '微信钱包', 4800, 0, '商务午餐', 'able', 40),
  ('打车', '支付宝', 3000, 0, '机场打车', 'none', 42),
  ('外卖', '支付宝', 4100, 0, '深夜外卖', 'none', 45),
  ('水果', '现金钱包', 2700, 0, '应季水果', 'none', 48),
  ('早餐', '现金钱包', 900, 0, '三明治', 'none', 50),
  ('三餐', '花呗', 6600, 0, '火锅', 'none', 52),
  ('电影', '招行信用卡', 8000, 0, '首映场', 'none', 55),
  ('话费', '招商银行储蓄卡', 10000, 0, '月度话费', 'none', 58)
)
INSERT INTO tb_record (type_id, asset_id, books_id, amount, final_amount, charge, remark, reimbursable, record_time)
SELECT t.id, a.id, 1, v.amount, v.amount + v.charge, v.charge, v.remark, v.reimb,
       cast((unixepoch('now', '-' || v.d || ' days') * 1000) as integer)
FROM v
JOIN tb_type t ON t.type_category='expense' AND t.name=v.tname
JOIN tb_asset a ON a.books_id=1 AND a.name=v.aname;
--> statement-breakpoint
-- ── 收入记录（income）──────────────────────────────────────────────────────
WITH v(tname, aname, amount, remark, d) AS (VALUES
  ('薪资', '招商银行储蓄卡', 1500000, '本月工资', 5),
  ('奖金', '招商银行储蓄卡', 300000, '季度奖金', 5),
  ('外快', '支付宝', 80000, '私活尾款', 9),
  ('红包', '微信钱包', 6600, '朋友红包', 11),
  ('提成', '招商银行储蓄卡', 120000, '销售提成', 15),
  ('租金', '招商银行储蓄卡', 250000, '房屋出租', 20),
  ('分红', '招商银行储蓄卡', 45000, '基金分红', 25),
  ('外快', '支付宝', 50000, '兼职收入', 30),
  ('薪资', '招商银行储蓄卡', 1500000, '上月工资', 35),
  ('红包', '微信钱包', 8800, '生日红包', 40),
  ('奖金', '招商银行储蓄卡', 200000, '项目奖金', 45),
  ('外快', '支付宝', 35000, '稿费', 50),
  ('租金', '招商银行储蓄卡', 250000, '上月房租收入', 52),
  ('提成', '招商银行储蓄卡', 95000, '上月提成', 58)
)
INSERT INTO tb_record (type_id, asset_id, books_id, amount, final_amount, charge, remark, reimbursable, record_time)
SELECT t.id, a.id, 1, v.amount, v.amount, 0, v.remark, 'none',
       cast((unixepoch('now', '-' || v.d || ' days') * 1000) as integer)
FROM v
JOIN tb_type t ON t.type_category='income' AND t.name=v.tname
JOIN tb_asset a ON a.books_id=1 AND a.name=v.aname;
--> statement-breakpoint
-- ── 转账记录（transfer）────────────────────────────────────────────────────
-- asset_id=转出资产，into_asset_id=转入资产；部分带手续费，final_amount = amount + charge。
WITH v(tname, aout, ain, amount, charge, remark, d) AS (VALUES
  ('账户互转', '招商银行储蓄卡', '支付宝', 100000, 0, '转入支付宝', 2),
  ('账户互转', '招商银行储蓄卡', '微信钱包', 50000, 0, '转入微信', 4),
  ('存款', '现金钱包', '招商银行储蓄卡', 200000, 0, '现金存银行', 7),
  ('取款', '招商银行储蓄卡', '现金钱包', 80000, 200, 'ATM 取款', 10),
  ('还信用卡', '招商银行储蓄卡', '招行信用卡', 320000, 0, '还信用卡账单', 12),
  ('还信用卡', '支付宝', '花呗', 128000, 0, '还花呗', 14),
  ('账户互转', '支付宝', '微信钱包', 30000, 0, '转给微信', 18),
  ('存款', '现金钱包', '招商银行储蓄卡', 150000, 0, '工资外存款', 22),
  ('取款', '招商银行储蓄卡', '现金钱包', 50000, 200, '周末取现', 28),
  ('账户互转', '招商银行储蓄卡', '支付宝', 60000, 0, '备用金转出', 33),
  ('还信用卡', '招商银行储蓄卡', '招行信用卡', 280000, 0, '上月账单', 40),
  ('账户互转', '微信钱包', '支付宝', 20000, 0, '余额归集', 46),
  ('存款', '现金钱包', '招商银行储蓄卡', 100000, 0, '红包存款', 50),
  ('还信用卡', '支付宝', '花呗', 95000, 0, '还花呗', 56)
)
INSERT INTO tb_record (type_id, asset_id, into_asset_id, books_id, amount, final_amount, charge, remark, reimbursable, record_time)
SELECT t.id, a.id, ia.id, 1, v.amount, v.amount + v.charge, v.charge, v.remark, 'none',
       cast((unixepoch('now', '-' || v.d || ' days') * 1000) as integer)
FROM v
JOIN tb_type t ON t.type_category='transfer' AND t.name=v.tname
JOIN tb_asset a ON a.books_id=1 AND a.name=v.aout
JOIN tb_asset ia ON ia.books_id=1 AND ia.name=v.ain;
--> statement-breakpoint
-- ── 支出记录（expense）第二批，补足 100+ 总量 ──────────────────────────────
WITH v(tname, aname, amount, remark, reimb, d) AS (VALUES
  ('三餐', '微信钱包', 3100, '工作餐', 'none', 1),
  ('早餐', '现金钱包', 700, '豆浆油条', 'none', 2),
  ('外卖', '支付宝', 4500, '午餐外卖', 'able', 3),
  ('打车', '支付宝', 2200, '通勤', 'none', 4),
  ('水果', '微信钱包', 3300, '葡萄', 'none', 5),
  ('电影', '招行信用卡', 6000, '工作日场', 'none', 6),
  ('三餐', '现金钱包', 2500, '面馆', 'none', 7),
  ('药品', '花呗', 5600, '退烧药', 'able', 9),
  ('外卖', '微信钱包', 3800, '晚餐', 'none', 11),
  ('加油', '招行信用卡', 33000, '加油', 'none', 13),
  ('三餐', '微信钱包', 4200, '聚餐', 'none', 16),
  ('打车', '支付宝', 1900, '夜间打车', 'none', 19),
  ('水果', '现金钱包', 1800, '苹果', 'none', 21),
  ('话费', '招商银行储蓄卡', 5000, '流量包', 'none', 24),
  ('早餐', '现金钱包', 850, '包子', 'none', 27),
  ('电影', '招行信用卡', 7500, '周末场', 'none', 30),
  ('外卖', '支付宝', 4000, '加班餐', 'able', 34),
  ('三餐', '花呗', 5800, '请客', 'none', 37),
  ('药品', '招商银行储蓄卡', 9200, '体检买药', 'none', 41),
  ('打车', '支付宝', 2800, '出差打车', 'able', 44),
  ('水果', '微信钱包', 2400, '橙子', 'none', 47),
  ('加油', '招行信用卡', 31000, '满油', 'none', 49),
  ('三餐', '微信钱包', 3600, '午餐', 'none', 51),
  ('外卖', '支付宝', 4300, '晚餐外卖', 'none', 53),
  ('电影', '招行信用卡', 8800, '点映', 'none', 54),
  ('早餐', '现金钱包', 650, '煎饼', 'none', 57),
  ('水果', '微信钱包', 2900, '芒果', 'none', 59),
  ('三餐', '现金钱包', 2300, '快餐', 'none', 60),
  ('话费', '招商银行储蓄卡', 10000, '月度话费', 'none', 60),
  ('打车', '支付宝', 2100, '回家打车', 'none', 28),
  ('外卖', '微信钱包', 3700, '夜宵', 'none', 36),
  ('药品', '花呗', 6800, '常备药', 'able', 43),
  ('三餐', '微信钱包', 5000, '团建餐', 'none', 48),
  ('水果', '现金钱包', 2050, '香蕉', 'none', 56),
  ('加油', '招行信用卡', 30000, '加油', 'none', 59),
  ('电影', '招行信用卡', 6300, '工作日', 'none', 26),
  ('三餐', '微信钱包', 3950, '午餐', 'none', 17),
  ('早餐', '现金钱包', 750, '小笼包', 'none', 23)
)
INSERT INTO tb_record (type_id, asset_id, books_id, amount, final_amount, charge, remark, reimbursable, record_time)
SELECT t.id, a.id, 1, v.amount, v.amount, 0, v.remark, v.reimb,
       cast((unixepoch('now', '-' || v.d || ' days') * 1000) as integer)
FROM v
JOIN tb_type t ON t.type_category='expense' AND t.name=v.tname
JOIN tb_asset a ON a.books_id=1 AND a.name=v.aname;
--> statement-breakpoint
-- ── 标签关联（tb_tag_with_record）─────────────────────────────────────────
-- 「报销」标签关联所有可报销记录。
INSERT INTO tb_tag_with_record (record_id, tag_id)
SELECT r.id, (SELECT id FROM tb_tag WHERE name='报销')
FROM tb_record r
WHERE r.books_id=1 AND r.reimbursable='able';
--> statement-breakpoint
-- 「工作」标签关联薪资/奖金/提成收入。
INSERT INTO tb_tag_with_record (record_id, tag_id)
SELECT r.id, (SELECT id FROM tb_tag WHERE name='工作')
FROM tb_record r
JOIN tb_type t ON t.id=r.type_id
WHERE r.books_id=1 AND t.type_category='income' AND t.name IN ('薪资','奖金','提成');
--> statement-breakpoint
-- 「旅行」标签关联出差/机场相关支出。
INSERT INTO tb_tag_with_record (record_id, tag_id)
SELECT r.id, (SELECT id FROM tb_tag WHERE name='旅行')
FROM tb_record r
WHERE r.books_id=1 AND r.remark IN ('机场打车','出差打车');
--> statement-breakpoint
-- 「家庭」标签关联房租支出。
INSERT INTO tb_tag_with_record (record_id, tag_id)
SELECT r.id, (SELECT id FROM tb_tag WHERE name='家庭')
FROM tb_record r
JOIN tb_type t ON t.id=r.type_id
WHERE r.books_id=1 AND t.type_category='expense' AND t.name='房租';

