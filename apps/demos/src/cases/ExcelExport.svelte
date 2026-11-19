<script lang="ts">
	import { card, getData } from "../data.js";
	import { Kanban, Editor } from "@svar-ui/svelte-kanban";
	import type { KanbanInstanceApi } from "@svar-ui/svelte-kanban";
	import { downloadBlob, writeWorkbook } from "xlsx-writer-lite";
	import { DemoPage, ToolbarGroup, Button } from "../ui";

	const { columns, cards } = getData();
	let api = $state<KanbanInstanceApi>();

	// sheet columns: card field, header and width
	const sheet = [
		{ label: "Title", id: "label", width: 30 },
		{ label: "Status", id: "column" },
		{ label: "Deadline", id: "deadline" },
		{ label: "Description", id: "description", width: 50 },
	];

	async function toExcel() {
		if (!api) return;
		const blob = await writeWorkbook(api.getCards(), sheet, { header: true });
		downloadBlob(blob, "cards.xlsx");
	}
</script>

<DemoPage>
	{#snippet toolbar()}
		<ToolbarGroup>
			<Button type="primary" onclick={toExcel}>Export to Excel</Button>
		</ToolbarGroup>
	{/snippet}
	<Kanban bind:this={api} {cards} {columns} {card} />
	{#if api}<Editor {api} />{/if}
</DemoPage>
