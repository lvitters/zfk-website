<script>
	let { children } = $props();
	import "../app.css";
</script>

<div class="min-h-screen w-full bg-[var(--bg-color)]">
	{@render children()}
</div>
