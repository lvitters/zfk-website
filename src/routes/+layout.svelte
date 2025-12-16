<script lang="ts">
	let { children } = $props();
	import "../app.css";
	import Footer from "$lib/components/Footer.svelte";
	import Lightbox from "$lib/components/Lightbox.svelte";
	import { setLightboxImage } from "$lib/layoutState.svelte";

	function handleGlobalClick(event: MouseEvent) {
		const target = event.target as HTMLElement;
		// Check if the clicked element is an image and has a src
		if (target.tagName === "IMG" && (target as HTMLImageElement).src) {
			// Check if it's already inside the lightbox to prevent closing/re-opening issues
			// The lightbox container has specific classes we can check for, or just check context
			if (target.closest(".fixed.inset-0.z-\\[100\\]") || target.closest(".fixed.inset-0.z-50")) {
				return;
			}

			event.preventDefault();
			event.stopPropagation();
			setLightboxImage((target as HTMLImageElement).src);
		}
	}
</script>

<svelte:window onclick={handleGlobalClick} />

<div class="flex min-h-screen w-full flex-col bg-[var(--bg-color)]">
	<Lightbox />
	<main class="flex-grow">
		{@render children()}
	</main>
	<Footer />
</div>
