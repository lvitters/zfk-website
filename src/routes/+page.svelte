<!-- Copyright © 2025 Lucca Vitters. All rights reserved -->

<script lang="ts">
	import YearSelect from "./yearSelect.svelte";
	import AudioPlayer from "./audioPlayer.svelte";
	import Header from "./header.svelte";
	import "$lib/css/fonts.css";

	let { data } = $props();
	const { audioFiles } = data;

	// extract unique years and sort them in descending order
	const years = Array.from(new Set(audioFiles.map((file) => file.year))).sort((a, b) => Number(a) - Number(b));

	// get the current year
	const currentYear = new Date().getFullYear();
	const defaultYear = years.includes(currentYear) ? currentYear : (years[years.length - 1] as number);

	// apply to selectedYear
	let selectedYear = $state<number>(defaultYear);

	let filteredAudioFiles = $state([]);

	$effect(() => {
		filteredAudioFiles = audioFiles.filter((file) => file.year === selectedYear);
	});

	function selectYear(year: number) {
		selectedYear = year;
	}
</script>

<Header></Header>

<YearSelect {years} year={selectedYear} {selectYear} />

<!-- display files -->
<div class="mx-7 mb-10 flex flex-col max-md:mx-4">
	{#each audioFiles as file, index}
		{#if file.year == selectedYear}
			<!-- file row -->
			<div class="flex flex-wrap md:flex-nowrap">
				<!-- date -->
				<div class="flex items-center justify-center p-4 whitespace-nowrap md:w-30 md:min-w-30">
					{file.displayDate}
				</div>
				<!-- title -->
				<div class="flex w-full items-center p-4 md:w-auto md:min-w-min">
					{file.title}
				</div>
				<!-- player -->
				<AudioPlayer src={file.filePath} />
			</div>
		{/if}
	{/each}
</div>
