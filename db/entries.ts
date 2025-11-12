// https://fullstacksveltekit.com/blog/sveltekit-sqlite-drizzle

import { desc, eq } from "drizzle-orm";
import fs from "fs/promises";
import { db } from "./client";
import { audioFiles } from "./schema";

// write title and file path into database
const createNewEntry = (year: string, sortDate: string, displayDate: string, title: string, filePath: string) => {
	return db.insert(audioFiles).values({ year, sortDate, displayDate, title, filePath }).returning().get();
};

// edit an entry by id
const editEntryById = async (id: string, newTitle: string) => {
	try {
		const result = await db.update(audioFiles).set({ title: newTitle }).where(eq(audioFiles.id, id));
		return result;
	} catch (err) {
		console.error("error updating file", err);
	}
};

// delete entry by ID and remove the file from disk
const deleteEntryById = async (id: string) => {
	try {
		// retrieve the file path from the database
		const entry = await db.select().from(audioFiles).where(eq(audioFiles.id, id)).get();

		if (!entry) {
			console.error(`Entry with ID ${id} not found`);
			return { success: false, error: "Entry not found" };
		}

		// get filePath
		const filePath = entry.filePath;

		// delete the database entry
		await db.delete(audioFiles).where(eq(audioFiles.id, id)).run();

		// delete the file from disk
		await fs.unlink(filePath);
		console.log(`Deleted file: ${filePath}`);

		return { success: true };
	} catch (err) {
		console.error("Error deleting entry:", err);
		return { success: false };
	}
};

// get all entries from certain year
const getEntriesByYear = (year: string) => {
	console.log("Year parameter:", year); // debug the input

	const results = db.select().from(audioFiles).where(eq(audioFiles.year, year)).all();

	console.log("Results:", results); // debug the query results

	return results;
};

// get all entries
const getAllEntries = () => {
	const results = db.select().from(audioFiles).orderBy(audioFiles.sortDate);
	return results;
};

// get all entries
const getAllEntriesDescending = () => {
	const results = db.select().from(audioFiles).orderBy(desc(audioFiles.sortDate));
	return results;
};

export { createNewEntry, deleteEntryById, editEntryById, getAllEntries, getAllEntriesDescending, getEntriesByYear };
