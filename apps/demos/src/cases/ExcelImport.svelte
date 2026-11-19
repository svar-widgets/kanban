<script lang="ts">
	import { card, getData } from "../data.js";
	import { ExcelImport } from "@svar-ui/svelte-excel-import";
	import { Kanban, Editor } from "@svar-ui/svelte-kanban";
	import type {
		CardID,
		ColumnID,
		KanbanCard,
		KanbanInstanceApi,
	} from "@svar-ui/svelte-kanban";
	import { DemoPage, ToolbarGroup, Button } from "../ui";

	const { columns, cards } = getData();
	let api = $state<KanbanInstanceApi>();
	let importVisible = $state(false);

	// app fields the user maps the sheet columns to
	const fields = [
		{ label: "Title", id: "label" },
		{ label: "Deadline", id: "deadline" },
		{ label: "Description", id: "description" },
	];

	// imported rows are upserted into the board; rows without a column go to To Do
	function onimport(rows: Record<string, unknown>[]) {
		const imported: KanbanCard[] = rows.map(row => ({
			...row,
			id: row.id as CardID,
			column: (row.column as ColumnID) || "todo",
		}));
		api?.exec("provide-data", { cards: imported });
		importVisible = false;
	}
</script>

<DemoPage>
	{#snippet toolbar()}
		<ToolbarGroup>
			<Button type="primary" onclick={() => (importVisible = true)}>
				Import from Excel
			</Button>
		</ToolbarGroup>
	{/snippet}
	<Kanban bind:this={api} {cards} {columns} {card} />
	{#if api}<Editor {api} />{/if}
</DemoPage>

{#if importVisible}
	<ExcelImport
		{fields}
		generateIds={true}
		{onimport}
		onclose={() => (importVisible = false)}
	/>
{/if}
