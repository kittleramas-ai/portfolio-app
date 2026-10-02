CREATE TABLE `admin_session` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`token_hash` text NOT NULL,
	`expires_at` integer NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`last_active_at` integer,
	`user_agent` text,
	FOREIGN KEY (`user_id`) REFERENCES `admin_user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `admin_session_token_hash_uq` ON `admin_session` (`token_hash`);--> statement-breakpoint
CREATE INDEX `admin_session_user_idx` ON `admin_session` (`user_id`);--> statement-breakpoint
CREATE TABLE `admin_user` (
	`id` text PRIMARY KEY NOT NULL,
	`email` text NOT NULL,
	`password_hash` text NOT NULL,
	`display_name` text,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`last_login_at` integer
);
--> statement-breakpoint
CREATE UNIQUE INDEX `admin_user_email_uq` ON `admin_user` (`email`);--> statement-breakpoint
CREATE TABLE `site_setting` (
	`key` text PRIMARY KEY NOT NULL,
	`value` text NOT NULL,
	`group_key` text NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_by` text,
	FOREIGN KEY (`updated_by`) REFERENCES `admin_user`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE INDEX `site_setting_group_idx` ON `site_setting` (`group_key`);