<script lang="ts">
	import { card, getData } from "../data.js";
	import { Kanban, Editor } from "@svar-ui/svelte-kanban";
	import type { KanbanCard, KanbanInstanceApi } from "@svar-ui/svelte-kanban";
	import { downloadBlob } from "xlsx-writer-lite";
	import {
		DemoPage,
		ToolbarGroup,
		Button,
		FileButton,
		useDialogs,
	} from "../ui";

	const { notice } = useDialogs();
	const data = getData();
	const columns = data.columns;
	let cards = $state.raw(data.cards);
	let api = $state<KanbanInstanceApi>();

	// getCards() is the full source snapshot, ready to persist
	function save() {
		if (!api) return;
		const json = JSON.stringify(api.getCards(), null, 2);
		downloadBlob(new Blob([json], { type: "application/json" }), "cards.json");
	}

	// a new cards array replaces the board data; JSON keeps dates as strings,
	// so they are turned back into Date objects first
	async function load(file: File) {
		try {
			const parsed: KanbanCard[] = JSON.parse(await file.text());
			if (!Array.isArray(parsed)) throw new Error("not an array");
			cards = parsed.map(c =>
				c.deadline ? { ...c, deadline: new Date(c.deadline) } : c
			);
		} catch {
			notice("The file is not a JSON array of cards", "danger");
		}
	}
</script>

<DemoPage>
	{#snippet toolbar()}
		<ToolbarGroup>
			<Button onclick={save}>Save JSON</Button>
			<FileButton accept=".json,application/json" onfile={load}>
				Load JSON
			</FileButton>
		</ToolbarGroup>
	{/snippet}
	<Kanban bind:this={api} {cards} {columns} {card} />
	{#if api}<Editor {api} />{/if}
</DemoPage>
