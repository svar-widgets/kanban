<script lang="ts">
	import { card, getData } from "../data.js";
	import { Kanban, Editor, getEditorItems } from "@svar-ui/svelte-kanban";
	import type { KanbanInstanceApi } from "@svar-ui/svelte-kanban";
	import { DemoPage } from "../ui";

	const { columns, cards } = getData();
	let api = $state<KanbanInstanceApi>();

	const items = getEditorItems(card);
</script>

<DemoPage>
	<Kanban bind:this={api} {cards} {columns} {card} />
	{#if api}<Editor {api} {items} />{/if}
</DemoPage>
