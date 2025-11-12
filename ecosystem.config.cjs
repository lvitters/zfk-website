require("dotenv").config();

if (!process.env.PM2_NAME) {
	console.error("⚠️  Missing NAME in .env");
	process.exit();
}

if (!process.env.PM2_PORT) {
	console.error("⚠️  Missing PORT in .env");
	process.exit();
}

if (!process.env.ORIGIN) console.error("⚠️  Missing ORIGIN in .env");
if (!process.env.HOST) console.error("⚠️  Missing HOST in .env");
if (!process.env.PORT) console.error("⚠️  Missing PORT in .env");
if (!process.env.JWT_SECRET) console.error("⚠️  Missing JWT_SECRET in .env");
if (!process.env.DB_URL) console.error("⚠️  Missing DB_URL in .env");

module.exports = {
	apps: [
		{
			name: process.env.PM2_NAME,
			port: process.env.PM2_PORT,
			script: "./build/index.js",
			watch: true,
			env: {
				NODE_ENV: "production", // Set Node environment to production
				ORIGIN: process.env.ORIGIN, // Pass the correct HTTPS origin
				HOST: process.env.HOST, // Pass host for SvelteKit adapter
				PORT: process.env.PORT, // Pass port for SvelteKit adapter
				JWT_SECRET: process.env.JWT_SECRET, // Pass JWT secret
				DB_URL: process.env.DB_URL, // Pass DB URL
				BODY_SIZE_LIMIT: process.env.BODY_SIZE_LIMIT, // Pass body size limit
				// Add any other env vars your app needs from .env
			},
		},
	],
};
