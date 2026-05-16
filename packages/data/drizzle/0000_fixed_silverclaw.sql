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
--> statement-breakpoint
CREATE TABLE `tb_books` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`description` text DEFAULT '' NOT NULL,
	`background` text DEFAULT '' NOT NULL,
	`created_time` integer DEFAULT (cast(unixepoch('subsec') * 1000 as integer)) NOT NULL,
	`updated_time` integer DEFAULT (cast(unixepoch('subsec') * 1000 as integer)) NOT NULL
);
--> statement-breakpoint
CREATE TABLE `tb_image_with_related` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`record_id` integer NOT NULL,
	`image_path` text NOT NULL,
	`created_time` integer DEFAULT (cast(unixepoch('subsec') * 1000 as integer)) NOT NULL,
	`updated_time` integer DEFAULT (cast(unixepoch('subsec') * 1000 as integer)) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `tb_image_with_related_record_id_image_path_unique` ON `tb_image_with_related` (`record_id`,`image_path`);--> statement-breakpoint
CREATE TABLE `tb_record_with_record` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`record_id` integer NOT NULL,
	`related_record_id` integer NOT NULL,
	`created_time` integer DEFAULT (cast(unixepoch('subsec') * 1000 as integer)) NOT NULL,
	`updated_time` integer DEFAULT (cast(unixepoch('subsec') * 1000 as integer)) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `tb_record_with_record_record_id_related_record_id_unique` ON `tb_record_with_record` (`record_id`,`related_record_id`);--> statement-breakpoint
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
--> statement-breakpoint
CREATE TABLE `tb_tag_with_record` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`record_id` integer NOT NULL,
	`tag_id` integer NOT NULL,
	`created_time` integer DEFAULT (cast(unixepoch('subsec') * 1000 as integer)) NOT NULL,
	`updated_time` integer DEFAULT (cast(unixepoch('subsec') * 1000 as integer)) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `tb_tag_with_record_record_id_tag_id_unique` ON `tb_tag_with_record` (`record_id`,`tag_id`);--> statement-breakpoint
CREATE TABLE `tb_tag` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`invisible` text DEFAULT 'visible' NOT NULL,
	`icon` text DEFAULT '' NOT NULL,
	`created_time` integer DEFAULT (cast(unixepoch('subsec') * 1000 as integer)) NOT NULL,
	`updated_time` integer DEFAULT (cast(unixepoch('subsec') * 1000 as integer)) NOT NULL
);
--> statement-breakpoint
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


