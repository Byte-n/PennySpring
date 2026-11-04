CREATE TABLE `tb_quick_book_draft` (
	`id` text PRIMARY KEY NOT NULL,
	`books_id` integer NOT NULL,
	`status` text NOT NULL,
	`source` text NOT NULL,
	`image_path` text NOT NULL,
	`payload` text NOT NULL,
	`preset` text NOT NULL,
	`agent_provider_id` integer DEFAULT 0 NOT NULL,
	`agent_model_id` text DEFAULT '' NOT NULL,
	`agent_summary` text DEFAULT '' NOT NULL,
	`error_text` text DEFAULT '' NOT NULL,
	`confirmed_count` integer DEFAULT 0 NOT NULL,
	`record_ids` text DEFAULT '' NOT NULL,
	`created_time` integer DEFAULT (cast(unixepoch('subsec') * 1000 as integer)) NOT NULL,
	`updated_time` integer DEFAULT (cast(unixepoch('subsec') * 1000 as integer)) NOT NULL,
	`confirmed_at` integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE INDEX `tb_quick_book_draft_status_updated_time_index` ON `tb_quick_book_draft` (`status`,`updated_time`);--> statement-breakpoint
CREATE INDEX `tb_quick_book_draft_books_id_status_index` ON `tb_quick_book_draft` (`books_id`,`status`);