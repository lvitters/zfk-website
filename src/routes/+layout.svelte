<script>
	let { children } = $props();
	import "../app.css";
</script>

<div class="w-full min-h-screen bg-[var(--bg-color)]">
	{@render children()}
</div>