--> statement-breakpoint
-- 初始化系统类型数据
-- 支出类型
INSERT INTO tb_type (parent_id, name, icon, type_category, is_system, sort) VALUES
(0, '餐饮', 'dining', 'expense', 'system', 1),
(0, '日常', 'life', 'expense', 'system', 2),
(0, '购物', 'shopping', 'expense', 'system', 3),
(0, '服饰', 'clothes', 'expense', 'system', 4),
(0, '数码', 'digital_product', 'expense', 'system', 5),
(0, '娱乐', 'amusement', 'expense', 'system', 6),
(0, '家庭', 'family', 'expense', 'system', 7),
(0, '育儿', 'parenting', 'expense', 'system', 8),
(0, '汽车', 'car', 'expense', 'system', 9),
(0, '人际关系', 'interpersonal', 'expense', 'system', 10),
(0, '交通', 'traffic', 'expense', 'system', 11),
(0, '住房', 'housing', 'expense', 'system', 12),
(0, '医疗', 'medical', 'expense', 'system', 13),
(0, '文教', 'books_education', 'expense', 'system', 14),
(0, '物业', 'property_costs', 'expense', 'system', 15),
(0, '其它', 'other', 'expense', 'system', 16);
--> statement-breakpoint
-- 餐饮二级类型
INSERT INTO tb_type (parent_id, name, icon, type_category, is_system, sort) VALUES
(1, '餐饮', 'dining', 'expense', 'system', 1),
(1, '三餐', 'three_meals', 'expense', 'system', 2),
(1, '早餐', 'breakfast', 'expense', 'system', 3),
(1, '午餐', 'lunch', 'expense', 'system', 4),
(1, '晚餐', 'dinner', 'expense', 'system', 5),
(1, '夜宵', 'supper', 'expense', 'system', 6),
(1, '外卖', 'takeaway', 'expense', 'system', 7),
(1, '食材', 'food_ingredient', 'expense', 'system', 8),
(1, '柴米油盐', 'kitchen_daily_necessities', 'expense', 'system', 9),
(1, '水果', 'fruit', 'expense', 'system', 10),
(1, '甜点', 'dessert', 'expense', 'system', 11),
(1, '零食', 'snacks', 'expense', 'system', 12),
(1, '饮料', 'drinks', 'expense', 'system', 13),
(1, '烟酒', 'at', 'expense', 'system', 14),
(1, '烟酒零食', 'ats', 'expense', 'system', 15);
--> statement-breakpoint
-- 日常二级类型
INSERT INTO tb_type (parent_id, name, icon, type_category, is_system, sort) VALUES
(2, '日用', 'daily_necessities', 'expense', 'system', 1),
(2, '柴米油盐', 'kitchen_daily_necessities', 'expense', 'system', 2),
(2, '通讯', 'communication', 'expense', 'system', 3),
(2, '话费', 'call_charge', 'expense', 'system', 4),
(2, '网费', 'net_fee', 'expense', 'system', 5),
(2, '生活', 'life', 'expense', 'system', 6),
(2, '清洁', 'clean', 'expense', 'system', 7),
(2, '理发', 'haircut', 'expense', 'system', 8),
(2, '洗澡', 'bath', 'expense', 'system', 9),
(2, '快递', 'express', 'expense', 'system', 10),
(2, '水费', 'water_rate', 'expense', 'system', 11),
(2, '电费', 'electricity', 'expense', 'system', 12),
(2, '燃气费', 'gas_charge', 'expense', 'system', 13),
(2, '垃圾费', 'garbage_fee', 'expense', 'system', 14),
(2, '物业费', 'property_costs', 'expense', 'system', 15),
(2, '取暖费', 'heating_fee', 'expense', 'system', 16);
--> statement-breakpoint
-- 购物二级类型
INSERT INTO tb_type (parent_id, name, icon, type_category, is_system, sort) VALUES
(3, '购物', 'shopping', 'expense', 'system', 1),
(3, '数码', 'digital_product', 'expense', 'system', 2),
(3, '日用', 'daily', 'expense', 'system', 3),
(3, '电器', 'electrical_appliance', 'expense', 'system', 4),
(3, '美妆', 'beauty', 'expense', 'system', 5),
(3, '鞋服', 'clothes', 'expense', 'system', 6),
(3, '饰品', 'accessories', 'expense', 'system', 7),
(3, '家具', 'furniture', 'expense', 'system', 8);
--> statement-breakpoint
-- 服饰二级类型
INSERT INTO tb_type (parent_id, name, icon, type_category, is_system, sort) VALUES
(4, '帽子', 'hat', 'expense', 'system', 1),
(4, '外套', 'coat', 'expense', 'system', 2),
(4, '裤子', 'pants', 'expense', 'system', 3),
(4, '内衣', 'underwear', 'expense', 'system', 4),
(4, '包包', 'bag', 'expense', 'system', 5),
(4, '鞋子', 'shoes', 'expense', 'system', 6),
(4, '袜子', 'socks', 'expense', 'system', 7),
(4, '饰品', 'accessories', 'expense', 'system', 8);
--> statement-breakpoint
-- 数码二级类型
INSERT INTO tb_type (parent_id, name, icon, type_category, is_system, sort) VALUES
(5, '手机', 'mobile_phone', 'expense', 'system', 1),
(5, '手机配件', 'mobile_phone_accessories', 'expense', 'system', 2),
(5, '付费会员', 'member', 'expense', 'system', 3),
(5, '相机', 'camera', 'expense', 'system', 4);
--> statement-breakpoint
-- 娱乐二级类型
INSERT INTO tb_type (parent_id, name, icon, type_category, is_system, sort) VALUES
(6, '娱乐', 'amusement', 'expense', 'system', 1),
(6, '游戏', 'game', 'expense', 'system', 2),
(6, '聚会', 'party', 'expense', 'system', 3),
(6, '宠物', 'pet', 'expense', 'system', 4),
(6, 'K歌', 'sing', 'expense', 'system', 5),
(6, '电影', 'movie', 'expense', 'system', 6),
(6, '演出', 'show', 'expense', 'system', 7),
(6, '旅行', 'travel', 'expense', 'system', 8),
(6, '门票', 'tickets', 'expense', 'system', 9),
(6, '团费', 'excursion_fare', 'expense', 'system', 10),
(6, '酒店', 'hotel', 'expense', 'system', 11),
(6, '纪念品', 'souvenir', 'expense', 'system', 12),
(6, '运动', 'sport', 'expense', 'system', 13);
--> statement-breakpoint
-- 家庭二级类型
INSERT INTO tb_type (parent_id, name, icon, type_category, is_system, sort) VALUES
(7, '家人', 'family', 'expense', 'system', 1),
(7, '父母', 'parent', 'expense', 'system', 2),
(7, '恋爱', 'love', 'expense', 'system', 3),
(7, '孩子', 'child', 'expense', 'system', 4),
(7, '宠物', 'pet', 'expense', 'system', 5);
--> statement-breakpoint
-- 育儿二级类型
INSERT INTO tb_type (parent_id, name, icon, type_category, is_system, sort) VALUES
(8, '育儿', 'parenting', 'expense', 'system', 1),
(8, '奶粉', 'milk_powder', 'expense', 'system', 2),
(8, '奶瓶', 'feeder', 'expense', 'system', 3),
(8, '辅食', 'supplementary_food', 'expense', 'system', 4),
(8, '纸尿裤', 'diapers', 'expense', 'system', 5),
(8, '洗护', 'body_hair', 'expense', 'system', 6),
(8, '玩具', 'toy', 'expense', 'system', 7),
(8, '童装', 'kids', 'expense', 'system', 8),
(8, '早教', 'early_education', 'expense', 'system', 9),
(8, '亲子游', 'family_trip', 'expense', 'system', 10),
(8, '疫苗接种', 'vaccination', 'expense', 'system', 11);
--> statement-breakpoint
-- 汽车二级类型
INSERT INTO tb_type (parent_id, name, icon, type_category, is_system, sort) VALUES
(9, '汽车', 'car', 'expense', 'system', 1),
(9, '停车', 'parking', 'expense', 'system', 2),
(9, '加油', 'refuel', 'expense', 'system', 3),
(9, '充电', 'car_charge', 'expense', 'system', 4),
(9, '保养', 'car_maintenance', 'expense', 'system', 5),
(9, '洗车', 'car_wash', 'expense', 'system', 6),
(9, '维修', 'repair', 'expense', 'system', 7),
(9, '违章', 'illegal', 'expense', 'system', 8),
(9, '车险', 'car_insurance', 'expense', 'system', 9),
(9, '车检', 'car_inspection', 'expense', 'system', 10),
(9, '车贷', 'car_loan', 'expense', 'system', 11),
(9, '通行费', 'toll', 'expense', 'system', 12),
(9, '汽车配件', 'auto_parts', 'expense', 'system', 13);
--> statement-breakpoint
-- 人际关系二级类型
INSERT INTO tb_type (parent_id, name, icon, type_category, is_system, sort) VALUES
(10, '人际关系', 'interpersonal', 'expense', 'system', 1),
(10, '礼金', 'cash_gift', 'expense', 'system', 2),
(10, '礼品', 'gift', 'expense', 'system', 3),
(10, '请客', 'treat', 'expense', 'system', 4);
--> statement-breakpoint
-- 交通二级类型
INSERT INTO tb_type (parent_id, name, icon, type_category, is_system, sort) VALUES
(11, '交通', 'traffic', 'expense', 'system', 1),
(11, '公交', 'bus', 'expense', 'system', 2),
(11, '地铁', 'subway', 'expense', 'system', 3),
(11, '打车', 'taxi', 'expense', 'system', 4),
(11, '火车', 'train', 'expense', 'system', 5),
(11, '飞机', 'plane', 'expense', 'system', 6),
(11, '轮船', 'ship', 'expense', 'system', 7),
(11, '自行车', 'bicycle', 'expense', 'system', 8);
--> statement-breakpoint
-- 住房二级类型
INSERT INTO tb_type (parent_id, name, icon, type_category, is_system, sort) VALUES
(12, '住房', 'housing', 'expense', 'system', 1),
(12, '房租', 'house_rent', 'expense', 'system', 2),
(12, '房贷', 'house_loan', 'expense', 'system', 3);
--> statement-breakpoint
-- 医疗二级类型
INSERT INTO tb_type (parent_id, name, icon, type_category, is_system, sort) VALUES
(13, '医疗', 'medical', 'expense', 'system', 1),
(13, '挂号', 'registration', 'expense', 'system', 2),
(13, '看诊', 'diagnose', 'expense', 'system', 3),
(13, '药品', 'drug', 'expense', 'system', 4),
(13, '住院', 'hospitalization', 'expense', 'system', 5),
(13, '保健', 'hygiene', 'expense', 'system', 6);
--> statement-breakpoint
-- 文教二级类型
INSERT INTO tb_type (parent_id, name, icon, type_category, is_system, sort) VALUES
(14, '文教', 'books_education', 'expense', 'system', 1),
(14, '学费', 'study', 'expense', 'system', 2),
(14, '文具', 'stationery', 'expense', 'system', 3),
(14, '考试', 'exam', 'expense', 'system', 4),
(14, '培训', 'training', 'expense', 'system', 5),
(14, '书籍', 'books', 'expense', 'system', 6);
--> statement-breakpoint
-- 物业二级类型 (已在日常中包含)
-- 其它二级类型
INSERT INTO tb_type (parent_id, name, icon, type_category, is_system, sort) VALUES
(16, '其它', 'other', 'expense', 'system', 1);
--> statement-breakpoint
-- 收入类型
INSERT INTO tb_type (parent_id, name, icon, type_category, is_system, special_behavior, sort) VALUES
(0, '收入', 'salary', 'income', 'system', '', 100);
--> statement-breakpoint
-- 收入二级类型
INSERT INTO tb_type (parent_id, name, icon, type_category, is_system, special_behavior, sort) VALUES
(17, '报销', 'reimburse', 'income', 'system', 'reimbursement_absorption', 1),
(17, '退款', 'refund', 'income', 'system', 'refund_absorption', 2),
(17, '薪资', 'salary', 'income', 'system', '', 3),
(17, '奖金', 'bonus', 'income', 'system', '', 4),
(17, '投资', 'investment', 'income', 'system', '', 5),
(17, '外快', 'windfall', 'income', 'system', '', 6),
(17, '其它', 'other', 'income', 'system', '', 7),
(17, '提成', 'royalty', 'income', 'system', '', 8),
(17, '公积金', 'provident_fund', 'income', 'system', '', 9),
(17, '医保', 'medicare', 'income', 'system', '', 10),
(17, '生活费', 'alimony', 'income', 'system', '', 11),
(17, '零花钱', 'pocket_money', 'income', 'system', '', 12),
(17, '压岁钱', 'lucky_money', 'income', 'system', '', 13),
(17, '红包', 'convert_payment', 'income', 'system', '', 14),
(17, '租金', 'rent', 'income', 'system', '', 15),
(17, '退税', 'tax_rebate', 'income', 'system', '', 16),
(17, '分红', 'dividend', 'income', 'system', '', 17),
(17, '奖学金', 'scholarship', 'income', 'system', '', 18),
(17, '津贴', 'benefit', 'income', 'system', '', 19);
--> statement-breakpoint
-- 转账类型
INSERT INTO tb_type (parent_id, name, icon, type_category, is_system, special_behavior, sort) VALUES
(0, '转账', 'account_transfer', 'transfer', 'system', '', 200);
--> statement-breakpoint
-- 转账二级类型
INSERT INTO tb_type (parent_id, name, icon, type_category, is_system, special_behavior, sort) VALUES
(18, '账户互转', 'account_transfer', 'transfer', 'system', '', 1),
(18, '还信用卡', 'credit_card_payment', 'transfer', 'system', 'credit_card_payment', 2),
(18, '取款', 'withdrawals', 'transfer', 'system', '', 3),
(18, '存款', 'deposit', 'transfer', 'system', '', 4),
(18, '借入', 'borrow', 'transfer', 'system', 'debt_borrow', 5),
(18, '借出', 'lend', 'transfer', 'system', 'debt_lend', 6),
(18, '还款', 'repayment', 'transfer', 'system', 'debt_repayment', 7),
(18, '收款', 'proceeds', 'transfer', 'system', 'debt_proceeds', 8),
(18, '其他', 'other', 'transfer', 'system', '', 9);
--> statement-breakpoint
-- 理财类型
INSERT INTO tb_type (parent_id, name, icon, type_category, is_system, sort) VALUES
(0, '理财', 'money_management', 'transfer', 'system', 300);
--> statement-breakpoint
-- 理财二级类型
INSERT INTO tb_type (parent_id, name, icon, type_category, is_system, sort) VALUES
(19, '股票', 'stock', 'transfer', 'system', 1),
(19, '基金', 'fund', 'transfer', 'system', 2),
(19, '理财', 'money_management', 'transfer', 'system', 3),
(19, '黄金', 'gold', 'transfer', 'system', 4),
(19, '债券', 'bond', 'transfer', 'system', 5),
(19, '外汇', 'forex', 'transfer', 'system', 6),
(19, '手续费', 'charge', 'transfer', 'system', 7);
