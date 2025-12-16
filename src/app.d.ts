// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
declare global {
	namespace App {
		// interface Error {}
		// interface Locals {}
		// interface PageData {}
		// interface PageState {}
		// interface Platform {}
	}
	interface Window {
		SC: SoundCloud;
	}

	interface SoundCloud {
		Widget: SoundCloudWidgetFactory;
	}

	interface SoundCloudWidgetFactory {
		(iframe: HTMLIFrameElement): SoundCloudWidget;
		Events: {
			READY: string;
			PLAY: string;
			PAUSE: string;
			FINISH: string;
			PLAY_PROGRESS: string;
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			Do: any;
		};
	}

	interface SoundCloudWidget {
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		bind(event: string, callback: (data?: any) => void): void;
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		load(url: string, options: any): void;
		play(): void;
		pause(): void;
		toggle(): void;
		seekTo(milliseconds: number): void;
		getDuration(callback: (duration: number) => void): void;
	}
}

export {};
