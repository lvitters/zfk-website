import { kql } from "$lib/server/kirby";
import type { PageServerLoad } from "./$types";

// Define exactly what fields we expect from Kirby
interface Event {
	title: string;
	date: string;
	time: string;
	endDate: string;
	text: string;
	formattedDate: string;
	formattedEndDate: string;
	url: string;
	id: string;
	thumbnailUrl?: string;
}

export const load: PageServerLoad = async ({ fetch }) => {
	// We pass <Event[]> to the kql function to say "We expect an array of Events"
	const events = await kql<Event[]>(
		{
			query: "page('veranstaltungen').children.listed.sortBy('date', 'desc')",
			select: {
				title: true,
				date: true,
				time: true,
				endDate: true,
				text: "page.text.toBlocks.toHtml",
				formattedDate: "page.date.toDate('d.m')",
				formattedEndDate: "page.endDate.toDate('d.m')",
				url: true,
				id: "page.id",
				thumbnailUrl: "page.text.toBlocks.filterBy('type', 'image').first.content.image.toFiles.first.url ?? page.images.first.url" // Prioritize image from content blocks, fallback to first file
			},
		},
		fetch,
	);

	return {
		// If kql fails (returns null), fallback to an empty array
		events: events ?? [],
	};
};
