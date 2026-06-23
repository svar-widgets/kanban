<script lang="ts">
	import { Kanban, Editor } from "@svar-ui/svelte-kanban";
	import type { CardCssFn, ColumnCssFn } from "@svar-ui/svelte-kanban";
	import { getStyledData } from "../data.js";
	

	const { columns, cards } = getStyledData();
	let api = $state();

	// dynamic per-card class: tint cards by priority and flag completed ones
	const cardCss: CardCssFn = card => {
		const priority = card.priority === 3 ? "card-high" : "";
		const done = (card.progress ?? 0) >= 1 ? "card-complete" : "";
		return `${priority} ${done}`.trim();
	};

	// dynamic per-column class: highlight columns that hit their cardLimit
	const columnCss: ColumnCssFn = (cards, column) => {
		if (typeof column.cardLimit === "number" && cards.length >= column.cardLimit) {
			return "col-full";
		}
		return "";
	};
</script>

<div class="styling-demo">
	<Kanban bind:this={api} {cards} {columns} {columnCss} {cardCss} />
	{#if api}<Editor {api} />{/if}
</div>

<style>
	.styling-demo {
		height: 100%;
		width: 100%;
	}

	/* static column.css: stripe headers per column */
	.styling-demo :global(.wx-column.col-todo) {
		background: #eef4ff;
	}
	.styling-demo :global(.wx-column.col-doing) {
		background: #fff5e6;
	}
	.styling-demo :global(.wx-column.col-review) {
		background: #f1eaff;
	}
	.styling-demo :global(.wx-column.col-done) {
		background: #e6f7ec;
	}

	/* static card.css: pin a single card with a left accent */
	.styling-demo :global(.wx-card.card-pinned) {
		border-left: 3px solid #f59e0b;
		background: #fffbeb;
	}

	/* dynamic cardCss results: high-priority and completed cards */
	.styling-demo :global(.wx-card.card-high) {
		border-top: 3px solid #ef4444;
	}
	.styling-demo :global(.wx-card.card-complete) {
		opacity: 0.6;
		background: #f5f5f5;
	}

	/* dynamic columnCss result: pulse a column when it is at or over its limit */
	.styling-demo :global(.wx-column.col-full .wx-column-cards) {
		background-image: repeating-linear-gradient(
			-45deg,
			#ef4444,
			#ef4444 1px,
			transparent 1px,
			transparent 20px
		);
	}	
</style>
