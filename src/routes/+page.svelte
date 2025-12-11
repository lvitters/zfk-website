<script lang="ts">
	import AudioPlayer from "$lib/components/audioPlayer.svelte";
	import Programm from "$lib/components/sections/Programm.svelte";
	import Aufnahmen from "$lib/components/sections/Aufnahmen.svelte";
	import Club from "$lib/components/sections/Club.svelte";
	import Info from "$lib/components/sections/Info.svelte";
	import "$lib/css/fonts.css";
	import { slide } from "svelte/transition";

	let { data } = $props();
	let { events, audioFiles, clubPage, infoPages } = data;

	let expandedSection = $state(null as string | null);

	function toggleSection(section: string) {
		if (expandedSection === section) {
			expandedSection = null;
		} else {
			expandedSection = section;
		}
	}

	// Latest event image for "programm" header background
	let headerImage = events.length > 0 ? events[0].thumbnailUrl : null;
</script>

<div class="flex min-h-screen w-full flex-col">
	<!-- Row 1 & 2: Player (Logo + Controls) -->
	<div class="sticky top-0 z-50 w-full border-b-2 border-black bg-[var(--bg-color)]">
		<AudioPlayer {audioFiles} />
	</div>

	<!-- Row 3: programm -->
	<div class="group relative w-full border-b-2 border-black">
		<button
			class="relative z-20 flex w-full items-center justify-between bg-[var(--bg-color)] p-6 text-left text-3xl font-bold uppercase transition-colors duration-300 hover:bg-gray-700 hover:text-white md:p-8 md:text-5xl lg:px-16"
			onclick={() => toggleSection("programm")}>
			Programm
		</button>

		{#if expandedSection === "programm"}
			<div class="relative z-20 border-t-2 border-black bg-[var(--bg-color)]" transition:slide>
				<Programm {events} />
			</div>
		{/if}
	</div>

	<!-- Row 4: Aufnahmen -->
	<div class="relative w-full border-b-2 border-black">
		<button
			class="flex w-full items-center justify-between bg-[var(--bg-color)] p-6 text-left text-3xl font-bold uppercase transition-colors hover:bg-gray-700 hover:text-white md:p-8 md:text-5xl lg:px-16"
			onclick={() => toggleSection("aufnahmen")}>
			Aufnahmen
		</button>
		{#if expandedSection === "aufnahmen"}
			<div class="border-t-2 border-black bg-[var(--bg-color)]" transition:slide>
				<Aufnahmen {audioFiles} />
			</div>
		{/if}
	</div>

	<!-- Row 5: Club -->
	<div class="relative w-full border-b-2 border-black">
		<button
			class="flex w-full items-center justify-between bg-[var(--bg-color)] p-6 text-left text-3xl font-bold uppercase transition-colors hover:bg-gray-700 hover:text-white md:p-8 md:text-5xl lg:px-16"
			onclick={() => toggleSection("club")}>
			Club
		</button>
		{#if expandedSection === "club"}
			<div class="border-t-2 border-black bg-[var(--bg-color)]" transition:slide>
				<Club page={clubPage} />
			</div>
		{/if}
	</div>

	<!-- Row 6: Info -->
	<div class="relative w-full border-b-2 border-black">
		<button
			class="flex w-full items-center justify-between bg-[var(--bg-color)] p-6 text-left text-3xl font-bold uppercase transition-colors hover:bg-gray-700 hover:text-white md:p-8 md:text-5xl lg:px-16"
			onclick={() => toggleSection("info")}>
			Info
		</button>
		{#if expandedSection === "info"}
			<div class="border-t-2 border-black bg-[var(--bg-color)]" transition:slide>
				<Info {infoPages} />
			</div>
		{/if}
	</div>
</div>
