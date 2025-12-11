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
    let programmYear = $state<number | undefined>();
    let aufnahmenYear = $state<string | undefined>();

	function toggleSection(section: string) {
		if (expandedSection === section) {
			expandedSection = null;
		} else {
			expandedSection = section;
		}
	}
</script>

<div class="flex min-h-screen w-full flex-col">
	<!-- Row 1 & 2: Player (Logo + Controls) -->
	<div class="sticky top-0 z-50 w-full bg-[var(--bg-color)]">
		<AudioPlayer {audioFiles} />
	</div>

	<!-- Row 3: programm -->
	<div class="group relative w-full border-b-2 border-[var(--text-color)]">
		<button
			class="relative z-20 flex w-full cursor-pointer items-center justify-between p-6 text-left text-3xl font-bold uppercase transition-colors duration-300 md:p-8 md:text-5xl lg:px-16 {expandedSection ===
			'programm'
				? 'bg-[var(--text-color)] text-[var(--bg-color)]'
				: 'bg-[var(--bg-color)] hover:bg-[var(--text-color)] hover:text-[var(--bg-color)]'}"
			onclick={() => toggleSection("programm")}>
			Programm
		</button>

		{#if expandedSection === "programm"}
			<div class="relative z-20 border-t-2 border-[var(--text-color)] bg-[var(--bg-color)]" transition:slide>
				<Programm {events} bind:selectedYear={programmYear} />
			</div>
		{/if}
	</div>

	<!-- Row 4: Aufnahmen -->
	<div class="relative w-full border-b-2 border-[var(--text-color)]">
		<button
			class="flex w-full cursor-pointer items-center justify-between p-6 text-left text-3xl font-bold uppercase transition-colors md:p-8 md:text-5xl lg:px-16 {expandedSection ===
			'aufnahmen'
				? 'bg-[var(--text-color)] text-[var(--bg-color)]'
				: 'bg-[var(--bg-color)] hover:bg-[var(--text-color)] hover:text-[var(--bg-color)]'}"
			onclick={() => toggleSection("aufnahmen")}>
			Aufnahmen
		</button>
		{#if expandedSection === "aufnahmen"}
			<div class="border-t-2 border-[var(--text-color)] bg-[var(--bg-color)]" transition:slide>
				<Aufnahmen {audioFiles} bind:selectedYear={aufnahmenYear} />
			</div>
		{/if}
	</div>

	<!-- Row 5: Club -->
	<div class="relative w-full border-b-2 border-[var(--text-color)]">
		<button
			class="flex w-full cursor-pointer items-center justify-between p-6 text-left text-3xl font-bold uppercase transition-colors md:p-8 md:text-5xl lg:px-16 {expandedSection ===
			'club'
				? 'bg-[var(--text-color)] text-[var(--bg-color)]'
				: 'bg-[var(--bg-color)] hover:bg-[var(--text-color)] hover:text-[var(--bg-color)]'}"
			onclick={() => toggleSection("club")}>
			Club
		</button>
		{#if expandedSection === "club"}
			<div class="border-t-2 border-[var(--text-color)] bg-[var(--bg-color)]" transition:slide>
				<Club page={clubPage} />
			</div>
		{/if}
	</div>

	<!-- Row 6: Info -->
	<div class="relative w-full border-b-2 border-[var(--text-color)]">
		<button
			class="flex w-full cursor-pointer items-center justify-between p-6 text-left text-3xl font-bold uppercase transition-colors md:p-8 md:text-5xl lg:px-16 {expandedSection ===
			'info'
				? 'bg-[var(--text-color)] text-[var(--bg-color)]'
				: 'bg-[var(--bg-color)] hover:bg-[var(--text-color)] hover:text-[var(--bg-color)]'}"
			onclick={() => toggleSection("info")}>
			Info
		</button>
		{#if expandedSection === "info"}
			<div class="border-t-2 border-[var(--text-color)] bg-[var(--bg-color)]" transition:slide>
				<Info {infoPages} />
			</div>
		{/if}
	</div>
</div>
