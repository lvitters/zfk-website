<script lang="ts">
	let { years, year: selectedYear, selectYear } = $props();
</script>

<div class="flex flex-wrap w-full gap-4 text-sm md:text-xl lg:text-2xl text-glow-white items-center">
	{#each years || [] as year}
		<button
			class="cursor-pointer whitespace-nowrap px-2 py-1 transition-colors hover:bg-gray-700 hover:text-white {year === selectedYear ? 'bg-gray-700 text-white' : ''}"
			onclick={() => selectYear(year)}>
			{year}
		</button>
	{/each}
</div>
