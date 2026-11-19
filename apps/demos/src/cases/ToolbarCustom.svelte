<script lang="ts">
	import {
		Kanban,
		Toolbar,
		Editor,
		getToolbarItems,
	} from "@svar-ui/svelte-kanban";
	import type { KanbanInstanceApi } from "@svar-ui/svelte-kanban";
	import { DemoPage, useDialogs } from "../ui";
	import { getData, getStyledData } from "../data.js";

	const { cards } = getStyledData();
	const { columns } = getData();
	let api = $state<KanbanInstanceApi>();
	const { notice } = useDialogs();

	// default items plus host items: a handler replaces the built-in action
	const items = [
		...getToolbarItems({ add: true, sort: true }),
		{ comp: "spacer" },
		{
			id: "count",
			comp: "button",
			text: "Count cards",
			handler: () => notice(`${api!.getCards().length} cards on the board`),
		},
	];
</script>

<DemoPage>
	<Toolbar {api} {items} />
	<Kanban bind:this={api} {cards} {columns} />
	{#if api}<Editor {api} />{/if}
</DemoPage>
