<script lang="ts">
	import { fade, fly } from 'svelte/transition';

	interface GalleryImage {
		src: string;
		alt: string;
		width?: number;
		height?: number;
	}

	let { images = [] } = $props<{ images: GalleryImage[] }>();
	let currentIndex = $state(0);

	function next() {
		currentIndex = (currentIndex + 1) % images.length;
	}

	function prev() {
		currentIndex = (currentIndex - 1 + images.length) % images.length;
	}
</script>

<div class="relative w-full aspect-video md:aspect-[16/9] lg:aspect-[21/9] bg-black/5 group">
	{#each [images[currentIndex]] as image (currentIndex)}
		<img
			src={image.src}
			alt={image.alt}
			class="absolute inset-0 w-full h-full object-contain"
			in:fade={{ duration: 300 }}
            out:fade={{ duration: 300 }}
		/>
	{/each}

	{#if images.length > 1}
		<!-- Controls -->
		<button
			class="absolute left-2 top-1/2 -translate-y-1/2 bg-[var(--bg-color)] text-[var(--text-color)] p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 border border-[var(--text-color)] hover:invert"
			onclick={prev}
			aria-label="Previous image"
		>
			&larr;
		</button>
		<button
			class="absolute right-2 top-1/2 -translate-y-1/2 bg-[var(--bg-color)] text-[var(--text-color)] p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 border border-[var(--text-color)] hover:invert"
			onclick={next}
			aria-label="Next image"
		>
			&rarr;
		</button>

        <!-- Indicators -->
        <div class="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-2">
            {#each images as _, i}
                <div 
                    class="w-2 h-2 rounded-full border border-[var(--text-color)] transition-colors {i === currentIndex ? 'bg-[var(--text-color)]' : 'bg-[var(--bg-color)]'}"
                ></div>
            {/each}
        </div>
	{/if}
</div>
