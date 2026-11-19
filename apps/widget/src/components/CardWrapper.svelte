<script lang="ts">
	import type { Component } from "svelte";
	import { getContext } from "svelte";
	import { setID, type ILocale } from "@svar-ui/lib-dom";
	import type { KanbanCard } from "@svar-ui/kanban-store";
	import Card from "./Card.svelte";
	import type { CardShape } from "../types.js";

	type Props = {
		cardContent?: Component<{ card: KanbanCard; cardShape: CardShape }>;
		card: KanbanCard;
		cardShape: CardShape;
		extraCss?: string;
	};

	const {
		cardContent: CardContent,
		card,
		cardShape,
		extraCss = "",
	}: Props = $props();

	const _ = getContext<ILocale>("wx-i18n").getGroup("kanban");
</script>

<!-- svelte-ignore a11y_no_noninteractive_element_to_interactive_role -->
<article
	class="wx-card {card.css ?? ''} {extraCss}"
	data-id={card.id == null ? undefined : setID(card.id)}
	role="button"
	tabindex="0"
	aria-label={card.label ?? `${_("Card")} ${card.id}`}
>
	{#if CardContent}
		<CardContent {card} {cardShape}></CardContent>
	{:else}
		<Card {card} {cardShape} />
	{/if}
</article>

<style>
	.wx-card {
		display: flex;
		flex-direction: column;
		gap: 6px;
		padding: 10px;
		background: var(--wx-kanban-card-bg);
		border-radius: var(--wx-border-radius);
		box-shadow: var(--wx-kanban-card-shadow);
		cursor: pointer;
		border-top: 3px solid transparent;
		touch-action: none;
		user-select: none;
	}

	.wx-card:hover {
		box-shadow: var(--wx-kanban-card-shadow-hover);
	}

	.wx-card:focus-visible {
		outline: 2px solid var(--wx-color-primary);
		outline-offset: 1px;
	}
</style>
