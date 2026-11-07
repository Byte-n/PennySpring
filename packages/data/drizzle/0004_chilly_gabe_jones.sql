CREATE TABLE `tb_agent_rules` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`books_id` integer NOT NULL,
	`agent_rules` text DEFAULT '' NOT NULL,
	`quick_book_rules` text DEFAULT '' NOT NULL,
	`created_time` integer DEFAULT (cast(unixepoch('subsec') * 1000 as integer)) NOT NULL,
	`updated_time` integer DEFAULT (cast(unixepoch('subsec') * 1000 as integer)) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `tb_agent_rules_books_id_unique` ON `tb_agent_rules` (`books_id`);