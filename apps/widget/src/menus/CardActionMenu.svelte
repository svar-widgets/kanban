<!-- @component Opens on a click of the card ⋯ button (card.menu: true). -->
<script lang="ts">
	import { getMenuOptions } from "@svar-ui/kanban-store";
	import type { KanbanCard, KanbanMenuProps } from "../types.js";
	import KanbanMenu from "./KanbanMenu.svelte";
	import { execCardMenuAction, resolveCard } from "./helpers.js";

	let { api = null, ...rest }: KanbanMenuProps<KanbanCard> = $props();

	let menu = $state<any>();
	export function show(ev: any, obj?: any) {
		menu?.show(ev, obj);
	}
</script>

<KanbanMenu
	{...rest}
	trigger="click"
	dataKey="cardMenu"
	resolve={id => resolveCard(api, id)}
	defaults={getMenuOptions}
	builtin={(action, card) => execCardMenuAction(api, action, card)}
	bind:this={menu}
/>
