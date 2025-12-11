<script lang="ts">
    import "$lib/css/fonts.css";
    import { slide } from "svelte/transition";
    let { infoPages } = $props();
    let expandedId = $state<string | null>(null);

    function toggle(id: string) {
        expandedId = expandedId === id ? null : id;
    }
</script>

<div class="flex w-full flex-col">
    {#each infoPages as page}
        <div class="border-b-2 border-black last:border-b-0">
            <button 
                class="flex w-full items-center justify-between p-4 lg:px-16 text-left text-xl font-medium hover:bg-gray-700 hover:text-white focus:outline-none"
                onclick={() => toggle(page.id)}
            >
                {page.title}
            </button>
            {#if expandedId === page.id}
                <div class="kirby-content p-4 lg:px-16 text-base leading-relaxed border-t-2 border-black border-solid">
                    <!-- eslint-disable-next-line svelte/no-at-html-tags -->
                    {@html page.text}
                </div>
            {/if}
        </div>
    {/each}
</div>
