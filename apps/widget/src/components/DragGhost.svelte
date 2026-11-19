<script lang="ts">
	import type { Component } from "svelte";
	import { getContext } from "svelte";
	import type { KanbanCard, KanbanStore } from "@svar-ui/kanban-store";
	import CardWrapper from "./CardWrapper.svelte";
	import { KANBAN_API_CONTEXT, DND_CONTEXT } from "../context.js";
	import type { DndState } from "./useDrag.svelte.js";
	import type { CardShape } from "../types.js";

	type Props = {
		root?: HTMLElement;
		cardContent?: Component<{ card: KanbanCard; cardShape: CardShape }>;
		cardShape: CardShape;
	};

	let { root, cardContent, cardShape }: Props = $props();

	const dnd = getContext<DndState>(DND_CONTEXT);
	const store = getContext<KanbanStore>(KANBAN_API_CONTEXT);

	const draggedCard = $derived.by(() => {
		if (!dnd?.active || dnd.cardId == null) return null;
		return store.getState().cards.getById(dnd.cardId) ?? null;
	});

	const position = $derived.by(() => {
		if (!dnd) return { x: 0, y: 0 };
		let x = dnd.pointer.x - dnd.offset.x;
		let y = dnd.pointer.y - dnd.offset.y;
		if (root && dnd.active) {
			const rect = root.getBoundingClientRect();
			x = Math.max(rect.left, Math.min(x, rect.right - dnd.width));
			y = Math.max(rect.top, Math.min(y, rect.bottom - dnd.height));
		}
		return { x, y };
	});
</script>

{#if dnd?.active && draggedCard}
	<div
		class="wx-ghost"
		style:width="{dnd.width}px"
		style:height="{dnd.height}px"
		style:transform="translate({position.x}px, {position.y}px)"
	>
		<CardWrapper card={draggedCard} {cardContent} {cardShape} />
	</div>
{/if}

<style>
	.wx-ghost {
		position: fixed;
		top: 0;
		left: 0;
		z-index: 10000;
		pointer-events: none;
		box-shadow: var(--wx-kanban-card-shadow-drag);
		border-radius: var(--wx-border-radius);
		transform-origin: top left;
		will-change: transform;
	}

	.wx-ghost :global(.wx-card) {
		cursor: grabbing;
		width: 100%;
		height: 100%;
		box-sizing: border-box;
		overflow: hidden;
	}
</style>
