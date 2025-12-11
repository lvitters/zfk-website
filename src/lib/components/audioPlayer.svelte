<script lang="ts">
	import { currentTrack, isPlaying } from "$lib/playerStore";
	import type { Track } from "$lib/types";

    let { audioFiles = [] } = $props();

	let audio: HTMLAudioElement | undefined = $state();
	let currentTime = $state(0);
	let duration = $state(0);
	let src = $state("");

	let isDragging = $state(false);
	let progressBar: HTMLDivElement | undefined = $state();
	let barWidth = $state(0);

	let titleElement: HTMLDivElement | undefined = $state();
	let isOverflowing = $state(false);

	function checkOverflow() {
		if (!titleElement) return;
		const parent = titleElement.parentElement;
		if (!parent) return;

		const scrollWidth = titleElement.scrollWidth;
		const clientWidth = parent.getBoundingClientRect().width;

		if (scrollWidth > clientWidth) {
			isOverflowing = true;
			const offset = clientWidth - scrollWidth;
			titleElement.style.setProperty("--scroll-offset", `${offset}px`);
		} else {
			isOverflowing = false;
			titleElement.style.removeProperty("--scroll-offset");
		}
	}

	$effect(() => {
		const ro = new ResizeObserver(() => {
			if (titleElement) checkOverflow();
			if (progressBar) barWidth = progressBar.getBoundingClientRect().width;
		});

		if (titleElement) ro.observe(titleElement);
		if (titleElement?.parentElement) ro.observe(titleElement.parentElement);
		if (progressBar) ro.observe(progressBar);

		return () => ro.disconnect();
	});

	// Sync $isPlaying store to audio element state
	$effect(() => {
		if (!audio) return;
		if ($isPlaying && audio.paused) {
			audio.play().catch((e) => console.error("Play failed:", e));
		} else if (!$isPlaying && !audio.paused) {
			audio.pause();
		}
	});

	currentTrack.subscribe((track: Track | null) => {
		if (track) {
			src = track.filePath;
			// reset state
			currentTime = 0;
			duration = 0;
		}
	});

	// Autoplay when src changes or audio element becomes available
	$effect(() => {
		if (audio && src) {
			audio.load();
			audio.play().catch((e) => console.error("Autoplay failed:", e));
			isPlaying.set(true);
		}
	});

    async function randomizeAndPlay() {
		if (audioFiles && audioFiles.length > 0) {
			const randomIndex = Math.floor(Math.random() * audioFiles.length);
			const randomTrack = audioFiles[randomIndex];
			currentTrack.set(randomTrack);
		}
	}

    function togglePlayback(event: MouseEvent) {
        event.stopPropagation(); // Prevent seeking when clicking play button
		if ($currentTrack) {
			isPlaying.update((p) => !p);
		} else {
			randomizeAndPlay();
            isPlaying.set(true);
		}
	}

	function updateTime(clientX: number) {
		if (!progressBar || !duration) return; // Allow seeking even if audio not started (duration might be 0 though)
        
        // If not dragging and no track, maybe ignore?
        if (!$currentTrack) return;

		const rect = progressBar.getBoundingClientRect();
		const x = clientX - rect.left;
        // Adjust for logo width logic? 
        // The bar represents the timeline. The logo position is derived from time.
        // So clicking at X should mean time = (x / width) * duration.
        // We need to map [0, width] to [0, duration].
		const width = rect.width;
		const ratio = Math.max(0, Math.min(1, x / width));
		const newTime = ratio * duration;

        if (audio) audio.currentTime = newTime;
		currentTime = newTime;
	}

	function onDragStart(event: MouseEvent | TouchEvent) {
        if (!$currentTrack) return;

		if (audio && audio.paused) {
			isPlaying.set(true);
		}

		isDragging = true;

		const clientX = "touches" in event ? event.touches[0].clientX : event.clientX;
		updateTime(clientX);

		window.addEventListener("mousemove", onDragMove);
		window.addEventListener("touchmove", onDragMove, { passive: false });
		window.addEventListener("mouseup", onDragEnd);
		window.addEventListener("touchend", onDragEnd);
	}

	function onDragMove(event: MouseEvent | TouchEvent) {
		if (!isDragging) return;
		if (event.cancelable) {
			event.preventDefault();
		}

		const clientX = "touches" in event ? event.touches[0].clientX : event.clientX;
		updateTime(clientX);
	}

	function onDragEnd() {
		isDragging = false;
		window.removeEventListener("mousemove", onDragMove);
		window.removeEventListener("touchmove", onDragMove);
		window.removeEventListener("mouseup", onDragEnd);
		window.removeEventListener("touchend", onDragEnd);
	}

	const formatTime = (time: number) => {
		if (isNaN(time)) return "0:00";
		const hours = Math.floor(time / 3600);
		const minutes = Math.floor((time % 3600) / 60);
		const seconds = Math.floor(time % 60);

		if (hours > 0) {
			return `${hours}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
		}

		return `${minutes}:${String(seconds).padStart(2, "0")}`;
	};
</script>

<div class="flex w-full flex-col">
    {#if $currentTrack}
		<audio
			bind:this={audio}
			bind:duration
			bind:currentTime
			onplay={() => isPlaying.set(true)}
			onpause={() => isPlaying.set(false)}
			onloadedmetadata={() => (duration = (audio as HTMLAudioElement).duration)}
			{src}
            class="hidden">
		</audio>
    {/if}

    <!-- Row 1: Logo Player Bar -->
    <div 
        class="relative h-[100px] w-full bg-[var(--bg-color)] overflow-hidden cursor-pointer" 
        bind:this={progressBar}
        role="button"
        tabindex="0"
        aria-label="Seek"
        onmousedown={onDragStart}
        ontouchstart={onDragStart}
    >
        <!-- Progress Fill (Line) -->
        <div 
            class="absolute left-0 bottom-0 h-[2px] bg-black pointer-events-none" 
            style="width: calc({duration ? currentTime / duration : 0} * (100% - 100px) + 50px); transition: width 0.1s linear;">
        </div>

        <!-- Logo Playhead -->
        <button
            class="absolute bottom-0 z-10 h-[100px] w-[100px] flex items-center justify-center focus:outline-none group"
            style="left: calc({duration ? currentTime / duration : 0} * (100% - 100px)); transition: left 0.1s linear;"
            onclick={togglePlayback}
        >
            <img
                src="/logo_zfk_transparent.png"
                alt="ZfK Logo"
                class="animate-spin-vinyl image-glow-white h-full w-full object-contain"
                style="animation-play-state: {$isPlaying ? 'running' : 'paused'};" />
            
            <!-- Removed Play/Pause Overlay -->
        </button>
    </div>

    <!-- Row 2: Track Info -->
    {#if $currentTrack}
        <div class="flex w-full items-center justify-between text-left text-xs p-2 lg:px-16 border-t-2 border-black">
            <div class="min-w-0 flex-1 overflow-hidden">
                <div
                    bind:this={titleElement}
                    class="w-max whitespace-nowrap will-change-transform {isOverflowing
                        ? 'animate-scroll-back-forth'
                        : ''}">
                    {$currentTrack.title}
                </div>
            </div>

            <div class="flex w-12 shrink-0 justify-end pl-2" class:md:w-auto={!isOverflowing}>
                <span class="tabular-nums">
                    {formatTime(currentTime)}
                    {#if !isOverflowing}
                        <span class="hidden md:inline-block">/ {formatTime(duration)}</span>
                    {/if}
                </span>
            </div>
        </div>
    {/if}
</div>