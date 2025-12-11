<script lang="ts">
	let { years, year: selectedYear, selectYear } = $props();
</script>

<div class="flex flex-wrap w-full gap-4 text-sm md:text-xl lg:text-2xl text-glow-white items-center">
	{#each years || [] as year}
		<button
			class="cursor-pointer whitespace-nowrap px-2 py-1 transition-colors hover:bg-[var(--text-color)] hover:text-[var(--bg-color)] {year === selectedYear ? 'bg-[var(--text-color)] text-[var(--bg-color)]' : ''}"
			onclick={() => selectYear(year)}>
			{year}
		</button>
	{/each}
</div>
