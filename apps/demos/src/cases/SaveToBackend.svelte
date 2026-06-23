<script lang="ts">
	import { Kanban, Editor } from "@svar-ui/svelte-kanban";
	import type { KanbanInstanceApi, KanbanCard } from "@svar-ui/svelte-kanban";
	import { RestDataProvider } from "@svar-ui/kanban-provider";
	import { getData } from "../data.js";

	const server = "https://kanban-backend.svar.dev";
	const provider = new RestDataProvider(server);

	const { columns } = getData();
	let api = $state<KanbanInstanceApi>();
	let cards = $state<KanbanCard[]>([]);

	provider.getData().then(data => {
		cards = data;
	});

	function init(api: KanbanInstanceApi) {
		api.setNext(provider);
		api.intercept("add-card", (ev: { card: Partial<KanbanCard> }) => {
			ev.card.priority = 1;	
		});
	}
	
</script>

<Kanban bind:this={api} {init} {cards} {columns} />
{#if api}<Editor {api} />{/if}
