import { kql } from "$lib/server/kirby";
import type { PageServerLoad } from "./$types";

interface Impressum {
	title: string;
	text: string;
}

export const load: PageServerLoad = async ({ fetch }) => {
	const impressum = await kql<Impressum>(
		{
			query: "page('impressum')",
			select: {
				title: true,
				text: "page.text.kirbytext",
			},
		},
		fetch,
	);

	return {
		impressum,
	};
};
