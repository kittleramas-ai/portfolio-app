CREATE TABLE `advisory_enquiry` (
	`id` varchar(36) NOT NULL,
	`first_name` varchar(120) NOT NULL,
	`last_name` varchar(120),
	`email` varchar(250) NOT NULL,
	`phone_or_company` varchar(160),
	`message` mediumtext NOT NULL,
	`is_read` int NOT NULL DEFAULT 0,
	`ip_address` varchar(64),
	`user_agent` varchar(512),
	`created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT `advisory_enquiry_id` PRIMARY KEY(`id`)
);
