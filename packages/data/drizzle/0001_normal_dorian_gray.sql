CREATE TABLE `tb_agent_provider` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`descriptor_id` text NOT NULL,
	`name` text DEFAULT '' NOT NULL,
	`base_url` text DEFAULT '' NOT NULL,
	`default_model_id` text DEFAULT '' NOT NULL,
	`models` text DEFAULT '[]' NOT NULL,
	`store_responses` integer DEFAULT 1 NOT NULL,
	`created_time` integer DEFAULT (cast(unixepoch('subsec') * 1000 as integer)) NOT NULL,
	`updated_time` integer DEFAULT (cast(unixepoch('subsec') * 1000 as integer)) NOT NULL
);
--> statement-breakpoint
CREATE TABLE `tb_agent_selection` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`scope` text NOT NULL,
	`provider_id` integer DEFAULT 0 NOT NULL,
	`model_id` text DEFAULT '' NOT NULL,
	`created_time` integer DEFAULT (cast(unixepoch('subsec') * 1000 as integer)) NOT NULL,
	`updated_time` integer DEFAULT (cast(unixepoch('subsec') * 1000 as integer)) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `tb_agent_selection_scope_unique` ON `tb_agent_selection` (`scope`);--> statement-breakpoint
CREATE TABLE `tb_book_provider_key` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`books_id` integer NOT NULL,
	`provider_id` integer NOT NULL,
	`api_key` text DEFAULT '' NOT NULL,
	`created_time` integer DEFAULT (cast(unixepoch('subsec') * 1000 as integer)) NOT NULL,
	`updated_time` integer DEFAULT (cast(unixepoch('subsec') * 1000 as integer)) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `tb_book_provider_key_books_id_provider_id_unique` ON `tb_book_provider_key` (`books_id`,`provider_id`);--> statement-breakpoint
CREATE TABLE `tb_quick_template` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`books_id` integer NOT NULL,
	`name` text DEFAULT '' NOT NULL,
	`type_category` text NOT NULL,
	`type_id` integer DEFAULT 0 NOT NULL,
	`amount` integer DEFAULT 0 NOT NULL,
	`charge` integer DEFAULT 0 NOT NULL,
	`remark` text DEFAULT '' NOT NULL,
	`asset_id` integer DEFAULT 0 NOT NULL,
	`into_asset_id` integer DEFAULT 0 NOT NULL,
	`reimbursable` text DEFAULT 'none' NOT NULL,
	`tag_ids` text DEFAULT '[]' NOT NULL,
	`icon` text DEFAULT '' NOT NULL,
	`sort` integer DEFAULT 1 NOT NULL,
	`created_time` integer DEFAULT (cast(unixepoch('subsec') * 1000 as integer)) NOT NULL,
	`updated_time` integer DEFAULT (cast(unixepoch('subsec') * 1000 as integer)) NOT NULL
);
--> statement-breakpoint
CREATE INDEX `tb_quick_template_books_id_index` ON `tb_quick_template` (`books_id`);--> statement-breakpoint
ALTER TABLE `tb_agent_thread` ADD `provider_id` integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `tb_agent_thread` ADD `model_id` text DEFAULT '' NOT NULL;