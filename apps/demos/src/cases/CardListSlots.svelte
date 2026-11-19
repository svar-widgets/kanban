<script lang="ts">
	import { setContext } from "svelte";
	import { Kanban, type KanbanInstanceApi } from "@svar-ui/svelte-kanban";
	import { DemoPage } from "../ui";
	import { getData } from "../data.js";
	import CardListStart from "../custom/CardListStart.svelte";
	import CardListEnd from "../custom/CardListEnd.svelte";

	const { columns, cards } = getData();

	// the end slot adds cards through the widget API
	let api = $state<KanbanInstanceApi>();
	setContext("card-list-demo-api", () => api);
</script>

<!-- a slot renders once per card list: before the first card and after the last -->
<DemoPage>
	<Kanban
		bind:this={api}
		{cards}
		{columns}
		cardListStart={CardListStart}
		cardListEnd={CardListEnd}
	/>
</DemoPage>
