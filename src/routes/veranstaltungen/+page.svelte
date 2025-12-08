<script lang="ts">
	import { fade, slide } from "svelte/transition";
	import YearSelect from "../yearSelect.svelte";
	import "$lib/css/fonts.css";

	let { data } = $props();

	let events = $derived(
		data.events.map((e) => {
			let displayDate = e.formattedDate;
			if (e.formattedEndDate && e.formattedEndDate !== e.formattedDate) {
				displayDate += ` - ${e.formattedEndDate}`;
			}
			if (e.time) {
				// Format time to ensure HH:MM (strip seconds if present)
				const timeParts = e.time.split(":");
				const formattedTime = timeParts.length >= 2 ? `${timeParts[0]}:${timeParts[1]}` : e.time;
				displayDate += ` // ${formattedTime}`;
			}
			return {
				...e,
				year: new Date(e.date).getFullYear(),
				displayDate,
				fullText: e.text,
			};
		}),
	);

	// extract unique years and sort them in ascending order
	let years = $derived(Array.from(new Set(events.map((event) => event.year))).sort((a, b) => Number(a) - Number(b)));

	// get the current year
	const currentYear = new Date().getFullYear();

	let selectedYear = $state<number>(currentYear);
	let initialized = false;

	$effect(() => {
		if (!initialized && years.length > 0) {
			selectedYear = years.includes(currentYear) ? currentYear : (years[years.length - 1] as number);
			initialized = true;
		}
	});

	let filteredEvents = $derived(events.filter((event) => event.year === selectedYear));

	function selectYear(year: number) {
		selectedYear = year;
	}

	let expandedEvents = $state(new Set<string>());

	function openEvent(id: string) {
		if (!expandedEvents.has(id)) {
			const newSet = new Set(expandedEvents);
			newSet.add(id);
			expandedEvents = newSet;
		}
	}

	function closeEvent(id: string, e: Event) {
		e.stopPropagation();
		const newSet = new Set(expandedEvents);
		newSet.delete(id);
		expandedEvents = newSet;
	}
</script>

<div class="flex w-full justify-start">
	<YearSelect {years} year={selectedYear} {selectYear} />
</div>

<div class="mt-4 flex w-full flex-col gap-2 pb-24">
	{#each filteredEvents as event}
		<div
			class="glow-box relative my-2 flex w-full flex-col gap-2 overflow-hidden rounded-3xl p-4 text-left focus:outline-none
            {expandedEvents.has(event.id) ? 'cursor-default' : 'cursor-pointer'}"
			role="button"
			tabindex="0"
			onclick={() => openEvent(event.id)}
			onkeydown={(e) => (e.key === "Enter" || e.key === " ") && openEvent(event.id)}>
			
			{#if event.thumbnailUrl}
				<div 
					class="absolute inset-0 -z-10 bg-cover bg-center opacity-60"
					style="background-image: url('{event.thumbnailUrl}');">
				</div>
			{/if}

			<div class="flex items-stretch justify-between gap-4">
				<div class="flex flex-1 flex-col overflow-hidden">
					<div class="flex w-fit flex-col bg-black/20 dark:bg-white/20 p-2 rounded-md backdrop-blur-md border border-[var(--text-color)]/10">
						<!-- date -->
						<div class="text-xs md:text-sm">{event.displayDate}</div>

						<!-- title -->
						<h2 class="mb-2 text-lg font-medium md:text-2xl">{event.title}</h2>
					</div>
				</div>
				
				{#if expandedEvents.has(event.id)}
					<button
						onclick={(e) => closeEvent(event.id, e)}
						class="flex h-12 w-24 cursor-pointer items-center justify-center rounded-lg hover:bg-black/5 dark:hover:bg-white/10"
						aria-label="Close details">
						<svg
							xmlns="http://www.w3.org/2000/svg"
							fill="none"
							viewBox="0 0 24 24"
							stroke-width="1.5"
							stroke="currentColor"
							class="h-6 w-6">
							<path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
						</svg>
					</button>
				{/if}
			</div>

			<!-- content -->
			{#if expandedEvents.has(event.id)}
				<div
					transition:slide={{ duration: 300 }}
					class="kirby-content w-full text-sm leading-relaxed md:text-lg">
					<div in:fade={{ duration: 200 }}>
						<!-- eslint-disable-next-line svelte/no-at-html-tags -->
						{@html event.fullText}
					</div>
				</div>
			{/if}
		</div>
	{/each}
</div>
