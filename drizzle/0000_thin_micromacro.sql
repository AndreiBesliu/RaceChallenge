CREATE TABLE `entrants` (
	`id` text PRIMARY KEY NOT NULL,
	`tournament` text NOT NULL,
	`player` text NOT NULL
);
--> statement-breakpoint
CREATE INDEX `entrants_tournament` ON `entrants` (`tournament`);--> statement-breakpoint
CREATE TABLE `locks` (
	`player` text PRIMARY KEY NOT NULL,
	`room` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `messages` (
	`id` text PRIMARY KEY NOT NULL,
	`channel` text NOT NULL,
	`sender` text NOT NULL,
	`body` text NOT NULL,
	`created` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `messages_channel_created` ON `messages` (`channel`,`created`);--> statement-breakpoint
CREATE TABLE `players` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`country` text DEFAULT 'România' NOT NULL,
	`avatar` text DEFAULT 'P' NOT NULL,
	`tyre` text DEFAULT 'medium' NOT NULL,
	`points` integer DEFAULT 0 NOT NULL,
	`wins` integer DEFAULT 0 NOT NULL,
	`losses` integer DEFAULT 0 NOT NULL,
	`titles` integer DEFAULT 0 NOT NULL,
	`admin` integer DEFAULT 0 NOT NULL,
	`seen` integer NOT NULL,
	`created` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `records` (
	`id` text PRIMARY KEY NOT NULL,
	`player` text NOT NULL,
	`track` text NOT NULL,
	`lap` real NOT NULL,
	`total` real,
	`room` text NOT NULL
);
--> statement-breakpoint
CREATE INDEX `records_track_lap` ON `records` (`track`,`lap`);--> statement-breakpoint
CREATE INDEX `records_player` ON `records` (`player`);--> statement-breakpoint
CREATE TABLE `results` (
	`id` text PRIMARY KEY NOT NULL,
	`token` text NOT NULL,
	`winner` text NOT NULL,
	`loser` text NOT NULL,
	`track` text NOT NULL,
	`time` real NOT NULL,
	`season` text NOT NULL,
	`tournament` text,
	`created` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `results_season` ON `results` (`season`);--> statement-breakpoint
CREATE INDEX `results_winner` ON `results` (`winner`);--> statement-breakpoint
CREATE TABLE `rooms` (
	`id` text PRIMARY KEY NOT NULL,
	`host` text NOT NULL,
	`guest` text NOT NULL,
	`status` text NOT NULL,
	`data` text NOT NULL,
	`rev` integer DEFAULT 0 NOT NULL,
	`created` integer NOT NULL,
	`tournament` text
);
--> statement-breakpoint
CREATE INDEX `rooms_host_status` ON `rooms` (`host`,`status`);--> statement-breakpoint
CREATE INDEX `rooms_guest_status` ON `rooms` (`guest`,`status`);--> statement-breakpoint
CREATE TABLE `seasons` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`active` integer DEFAULT 1 NOT NULL,
	`winner` text,
	`created` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `tournaments` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`track` text NOT NULL,
	`starts` integer NOT NULL,
	`max` integer NOT NULL,
	`rules` text NOT NULL,
	`status` text DEFAULT 'open' NOT NULL,
	`data` text DEFAULT '{}' NOT NULL,
	`rev` integer DEFAULT 0 NOT NULL,
	`winner` text,
	`created` integer NOT NULL
);
