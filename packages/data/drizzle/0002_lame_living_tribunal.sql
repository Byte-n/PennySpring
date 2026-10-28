DROP INDEX `tb_agent_thread_books_id_unique`;--> statement-breakpoint
CREATE INDEX `tb_agent_thread_books_id_index` ON `tb_agent_thread` (`books_id`);