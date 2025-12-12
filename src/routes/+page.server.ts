import { kql } from "$lib/server/kirby";
import type { PageServerLoad } from "./$types";
import type { ProgrammEvent, KirbyImage, Track } from "$lib/types";

export const load: PageServerLoad = async ({ fetch }) => {
	// 1. Veranstaltungen Query
	const eventsQuery = {
		query: "page('veranstaltungen').children.listed.sortBy('date', 'desc')",
		select: {
			title: true,
			date: true,
			time: true,
			endDate: true,
			text: "page.text.toBlocks.toHtml",
			formattedDate: "page.date.toDate('d.m.Y')",
			formattedEndDate: "page.endDate.toDate('d.m.Y')",
			url: true,
			id: "page.id",
			images: {
				query: "page.images",
				select: { url: true, uuid: true },
			},
			imageBlocks: {
				query: "page.text.toBlocks.filterBy('type', 'image')",
				select: { content: true },
			},
			videos: {
				query: "page.videos.limit(1)",
				select: { url: true, mime: true },
			},
		},
	};

	// 2. Aufnahmen Query
	const audioQuery = {
		query: "page('aufnahmen').files.sortBy('datum', 'desc')",
		select: {
			id: "file.uuid",
			filename: "file.filename",
			title: "file.titel.value",
			year: "file.datum.toDate('Y')",
			displayDate: "file.datum.toDate('d.m.Y')",
			sortDate: "file.datum.toDate('Y-m-d')",
			filePath: "file.url",
		},
	};

	// 3. Generic Pages Query (for all other sections)
	const pagesQuery = {
		query: "site.children.listed",
		select: {
			id: true,
			title: true,
			slug: true,
			text: "page.text.toBlocks.toHtml",
			children: {
				query: "page.children.listed",
				select: {
					id: true,
					title: true,
					slug: true,
					text: "page.text.toBlocks.toHtml",
				},
			},
		},
	};

	const [eventsResult, audioResult, pagesResult] = await Promise.all([
		kql(eventsQuery, fetch),
		kql(audioQuery, fetch),
		kql(pagesQuery, fetch),
	]);
	console.log("Audio Result:", audioResult);

	// Process Events
	const events = ((eventsResult || []) as ProgrammEvent[]).map((event: ProgrammEvent) => {
		let thumbnailUrl = event.images?.[0]?.url;

		if (Array.isArray(event.imageBlocks) && event.imageBlocks.length > 0) {
			const firstImageBlock = event.imageBlocks[0];
			if (
				firstImageBlock &&
				firstImageBlock.content &&
				firstImageBlock.content.image &&
				firstImageBlock.content.image.length > 0
			) {
				const fileId = firstImageBlock.content.image[0];
				const matchingImage = event.images?.find(
					(img: KirbyImage) => fileId.includes(img.uuid) || img.uuid === fileId,
				);
				if (matchingImage) {
					thumbnailUrl = matchingImage.url;
				}
			}
		}

		return {
			...event,
			thumbnailUrl: thumbnailUrl ? new URL(thumbnailUrl).pathname : undefined,
			videoUrl: event.videos?.[0]?.url ? new URL(event.videos[0].url).pathname : undefined,
			videoMime: event.videos?.[0]?.mime,
		};
	});

	// Process Audio
	const audioFiles = ((audioResult === null ? [] : audioResult) as Track[])
		.filter((file: Track) => file.title && file.displayDate)
		.map((file: Track) => {
			if (file.filePath && file.filePath.includes("/media/")) {
				const relativePath = file.filePath.substring(file.filePath.indexOf("media/"));
				file.filePath = `/api/stream?file=${relativePath}`;
			}
			return file;
		});

	// Process Dynamic Sections
	const dynamicSections = ((pagesResult || []) as any[])
		.filter((page: any) => page.slug !== "veranstaltungen" && page.slug !== "aufnahmen")
		.map((page: any) => {
			const hasChildren = page.children && page.children.length > 0;
			return {
				id: page.id,
				title: page.title,
				slug: page.slug,
				type: hasChildren ? "headerSection" : "mainSection",
				content: hasChildren ? page.children : { text: page.text },
			};
		});

	return {
		events,
		audioFiles,
		dynamicSections,
	};
};
