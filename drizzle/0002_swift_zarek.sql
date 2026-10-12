CREATE TABLE `chatbot_enquiry` (
	`id` varchar(36) NOT NULL,
	`first_name` varchar(120) NOT NULL,
	`last_name` varchar(120),
	`email` varchar(250) NOT NULL,
	`phone_or_company` varchar(160),
	`message` mediumtext NOT NULL,
	`appointment_requested` boolean NOT NULL DEFAULT false,
	`is_read` int NOT NULL DEFAULT 0,
	`ip_address` varchar(64),
	`user_agent` varchar(512),
	`created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT `chatbot_enquiry_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE INDEX `chatbot_enquiry_appointment_idx` ON `chatbot_enquiry` (`appointment_requested`);