<script>
	let { children } = $props();
	import "../app.css";
	import Footer from "$lib/components/Footer.svelte";
</script>

<div class="flex min-h-screen w-full flex-col bg-[var(--bg-color)]">
	<main class="flex-grow">
		{@render children()}
	</main>
	<Footer />
</div>
