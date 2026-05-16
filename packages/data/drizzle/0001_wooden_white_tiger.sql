PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_tb_record` (
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
INSERT INTO `__new_tb_record`("id", "type_id", "asset_id", "into_asset_id", "books_id", "amount", "final_amount", "charge", "remark", "reimbursable", "record_time", "created_time", "updated_time") SELECT "id", "type_id", "asset_id", "into_asset_id", "books_id", "amount", "final_amount", "charge", "remark", "reimbursable", "record_time", "created_time", "updated_time" FROM `tb_record`;--> statement-breakpoint
DROP TABLE `tb_record`;--> statement-breakpoint
ALTER TABLE `__new_tb_record` RENAME TO `tb_record`;--> statement-breakpoint
PRAGMA foreign_keys=ON;