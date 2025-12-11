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

	{#if $currentTrack}
		<!-- Progress + Info -->
		<div
			class="relative w-full cursor-none overflow-hidden border-b-2 border-[var(--text-color)] bg-[var(--bg-color)] p-4"
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
				<div class="shrink-0 text-sm tabular-nums opacity-70 md:text-lg lg:text-xl">
					{formatTime(currentTime)} / {formatTime(duration)}
				</div>

				<!-- Title -->
				<div class="truncate text-sm font-medium md:text-lg lg:text-3xl">
					{$currentTrack.title}
				</div>
			</div>

			<!-- Progress Bar (Gradient from Bottom) -->
			<div
				class="pointer-events-none absolute bottom-0 left-0 z-10 h-[12px] overflow-hidden"
				style="width: {duration ? (currentTime / duration) * 100 : 0}%; transition: width 0.1s linear;">
				<div
					class="h-full w-screen"
					style="background-image: linear-gradient(270deg, #ff00ff, #ffc000, #ccff00, #00ffff, #0080ff, #8000ff, #ff00ff); background-size: 100% 100%; animation: var(--animate-rainbow); mask-image: linear-gradient(to top, black, transparent); -webkit-mask-image: linear-gradient(to top, black, transparent);">
				</div>
			</div>
		</div>
	{/if}
</div>
