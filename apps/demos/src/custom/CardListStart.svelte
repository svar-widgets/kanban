<script lang="ts">
	import type { CardListSlotProps } from "@svar-ui/svelte-kanban";
	let { column, swimlane, cards }: CardListSlotProps = $props();
</script>

<div class="intro">
	<strong>{column.label}{swimlane ? ` / ${swimlane.label}` : ""}</strong>
	<span>{cards.length} cards</span>
</div>

<style>
	.intro {
		min-height: var(--slot-start-height, 48px);
		padding: 12px;
		box-sizing: border-box;
		background: var(--wx-color-secondary);
		border-radius: 6px;
	}
	span {
		display: block;
	}
</style>
