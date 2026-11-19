<script lang="ts">
	import { card } from "../data.js";
	import {
		Kanban,
		Editor,
		getEditorItems,
		registerEditorItem,
	} from "@svar-ui/svelte-kanban";
	import type {
		KanbanInstanceApi,
		KanbanCard,
		ColumnConfig,
	} from "@svar-ui/svelte-kanban";
	import { RestDataProvider } from "@svar-ui/kanban-provider";
	import { Attachments } from "@svar-ui/svelte-editor";
	import { getBoardURL, server } from "../custom/backend.js";
	import { DemoPage, Message } from "../ui";

	registerEditorItem("files", Attachments);

	const board = getBoardURL("editor-files").then(async url => {
		const provider = new RestDataProvider(url);
		const state = await fetch(url).then(r => r.json());
		const columns: ColumnConfig[] = state.columns;
		// the demo server seeds cards with a lane field; drop it, lanes are Pro
		const cards: KanbanCard[] = provider
			.parseCards(state.cards)
			.map(({ swimlane: _, ...card }) => card);

		const items = [
			...getEditorItems(card),
			{
				comp: "files",
				key: "attachments",
				label: "Attachments",
				// the server stores the binary and returns { id, name, size, url };
				// the editor saves that metadata with the card through update-card
				uploadURL: `${url}/files`,
			},
		];
		return { provider, columns, cards, items };
	});

	let api = $state<KanbanInstanceApi>();

	// open the first card, so the attachments field is in view
	function init(value: KanbanInstanceApi, cards: KanbanCard[]) {
		api = value;
		if (cards.length) value.exec("select-card", { id: cards[0].id });
	}
</script>

<DemoPage>
	{#await board then { provider, columns, cards, items }}
		<Kanban
			init={value => {
				value.setNext(provider);
				init(value, cards);
			}}
			{cards}
			{columns}
			{card}
		/>
		{#if api}<Editor {api} {items} />{/if}
	{:catch}
		<Message
			type="danger"
			title="Backend is not available"
			text="Start the kanban-go backend at {server}"
		/>
	{/await}
</DemoPage>
