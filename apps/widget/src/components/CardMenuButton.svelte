<!-- @component Card ⋯ button that opens an outer CardActionMenu; usable inside a custom `cardContent`. -->
<script lang="ts">
	import { getContext } from "svelte";
	import { locale, setID, type ILocale } from "@svar-ui/lib-dom";
	import { en } from "@svar-ui/kanban-locales";
	import type { KanbanCard } from "@svar-ui/kanban-store";

	type Props = {
		card: KanbanCard;
		/** Extra class names for the button. */
		css?: string;
	};

	let { card, css = "" }: Props = $props();

	// rendered inside <Kanban> the kanban locale is in context; fall back for standalone use
	const _ = (
		getContext<ILocale | undefined>("wx-i18n") ?? locale({ ...en })
	).getGroup("kanban");
</script>

<!-- data-action="menu" keeps the click from selecting the card -->
<button
	type="button"
	class="wx-menu {css}"
	data-action="menu"
	data-card-menu={setID(card.id)}
	aria-label={_("Card menu")}
	aria-haspopup="menu"
>
	<i class="wx-icon wxi-dots-h"></i>
</button>

<style>
	.wx-menu {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		background: none;
		border: none;
		padding: 0;
		width: 22px;
		height: 22px;
		border-radius: var(--wx-icon-border-radius);
		cursor: pointer;
		color: var(--wx-color-font-alt);
		font-size: 16px;
	}

	.wx-menu:hover {
		background: var(--wx-background-hover);
		color: var(--wx-color-font);
	}

	.wx-menu:focus-visible {
		outline: none;
		border: 1px solid var(--wx-color-primary);
	}
</style>
