CREATE TABLE `admin_session` (
	`id` varchar(36) NOT NULL,
	`user_id` varchar(36) NOT NULL,
	`token_hash` varchar(128) NOT NULL,
	`expires_at` datetime NOT NULL,
	`created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
	`last_active_at` datetime,
	`user_agent` varchar(512),
	CONSTRAINT `admin_session_id` PRIMARY KEY(`id`),
	CONSTRAINT `admin_session_token_hash_uq` UNIQUE(`token_hash`)
);
--> statement-breakpoint
CREATE TABLE `admin_user` (
	`id` varchar(36) NOT NULL,
	`email` varchar(250) NOT NULL,
	`password_hash` varchar(255) NOT NULL,
	`display_name` varchar(120),
	`created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
	`last_login_at` datetime,
	CONSTRAINT `admin_user_id` PRIMARY KEY(`id`),
	CONSTRAINT `admin_user_email_uq` UNIQUE(`email`)
);
--> statement-breakpoint
CREATE TABLE `site_media` (
	`slot` varchar(64) NOT NULL,
	`storage_key` varchar(250) NOT NULL,
	`content_type` varchar(120) NOT NULL,
	`size_bytes` int NOT NULL,
	`width` int,
	`height` int,
	`alt_text` varchar(500) NOT NULL DEFAULT '',
	`updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
	`updated_by` varchar(36),
	CONSTRAINT `site_media_slot` PRIMARY KEY(`slot`),
	CONSTRAINT `site_media_storage_key_unique` UNIQUE(`storage_key`)
);
--> statement-breakpoint
CREATE TABLE `site_setting` (
	`key` varchar(64) NOT NULL,
	`value` mediumtext NOT NULL,
	`group_key` varchar(64) NOT NULL,
	`updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
	`updated_by` varchar(36),
	CONSTRAINT `site_setting_key` PRIMARY KEY(`key`)
);
--> statement-breakpoint
ALTER TABLE `admin_session` ADD CONSTRAINT `admin_session_user_id_admin_user_id_fk` FOREIGN KEY (`user_id`) REFERENCES `admin_user`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `site_media` ADD CONSTRAINT `site_media_updated_by_admin_user_id_fk` FOREIGN KEY (`updated_by`) REFERENCES `admin_user`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `site_setting` ADD CONSTRAINT `site_setting_updated_by_admin_user_id_fk` FOREIGN KEY (`updated_by`) REFERENCES `admin_user`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `admin_session_user_idx` ON `admin_session` (`user_id`);--> statement-breakpoint
CREATE INDEX `site_setting_group_idx` ON `site_setting` (`group_key`);