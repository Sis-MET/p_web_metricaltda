CREATE TABLE `categories` (
	`id` int AUTO_INCREMENT NOT NULL,
	`slug` varchar(80) NOT NULL,
	`name` varchar(120) NOT NULL,
	`short` varchar(200) NOT NULL,
	`description` text NOT NULL,
	`image` json,
	`highlights` json NOT NULL,
	`demo` varchar(40),
	`position` int NOT NULL DEFAULT 0,
	`published` boolean NOT NULL DEFAULT false,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`updated_by` varchar(36),
	CONSTRAINT `categories_id` PRIMARY KEY(`id`),
	CONSTRAINT `categories_slug` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE TABLE `product_lines` (
	`id` int AUTO_INCREMENT NOT NULL,
	`category_id` int NOT NULL,
	`slug` varchar(80) NOT NULL,
	`name` varchar(120) NOT NULL,
	`position` int NOT NULL DEFAULT 0,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`updated_by` varchar(36),
	CONSTRAINT `product_lines_id` PRIMARY KEY(`id`),
	CONSTRAINT `product_lines_category_slug` UNIQUE(`category_id`,`slug`)
);
--> statement-breakpoint
CREATE TABLE `products` (
	`id` int AUTO_INCREMENT NOT NULL,
	`category_id` int NOT NULL,
	`line_id` int,
	`slug` varchar(80) NOT NULL,
	`model` varchar(120) NOT NULL,
	`type` varchar(120) NOT NULL,
	`summary` varchar(300) NOT NULL,
	`description` text NOT NULL,
	`capacity_min` double,
	`capacity_max` double,
	`protection` varchar(60),
	`environments` json NOT NULL,
	`features` json NOT NULL,
	`specs` json NOT NULL,
	`image` json,
	`brochure` json,
	`demo` varchar(40),
	`position` int NOT NULL DEFAULT 0,
	`published` boolean NOT NULL DEFAULT false,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`updated_by` varchar(36),
	CONSTRAINT `products_id` PRIMARY KEY(`id`),
	CONSTRAINT `products_slug` UNIQUE(`slug`)
);
--> statement-breakpoint
ALTER TABLE `product_lines` ADD CONSTRAINT `product_lines_category_id_categories_id_fk` FOREIGN KEY (`category_id`) REFERENCES `categories`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `products` ADD CONSTRAINT `products_category_id_categories_id_fk` FOREIGN KEY (`category_id`) REFERENCES `categories`(`id`) ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `products` ADD CONSTRAINT `products_line_id_product_lines_id_fk` FOREIGN KEY (`line_id`) REFERENCES `product_lines`(`id`) ON DELETE set null ON UPDATE no action;