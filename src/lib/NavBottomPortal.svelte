<script lang="ts">
	import { setNavBottom } from './layoutState.svelte';
	import { onDestroy } from 'svelte';

	let { children } = $props();

	// Effect to update the content whenever the children snippet changes (e.g. state updates)
	$effect(() => {
		setNavBottom(children);
	});

	onDestroy(() => {
		setNavBottom(null);
	});
</script>