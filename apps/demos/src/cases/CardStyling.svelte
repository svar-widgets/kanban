<script lang="ts">
	import { getStyledData } from "../data.js";
	import { Kanban, Editor } from "@svar-ui/svelte-kanban";
	import type { CardCssFn, KanbanInstanceApi } from "@svar-ui/svelte-kanban";
	import { DemoPage } from "../ui";

	// card 7 has a static `css: "card-pinned"`
	const { columns, cards } = getStyledData();
	let api = $state<KanbanInstanceApi>();

	// classes computed from card data, re-evaluated on every change
	const cardCss: CardCssFn = card => {
		const priority = card.priority === 3 ? "card-high" : "";
		const done = (card.progress ?? 0) >= 1 ? "card-complete" : "";
		return `${priority} ${done}`.trim();
	};
</script>

<DemoPage>
	<div class="card-styling">
		<Kanban bind:this={api} {cards} {columns} {cardCss} />
	</div>
	{#if api}<Editor {api} />{/if}
</DemoPage>

<style>
	.card-styling {
		height: 100%;
	}

	/* static card.css */
	.card-styling :global(.wx-card.card-pinned) {
		border-left: 3px solid var(--wx-color-warning);
	}

	/* cardCss results */
	.card-styling :global(.wx-card.card-high) {
		border-top: 3px solid var(--wx-color-danger);
	}
	.card-styling :global(.wx-card.card-complete) {
		opacity: 0.6;
	}
</style>
