<script lang="ts">
	import YearSelect from "$lib/components/yearSelect.svelte";
	import "$lib/css/fonts.css";
	import { onMount } from "svelte";
	import DiagonalStrip from "$lib/DiagonalStrip.svelte";
	import { slide } from "svelte/transition";
	import type { ProgrammEvent } from "$lib/types";

	let { events: rawEvents, selectedYear = $bindable() }: { events: ProgrammEvent[] | null; selectedYear?: number } =
		$props();

	// calculate events once
	const events = (rawEvents || []).map((e: ProgrammEvent) => {
		let displayDate = e.formattedDate.split(".").slice(0, 2).join(".");
		let displayTime = "";
		if (e.formattedEndDate && e.formattedEndDate !== e.formattedDate) {
			displayDate += ` - ${e.formattedEndDate.split(".").slice(0, 2).join(".")}`;
		}
		if (e.time) {
			const timeParts = e.time.split(":");
			displayTime = timeParts.length >= 2 ? `${timeParts[0]}:${timeParts[1]}` : e.time;
		}
		return {
			...e,
			year: new Date(e.date).getFullYear(),
			displayDate,
			displayTime,
			fullText: e.text,
		};
	});

	// extract unique years
	const years = Array.from(new Set(events.map((event: ProgrammEvent) => event.year))).sort(
		(a: number, b: number) => Number(b) - Number(a),
	);

	$effect(() => {
		if (!selectedYear && years.length > 0) {
			selectedYear = years[0] as number;
		}
	});

	let filteredEvents = $derived(events.filter((e: ProgrammEvent) => e.year === selectedYear));

	let eventRefs = new Map<string, HTMLElement>();
	function addRef(node: HTMLElement, id: string) {
		eventRefs.set(id, node);
		return {
			destroy() {
				eventRefs.delete(id);
			},
		};
	}

	async function selectYear(year: number) {
		expandedEventId = null;
		selectedYear = year;
		// No scrolling needed as list updates in place
	}

	let expandedEventId = $state<string | null>(null);
	let isEntryHovered = $state<boolean[]>([]);

	onMount(() => {
		isEntryHovered = Array(events.length).fill(false);
	});

	function toggleEvent(id: string) {
		if (expandedEventId === id) {
			expandedEventId = null;
		} else {
			expandedEventId = id;
			// Removed setTimeout and scrollToElement call
		}
	}
</script>

{#snippet previewRow(event: ProgrammEvent, index: number)}
	<!-- preview row -->
	<div class="flex w-full justify-start">
		<button
			class="relative flex w-full cursor-pointer flex-col overflow-hidden p-4 text-left duration-100 focus:outline-none {expandedEventId ===
			event.id
				? 'bg-[var(--text-color)] text-[var(--bg-color)]'
				: 'hover:bg-[var(--text-color)] hover:text-[var(--bg-color)]'}"
			onclick={() => toggleEvent(event.id)}
			onmouseenter={() => (isEntryHovered[index] = true)}
			onmouseleave={() => (isEntryHovered[index] = false)}>
			<!-- Content -->
			<div class="flex w-full flex-col gap-1">
				<div class="shrink-0 opacity-70">
					<span class="text-base md:text-xl">
						{event.displayDate}
					</span>

					{#if event.displayTime}
						<span class="ml-1 text-base md:text-xl">
							{event.displayTime}
						</span>
					{/if}
				</div>

				<h2 class="text-lg font-medium md:text-2xl">
					{event.title}
				</h2>
			</div>

			<!-- diagonal pixel row as bottom border -->
			<div
				class="absolute bottom-0 left-0 right-0 h-[12px] overflow-hidden"
				style="mask-image: linear-gradient(to top, black, transparent); -webkit-mask-image: linear-gradient(to top, black, transparent);">
				{#if event.thumbnailUrl}
					<DiagonalStrip src={event.thumbnailUrl} class="h-full w-full object-fill" />
				{/if}
			</div>
		</button>
	</div>
{/snippet}

{#snippet expandedEventContent(event: ProgrammEvent)}
	<div class="expanded-event-container flex w-full flex-col gap-6 p-4" transition:slide>
		<!-- Event Text -->
		<div class="kirby-content w-full text-base leading-relaxed md:text-lg">
			<!-- eslint-disable-next-line svelte/no-at-html-tags -->
			{@html event.fullText}
		</div>
	</div>
{/snippet}

<div class="flex w-full flex-col bg-[var(--bg-color)]">
	<!-- Year Select Row -->
	<div class="w-full border-b-2 border-[var(--text-color)] p-4">
		<YearSelect {years} year={selectedYear} {selectYear} />
	</div>

	{#each filteredEvents as event, index}
		<div
			class="event-row w-full border-b-2 border-[var(--text-color)] transition-colors last:border-b-0"
			use:addRef={event.id}>
			{@render previewRow(event, index)}
			{#if expandedEventId === event.id}
				{@render expandedEventContent(event)}
			{/if}
		</div>
	{/each}
</div>
