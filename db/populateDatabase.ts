import fs from "fs";
import path from "path";
import { createNewEntry, deleteEntryById, getAllEntries } from "./entries.ts"; // from db utility file 'files.ts'

const folderPath = "./db/audio";

// get audio files from the folder
function getAudioFiles(dir: string): { filePath: string; year: string }[] {
	const entries = fs.readdirSync(dir, { withFileTypes: true });
	const files: { filePath: string; year: string }[] = [];

	for (const entry of entries) {
		const fullPath = path.join(dir, entry.name);

		// if the entry is a file
		if (entry.isFile()) {
			const ext = path.extname(entry.name).toLowerCase();
			if ([".mp3"].includes(ext)) {
				// extract the date from the filename (YYMMDD)
				const match = entry.name.match(/^(\d{6})/);
				if (match) {
					// convert YY to 20YY
					const year = "20" + match[1].substring(0, 2);
					files.push({
						filePath: fullPath.replace("./db/audio", "../../db/audio"),
						year,
					});
				} else {
					console.error("Unexpected file name format: " + entry.name);
				}
			}
		}
	}

	return files;
}

// populate the database with the files from getAudioFiles()
async function populateDatabase() {
	try {
		const audioFiles = getAudioFiles(folderPath);
		const existingEntries = await getAllEntries();
		const existingFilePaths = new Set(existingEntries.map((entry) => entry.filePath));
		const processedFiles = new Set<string>();

		// for each of the files
		for (const { filePath, year } of audioFiles) {
			processedFiles.add(filePath);

			// if it is already present
			if (existingFilePaths.has(filePath)) {
				console.log("already in database");
				continue;
			}

			// get file info for db
			const fileName = path.parse(filePath).name;
			const data = fileName.split(" --- ");
			if (data.length === 2) {
				const [rawDate, title] = data;
				const displayDate = getDisplayDate(rawDate);
				const sortDate = getSortDate(rawDate);

				// write to db
				try {
					createNewEntry(year, sortDate, displayDate, title, filePath);
					console.log(`Inserted: ${fileName} (Year: ${year})`);
				} catch (err) {
					console.error(`Error inserting ${fileName}:`, err);
				}
			} else {
				console.error("Unexpected file name format: " + filePath);
			}
		}

		// if entry with same exact info is already in database then skip it
		for (const entry of existingEntries) {
			if (!processedFiles.has(entry.filePath)) {
				try {
					await deleteEntryById(entry.id);
					console.log(`Deleted: ${entry.filePath}`);
				} catch (err) {
					console.error(`Error deleting ${entry.filePath}:`, err);
				}
			}
		}
	} catch (err) {
		console.error("Error reading directory:", err);
	}
}

// format date for display
function getDisplayDate(date: string): string {
	const monthNum = parseInt(date.substring(2, 4), 10);
	const dayNum = date.substring(4, 6);

	const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
	const monthName = months[monthNum - 1];

	return `${monthName} ${dayNum}`;
}

// return ISO 8601 date
function getSortDate(date: string): string {
	const year = "20" + date.substring(0, 2);
	const monthNum = date.substring(2, 4);
	const dayNum = date.substring(4, 6);

	return `${year}-${monthNum}-${dayNum}`;
}

populateDatabase().then(() => {
	console.log("Database population complete");
});
