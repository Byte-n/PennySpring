CREATE TABLE `tb_record_client_mutation` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`books_id` integer NOT NULL,
	`client_mutation_id` text NOT NULL,
	`record_id` integer NOT NULL,
	`created_time` integer DEFAULT (cast(unixepoch('subsec') * 1000 as integer)) NOT NULL,
	`updated_time` integer DEFAULT (cast(unixepoch('subsec') * 1000 as integer)) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `tb_record_client_mutation_books_id_client_mutation_id_unique` ON `tb_record_client_mutation` (`books_id`,`client_mutation_id`);