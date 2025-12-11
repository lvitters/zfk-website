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

	let isHoveringProgressBar = $state(false);
	let hoverX = $state(0);

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
		if (!progressBar || !duration) return;
		if (!$currentTrack) return;

		const rect = progressBar.getBoundingClientRect();
		const x = clientX - rect.left;
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

	<!-- Row 1: Logo (Always visible) -->
	<div
		class="flex h-[150px] w-full items-center justify-start border-b-2 border-[var(--text-color)] bg-[var(--bg-color)] p-4 lg:px-16">
		<button
			onclick={togglePlayback}
			class="flex h-[100px] w-[100px] items-center justify-center focus:outline-none"
			aria-label={$isPlaying ? "Pause" : "Play"}>
			<svg
				xmlns="http://www.w3.org/2000/svg"
				viewBox="0 0 384 384"
				class="animate-spin-vinyl h-full w-full text-[var(--text-color)]"
				style="animation-play-state: {$isPlaying ? 'running' : 'paused'}; fill: currentColor; filter: drop-shadow(0 0 2px var(--text-color));">
				<path
					d="M247.73,272.38l53.76-56.76h36.76l-71.95,71.78,49.69,51.19c41.6-35.22,68.02-87.82,68.02-146.59s-28.17-114.8-72.14-149.99l-18.99,4.04c-12.07,1.98-16.48,7.34-16.48,17.67v125.99h-26.57v-100.12h-17.96v-16.47l17.96-5.67c.02-30.16,8.15-39.31,31.8-45.28C254.86,8.02,224.37,0,192,0c-38.11,0-73.62,11.1-103.49,30.25h47.4l-19.76,22.31h-56.12C23.06,87.55,0,137.08,0,192c0,50.86,19.78,97.09,52.06,131.44v-107.82h26.99v131.64c31.7,23.1,70.73,36.74,112.95,36.74,38.1,0,73.6-11.1,103.46-30.23l-47.8-50.49.06-30.9ZM297.63,68.06h26.31v22.14h-26.31v-22.14ZM192.46,189.72h-125.81v-20.7L172.33,37.48l16.69-.19v19.02l-89.24,109.25v1.84h92.69v22.31Z" />
			</svg>
		</button>
	</div>

	{#if $currentTrack}
		<!-- Row 2: Progress + Info (Merged) -->
		<div
			class="relative w-full cursor-none overflow-hidden border-b-2 border-[var(--text-color)] bg-[var(--bg-color)] p-4 lg:px-16"
			bind:this={progressBar}
			role="button"
			tabindex="0"
			aria-label="Seek"
			onmousedown={onDragStart}
			ontouchstart={onDragStart}
			onmouseenter={() => (isHoveringProgressBar = true)}
			onmouseleave={() => (isHoveringProgressBar = false)}
			onmousemove={(e) => (hoverX = progressBar ? e.clientX - progressBar.getBoundingClientRect().left : 0)}>
			<!-- Vertical hover indicator line -->
			<div
				class="pointer-events-none absolute inset-y-0 w-[2px] bg-[var(--text-color)] transition-opacity duration-100"
				style="left: {hoverX}px; opacity: {isHoveringProgressBar ? 1 : 0};">
			</div>

			<!-- Content: Time + Title -->
			<div class="pointer-events-none relative z-20 flex w-full flex-col items-start gap-1">
				<!-- Time -->
				<div class="shrink-0 text-sm tabular-nums opacity-70">
					{formatTime(currentTime)} / {formatTime(duration)}
				</div>

				<!-- Title -->
				<div class="truncate text-lg font-medium md:text-2xl">
					{$currentTrack.title}
				</div>
			</div>

            <!-- Progress Bar (Gradient from Bottom) -->
            <div
                class="absolute bottom-0 left-0 h-[12px] pointer-events-none z-10 overflow-hidden"
                style="width: {duration ? (currentTime / duration) * 100 : 0}%; transition: width 0.1s linear;">
                <div
                    class="h-full w-screen"
                    style="background-image: linear-gradient(270deg, #ff00ff, #ffc000, #ccff00, #00ffff, #0080ff, #8000ff, #ff00ff); background-size: 100% 100%; animation: var(--animate-rainbow); mask-image: linear-gradient(to top, black, transparent); -webkit-mask-image: linear-gradient(to top, black, transparent);">
                </div>
            </div>
		</div>
	{/if}
</div>
