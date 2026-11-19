<script lang="ts">
	import { card, getData } from "../data.js";
	import { Kanban, Editor } from "@svar-ui/svelte-kanban";
	import type { KanbanInstanceApi, StoreActions } from "@svar-ui/svelte-kanban";
	import {
		DemoPage,
		ToolbarGroup,
		Button,
		EventLog,
		EventLogState,
	} from "../ui";

	const data = getData();
	// cards are added from the toolbar only
	const columns = data.columns.map(c => ({ ...c, addCard: false }));
	const { cards } = data;
	const log = new EventLogState();
	let api = $state<KanbanInstanceApi>();
	let count = 0;

	// api.on subscribes after the action ran
	function init(value: KanbanInstanceApi) {
		api = value;
		api.on("add-card", ev => {
			const { card } = ev as StoreActions["add-card"];
			log.add(`api.on("add-card"): "${card.label}"`);
		});
	}

	// on<action> props receive the same payload
	function onmovecard(ev: StoreActions["move-card"]) {
		log.add(`onmovecard: card ${ev.id} to "${ev.column}"`);
	}

	function addCard() {
		api?.exec("add-card", {
			card: { label: `New card ${++count}`, column: "todo" },
		});
	}

	function moveCard() {
		const card = api!.getCards().find(c => c.column === "todo");
		if (card) api!.exec("move-card", { id: card.id, column: "doing" });
		else log.add("no cards left in To Do");
	}

	function selectCard() {
		api?.exec("select-card", { id: 1 });
	}
</script>

<DemoPage>
	{#snippet toolbar()}
		<ToolbarGroup label="api.exec">
			<Button onclick={addCard}>Add card</Button>
			<Button onclick={moveCard}>Move first To Do card</Button>
			<Button onclick={selectCard}>Open card 1</Button>
		</ToolbarGroup>
	{/snippet}
	<Kanban {init} {cards} {columns} {card} {onmovecard} />
	{#if api}<Editor {api} />{/if}
	{#snippet bottom()}
		<EventLog {log} />
	{/snippet}
</DemoPage>
