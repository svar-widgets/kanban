<script lang="ts">
	import { card, getData } from "../data.js";
	import { Kanban, Editor, type KanbanInstanceApi } from "@svar-ui/svelte-kanban";
	import { DemoPage, Choice } from "../ui";

	const { columns, cards } = getData();
	let api = $state<KanbanInstanceApi>();

	const options = [
		{ id: "default", label: "Default" },
		{ id: "custom", label: "Custom" },
	];
	let theme = $state<string | number>("custom");
</script>

<DemoPage>
	{#snippet toolbar()}
		<Choice {options} bind:value={theme} />
	{/snippet}
	<!-- --wx-kanban-* variables set on any ancestor of the board win over the theme -->
	<div class="board" class:custom-board={theme === "custom"}>
		<Kanban bind:this={api} {cards} {columns} {card} />
		{#if api}<Editor {api} />{/if}
	</div>
</DemoPage>

<style>
	.board {
		display: flex;
		flex: 1;
		min-height: 0;
	}

	.custom-board {
		--wx-kanban-bg: #f3efe7;
		--wx-kanban-column-bg: #e6dfd2;
		--wx-kanban-card-bg: #fffdf8;
		--wx-kanban-border-color: #cfc4b0;
		--wx-kanban-tag-bg: #ece4d4;
		--wx-kanban-progress-bg: #e6dfd2;
		--wx-kanban-progress-fill: #b45309;
		--wx-kanban-card-shadow: 0 1px 3px rgba(84, 62, 32, 0.15);
		--wx-kanban-card-shadow-hover: 0 3px 8px rgba(84, 62, 32, 0.2);
		--wx-kanban-priority-high-bg: #fbd5c5;
		--wx-kanban-priority-high-color: #9a3412;
	}

	/* the same overrides tuned for the dark skin */
	:global(.wx-willow-dark-theme) .custom-board {
		--wx-kanban-bg: #1f1b16;
		--wx-kanban-column-bg: #2b251d;
		--wx-kanban-card-bg: #3a3127;
		--wx-kanban-border-color: #4f4436;
		--wx-kanban-tag-bg: #4a3f31;
		--wx-kanban-progress-bg: #4a3f31;
		--wx-kanban-progress-fill: #f59e0b;
		--wx-kanban-card-shadow: 0 1px 3px rgba(0, 0, 0, 0.4);
		--wx-kanban-card-shadow-hover: 0 3px 8px rgba(0, 0, 0, 0.5);
		--wx-kanban-priority-high-bg: #5a2a16;
		--wx-kanban-priority-high-color: #fdba74;
	}
</style>
