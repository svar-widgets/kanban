<script lang="ts">
	import { Kanban } from "@svar-ui/svelte-kanban";
	import type {
		ColumnConfig,
		ColumnSummaryConfig,
		KanbanInstanceApi,
	} from "@svar-ui/svelte-kanban";
	import { DemoPage, ToolbarGroup, Button } from "../ui";

	let api = $state<KanbanInstanceApi>();

	// each summary is a tag in the column header: calculate -> format -> css
	const summaries: ColumnSummaryConfig[] = [
		{
			id: "effort",
			calculate: cards =>
				cards.reduce((sum, card) => sum + (card.estimateHours ?? 0), 0),
			format: value => (value ? `${value} h` : ""),
			css: value => (value > 40 ? "effort-over-capacity" : ""),
		},
		{
			id: "blocked",
			calculate: cards => cards.filter(card => card.blocked).length,
			format: value => (value ? `${value} blocked` : ""),
			css: () => "blocked-warning",
		},
		{
			id: "capacity",
			calculate: cards => cards.length,
			format: (value, column) => `${value}/${column.wipLimit}`,
			css: (value, column) =>
				value > column.wipLimit ? "capacity-exceeded" : "",
		},
	];
	const columns: ColumnConfig[] = [
		{ id: "todo", label: "To do", wipLimit: 1, summaries },
		{ id: "doing", label: "Doing", wipLimit: 3, summaries },
		{ id: "done", label: "Done", wipLimit: 5, summaries },
	];
	const cards = [
		{
			id: 1,
			column: "todo",
			label: "Plan launch",
			estimateHours: 32,
			blocked: true,
		},
		{ id: 2, column: "todo", label: "Review design", estimateHours: 16 },
		{ id: 3, column: "doing", label: "Triage requests", estimateHours: 0 },
	];

	// summaries are recalculated after every card change
	function updateEstimate() {
		api?.exec("update-card", {
			id: 1,
			card: { estimateHours: 8, blocked: false },
		});
	}
</script>

<DemoPage>
	{#snippet toolbar()}
		<ToolbarGroup>
			<Button onclick={updateEstimate}>Update "Plan launch"</Button>
		</ToolbarGroup>
	{/snippet}
	<div class="summary-demo">
		<Kanban bind:this={api} {cards} {columns} />
	</div>
</DemoPage>

<style>
	/* scopes the global rules below without touching the layout */
	.summary-demo {
		display: contents;
	}

	/* summary css hooks: each one styles its own tag */
	.summary-demo :global(.wx-column-summary.effort-over-capacity),
	.summary-demo :global(.wx-column-summary.capacity-exceeded) {
		color: var(--wx-color-danger);
	}

	.summary-demo :global(.wx-column-summary.blocked-warning) {
		color: #92400e;
		background: #fef3c7;
		border-color: #fcd34d;
	}
</style>
