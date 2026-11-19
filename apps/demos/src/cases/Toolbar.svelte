<script lang="ts">
	import { Kanban, Toolbar, Editor } from "@svar-ui/svelte-kanban";
	import type { KanbanInstanceApi } from "@svar-ui/svelte-kanban";
	import { DemoPage } from "../ui";
	import { getData, getStyledData } from "../data.js";

	const { cards } = getStyledData();
	const { columns } = getData();
	let api = $state<KanbanInstanceApi>();
</script>

<!-- the built-in toolbar: "+" adds a card in the editor, the menu sorts -->
<DemoPage>
	<Toolbar {api} add sort />
	<Kanban bind:this={api} {cards} {columns} />
	{#if api}<Editor {api} />{/if}
</DemoPage>
