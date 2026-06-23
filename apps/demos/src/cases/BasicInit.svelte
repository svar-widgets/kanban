<script lang="ts">
	import { card, getData } from "../data.js";
	import { Kanban, Editor, getEditorItems } from "@svar-ui/svelte-kanban";

	const { columns, cards } = getData();
	let api = $state();

	let items = getEditorItems(card)
</script>

<Kanban bind:this={api} {cards} {columns} {card} />
{#if api}<Editor {api} {items} />{/if}
