<script lang="ts">
	import AudioPlayer from "$lib/components/audioPlayer.svelte";
	import Programm from "$lib/components/sections/Programm.svelte";
	import Aufnahmen from "$lib/components/sections/Aufnahmen.svelte";
	import Club from "$lib/components/sections/Club.svelte";
	import Info from "$lib/components/sections/Info.svelte";
	import SpinningLogo from "$lib/components/SpinningLogo.svelte"; // Import the new component
	import "$lib/css/fonts.css";
	import { slide } from "svelte/transition";
	import { isPlaying, currentTrack } from "$lib/playerStore"; // Import currentTrack and isPlaying to use togglePlayback

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

	function randomizeAndPlay() {
		if (audioFiles && audioFiles.length > 0) {
			const randomIndex = Math.floor(Math.random() * audioFiles.length);
			const randomTrack = audioFiles[randomIndex];
			currentTrack.set(randomTrack);
		}
	}

	function togglePlayback(event: MouseEvent) {
		event.stopPropagation(); // Prevent seeking when clicking play button
		if ($currentTrack) {
			isPlaying.update((p) => !p);
		} else {
			randomizeAndPlay();
			isPlaying.set(true);
		}
	}
</script>

<div class="flex min-h-screen w-full flex-col px-2 md:px-6 lg:px-8">
	<!-- Independent Spinning Logo -->
	<div
		class="flex h-[150px] w-full items-center justify-start border-b-2 border-[var(--text-color)] bg-[var(--bg-color)] p-4">
		<button
			onclick={togglePlayback}
			class="flex h-[100px] w-[100px] items-center justify-center focus:outline-none"
			aria-label={$isPlaying ? "Pause" : "Play"}>
			<SpinningLogo />
		</button>
	</div>

	<!-- Row 1 & 2: Player (Controls only) -->
	<div class="top-0 z-50 w-full bg-[var(--bg-color)]">
		<AudioPlayer {audioFiles} />
	</div>

	<!-- Row 3: programm -->
	<div class="group relative w-full border-b-2 border-[var(--text-color)]">
		<button
			class="relative z-20 flex w-full cursor-pointer items-center justify-between p-4 text-left text-4xl font-bold uppercase transition-colors duration-300 md:text-8xl lg:text-9xl {expandedSection ===
			'programm'
				? 'bg-[var(--text-color)] text-[var(--bg-color)]'
				: 'bg-[var(--bg-color)] hover:bg-[var(--text-color)] hover:text-[var(--bg-color)]'}"
			onclick={() => toggleSection("programm")}>
			Programm
		</button>

		{#if expandedSection === "programm"}
			<div class="border-t-2 border-[var(--text-color)] bg-[var(--bg-color)]" transition:slide>
				<Programm {events} bind:selectedYear={programmYear} />
			</div>
		{/if}
	</div>

	<div class="relative w-full border-b-2 border-[var(--text-color)]">
		<button
			class="relative z-20 flex w-full cursor-pointer items-center justify-between p-4 text-left text-4xl font-bold uppercase transition-colors duration-300 md:text-8xl lg:text-9xl {expandedSection ===
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
			class="relative z-20 flex w-full cursor-pointer items-center justify-between p-4 text-left text-4xl font-bold uppercase transition-colors duration-300 md:text-8xl lg:text-9xl {expandedSection ===
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
			class="relative z-20 flex w-full cursor-pointer items-center justify-between p-4 text-left text-4xl font-bold uppercase transition-colors duration-300 md:text-8xl lg:text-9xl {expandedSection ===
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
