CREATE TABLE `tb_agent_message` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`thread_id` integer NOT NULL,
	`role` text NOT NULL,
	`content` text DEFAULT '' NOT NULL,
	`tool_calls` text DEFAULT '' NOT NULL,
	`tool_call_id` text DEFAULT '' NOT NULL,
	`tool_name` text DEFAULT '' NOT NULL,
	`usage` text DEFAULT '' NOT NULL,
	`created_time` integer DEFAULT (cast(unixepoch('subsec') * 1000 as integer)) NOT NULL,
	`updated_time` integer DEFAULT (cast(unixepoch('subsec') * 1000 as integer)) NOT NULL
);
--> statement-breakpoint
CREATE INDEX `tb_agent_message_thread_id_index` ON `tb_agent_message` (`thread_id`);--> statement-breakpoint
CREATE TABLE `tb_agent_thread` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`books_id` integer NOT NULL,
	`title` text DEFAULT '' NOT NULL,
	`created_time` integer DEFAULT (cast(unixepoch('subsec') * 1000 as integer)) NOT NULL,
	`updated_time` integer DEFAULT (cast(unixepoch('subsec') * 1000 as integer)) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `tb_agent_thread_books_id_unique` ON `tb_agent_thread` (`books_id`);