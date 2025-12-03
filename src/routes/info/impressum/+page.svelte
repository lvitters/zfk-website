<script lang="ts">
	let { data } = $props();
</script>

<div class="mt-4 ml-7 space-y-4 text-xl">
	{#if data.impressum}
		{@html data.impressum.text}
	{/if}
</div>
