ALTER TABLE `accounts` MODIFY COLUMN `access_token_expires_at` datetime;--> statement-breakpoint
ALTER TABLE `accounts` MODIFY COLUMN `refresh_token_expires_at` datetime;--> statement-breakpoint
ALTER TABLE `sessions` MODIFY COLUMN `expires_at` datetime NOT NULL;--> statement-breakpoint
ALTER TABLE `users` MODIFY COLUMN `ban_expires` datetime;--> statement-breakpoint
ALTER TABLE `verifications` MODIFY COLUMN `expires_at` datetime NOT NULL;