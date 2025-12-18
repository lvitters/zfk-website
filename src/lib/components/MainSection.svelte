<script lang="ts">
	let { page } = $props();
</script>

<!-- main content section displaying html text from cms -->
<div class="kirby-content w-full bg-[var(--bg-color)] p-4 text-base leading-relaxed md:px-6 md:text-lg">
	<!-- eslint-disable-next-line svelte/no-at-html-tags -->
	{@html page.text}
</div>
