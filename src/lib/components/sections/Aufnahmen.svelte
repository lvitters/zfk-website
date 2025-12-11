<script lang="ts">
	import YearSelect from "$lib/components/yearSelect.svelte";
	import "$lib/css/fonts.css";
	import { currentTrack } from "$lib/playerStore";
	import type { Track } from "$lib/types";
	import { getNavHeight } from "$lib/layoutState.svelte";
	import { onMount } from "svelte";

	let { audioFiles, selectedYear = $bindable() }: { audioFiles: Track[], selectedYear?: string } = $props();

	// extract unique years and sort them in descending order
	const years = Array.from(new Set(audioFiles.map((file) => file.year))).sort((a, b) => Number(b) - Number(a));

    $effect(() => {
        if (!selectedYear && years.length > 0) {
            selectedYear = years[0];
        }
    });

    let filteredAudioFiles = $derived(audioFiles.filter((file: any) => file.year === selectedYear));

	// eventRefs and addRef for scrolling
	let eventRefs = new Map<string, HTMLElement>();

	function addRef(node: HTMLElement, id: string) {
		eventRefs.set(id, node);
		return {
			destroy() {
				eventRefs.delete(id);
			},
		};
	}

	const scrollOffset = 20; // define a small gap in pixels

	function scrollToElement(el: HTMLElement) {
		const container = document.getElementById("main-content-scroll-container");

		if (container && window.innerWidth >= 1024) {
			// Desktop scrolling via container
			const containerRect = container.getBoundingClientRect();
			const elRect = el.getBoundingClientRect();
			const relativeTop = elRect.top - containerRect.top;
			const targetScroll = container.scrollTop + relativeTop - scrollOffset;

			container.scrollTo({ top: targetScroll, behavior: "smooth" });
		} else {
			// Mobile scrolling via window
			const y = el.getBoundingClientRect().top + window.scrollY - scrollOffset - 100;
			window.scrollTo({ top: y, behavior: "smooth" });
		}
	}

	function selectYear(year: string) {
		selectedYear = year; 
        // No scrolling needed
	}

	function selectTrack(track: Track) {
		currentTrack.set(track);
	}

	let bottomPadding = $state(128);

	let trackClasses = $derived((file: Track) => {
		let baseClasses = "flex cursor-pointer flex-col p-4 text-left mb-4 relative duration-100";
		let borderStyle = "border-2 border-black"; // Common border properties

		const isSelected = file.id === $currentTrack?.id;

		if (isSelected) {
			borderStyle += " border-dotted"; // Selected is always dotted
		} else {
			borderStyle += " border-solid hover:border-dotted"; // Not selected, default solid, dotted on hover
		}

		return `${baseClasses} ${borderStyle}`;
	});

	onMount(() => {
		const updatePadding = () => {
			if (window.innerWidth >= 1024) {
				bottomPadding = window.innerHeight;
			} else {
				bottomPadding = 128;
			}
		};

		updatePadding();
		window.addEventListener("resize", updatePadding);

		return () => {
			window.removeEventListener("resize", updatePadding);
		};
	});
</script>

<!-- display files -->
<div class="flex w-full flex-col bg-[var(--bg-color)]">
    <!-- Year Select -->
    <div class="w-full border-b-2 border-[var(--text-color)] p-4 lg:px-16">
	    <YearSelect {years} year={selectedYear} {selectYear} />
    </div>

	{#each filteredAudioFiles as file, index}
		<!-- file row -->
		<button 
            class="flex cursor-pointer flex-col gap-1 p-4 lg:px-16 text-left w-full relative duration-100 border-b-2 border-[var(--text-color)] last:border-b-0 {file.id === $currentTrack?.id ? 'bg-[var(--text-color)] text-[var(--bg-color)]' : 'hover:bg-[var(--text-color)] hover:text-[var(--bg-color)]'}" 
            onclick={() => selectTrack(file)} 
            use:addRef={file.id}>
			<!-- date -->
			<div class="opacity-70 shrink-0 text-sm">
				{file.sortDate.split("-")[2]}.{file.sortDate.split("-")[1]}.
			</div>
			<!-- title -->
			<div class="text-lg font-medium md:text-2xl">
				{file.title}
			</div>
		</button>
	{/each}
</div>
