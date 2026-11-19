<script lang="ts">
	import { Kanban } from "@svar-ui/svelte-kanban";
	import type { ColumnConfig, ColumnCssFn } from "@svar-ui/svelte-kanban";
	import { DemoPage, ToolbarGroup, Hint } from "../ui";
	import { getStyledData } from "../data.js";

	// static column.css ("col-todo", ...) comes with the data; wipLimit is a
	// custom column field, passed through to columnCss
	const { columns: source, cards } = getStyledData();
	const columns: ColumnConfig[] = source.map(column => ({
		...column,
		wipLimit: column.id === "doing" ? 2 : 3,
	}));

	// dynamic column class: highlight a column over its limit
	const columnCss: ColumnCssFn = (cards, column) =>
		cards.length > column.wipLimit ? "col-full" : "";
</script>

<DemoPage>
	{#snippet toolbar()}
		<ToolbarGroup>
			<Hint>
				Each column has a static class; "In Progress" is over its limit of 2
				cards. Move a card out of it to clear the highlight.
			</Hint>
		</ToolbarGroup>
	{/snippet}
	<div class="styling-demo">
		<Kanban {cards} {columns} {columnCss} />
	</div>
</DemoPage>

<style>
	/* scopes the global rules below without touching the layout */
	.styling-demo {
		display: contents;
	}

	/* static column.css: a colored header stripe per column */
	.styling-demo :global(.wx-column.col-todo .wx-column-header) {
		box-shadow: inset 0 3px 0 #3b82f6;
	}
	.styling-demo :global(.wx-column.col-doing .wx-column-header) {
		box-shadow: inset 0 3px 0 #f59e0b;
	}
	.styling-demo :global(.wx-column.col-done .wx-column-header) {
		box-shadow: inset 0 3px 0 #22c55e;
	}

	/* dynamic columnCss result */
	.styling-demo :global(.wx-column.col-full) {
		--wx-kanban-column-bg: rgba(239, 68, 68, 0.12);
		background: rgba(239, 68, 68, 0.12);
	}
	.styling-demo :global(.wx-column.col-full .wx-column-header),
	.styling-demo :global(.wx-column.col-full .wx-body) {
		background: transparent;
	}
</style>
