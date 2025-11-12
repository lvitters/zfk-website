//https://fullstacksveltekit.com/blog/sveltekit-sqlite-drizzle

import * as dotenv from "dotenv";
import type { Config } from "drizzle-kit";

dotenv.config();

export default {
	schema: "./db/schema.ts",
	dialect: "sqlite",
	dbCredentials: {
		url: process.env.DB_URL as string,
	},
	out: "./db/migrations",
} satisfies Config;
