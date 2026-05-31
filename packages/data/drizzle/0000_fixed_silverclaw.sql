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
