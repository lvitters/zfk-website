//https://fullstacksveltekit.com/blog/sveltekit-sqlite-drizzle

import { randomUUID } from "crypto";
import { sqliteTable, text } from "drizzle-orm/sqlite-core";

// create database schema
const audioFiles = sqliteTable("audioFiles", {
	id: text("id")
		.primaryKey()
		.notNull()
		.$defaultFn(() => randomUUID()),
	year: text("year").notNull(),
	sortDate: text("sortDate")
		.notNull()
		.$defaultFn(() => new Date().toISOString().slice(0, 19).replace("T", " ")),
	displayDate: text("displayDate").notNull(),
	title: text("title").notNull(),
	filePath: text("filePath").notNull(),
});

type InsertEntryParams = typeof audioFiles.$inferInsert;

export { audioFiles, type InsertEntryParams };
