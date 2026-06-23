<script lang="ts">
	import { card, getData } from "../data.js";
	import { ExcelImport } from "@svar-ui/svelte-excel-import";
	import { Kanban, Editor } from "@svar-ui/svelte-kanban";
	import type { KanbanCard, KanbanInstanceApi } from "@svar-ui/svelte-kanban";
	import { Layout } from "@svar-ui/svelte-layout";
	import { Button } from "@svar-ui/svelte-core";
	import { downloadBlob, writeWorkbook } from "xlsx-writer-lite";

	const { columns, cards } = getData();
	let api = $state() as KanbanInstanceApi;

	async function toExcel(){
		const columns = [
			{ label: "Title", id: "label", width: 30 },
			{ label: "Deadline", id: "deadline" },
			{ label: "Description", id: "description", width: 50 },
		]

		const blob = await writeWorkbook(api!.getCards(), columns, { header:true });
		downloadBlob(blob, 'cards.xlsx');
	}

	let importVisible = $state(false);
	function fromExcelStart(){
		importVisible = true;
	}

	function fromExcelEnd(cards:KanbanCard[]){
		cards.forEach(v => v.column = v.column || "todo");
		api.exec("provide-data", { cards });
		importVisible = false;
	}
</script>

<Layout>
	<div class="toolbar">
		<Button onclick={toExcel}>Export to Excel</Button>
		<Button onclick={fromExcelStart}>Import from Excel</Button>
	</div>
	<Kanban bind:this={api} {cards} {columns} {card} />
	{#if api}<Editor {api} />{/if}
</Layout>

{#if importVisible}
	<ExcelImport 
		fields={[
			{ label: "Title", id: "label" },
			{ label: "Deadline", id: "deadline" },
			{ label: "Description", id: "description" },
		]}
		generateIds={true}
		onimport={fromExcelEnd}
		onclose={() => importVisible = false}
	/>
{/if}

<style>
	.toolbar {
		display: flex;
		gap: 10px;
		padding: 10px;
	}
</style>