<script lang="ts">
	import { Kanban, Editor } from "@svar-ui/svelte-kanban";
	import type { ColumnConfig, KanbanInstanceApi } from "@svar-ui/svelte-kanban";
	import { RestDataProvider } from "@svar-ui/kanban-provider";
	import { getBoardURL, server } from "../custom/backend.js";
	import { DemoPage, Message } from "../ui";

	// load the board, then every change is sent to the server by the provider
	const board = getBoardURL("save-to-backend").then(async url => {
		const provider = new RestDataProvider(url);
		const state = await fetch(url).then(r => r.json());
		const columns: ColumnConfig[] = state.columns;
		// the demo server seeds cards with a lane field; drop it, lanes are Pro
		const cards = provider
			.parseCards(state.cards)
			.map(({ swimlane: _, ...card }) => card);
		return { provider, columns, cards };
	});

	let api = $state<KanbanInstanceApi>();
</script>

<DemoPage>
	{#await board then { provider, columns, cards }}
		<Kanban
			bind:this={api}
			init={api => api.setNext(provider)}
			{cards}
			{columns}
		/>
		{#if api}<Editor {api} />{/if}
	{:catch}
		<Message
			type="danger"
			title="Backend is not available"
			text="Start the kanban-go backend at {server}"
		/>
	{/await}
</DemoPage>
