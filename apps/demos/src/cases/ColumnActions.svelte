<script lang="ts">
	import { Kanban } from "@svar-ui/svelte-kanban";
	import type { KanbanInstanceApi } from "@svar-ui/svelte-kanban";
	import {
		DemoPage,
		ToolbarGroup,
		Button,
		EventLog,
		EventLogState,
	} from "../ui";
	import { getData } from "../data.js";

	const { columns, cards } = getData();
	const log = new EventLogState();

	let api = $state<KanbanInstanceApi>();
	let added = 0;

	function columnIds() {
		return api!.getState().columns.map(c => c.id);
	}

	function addColumn() {
		added++;
		api!.exec("add-column", { column: { label: `New column ${added}` } });
	}

	// moves the last column to the first place
	function moveColumn() {
		const ids = columnIds();
		if (ids.length > 1)
			api!.exec("move-column", { id: ids.at(-1)!, before: ids[0] });
	}

	function renameColumn() {
		const id = columnIds()[0];
		if (id !== undefined)
			api!.exec("update-column", { id, column: { label: "Renamed" } });
	}

	function deleteColumn() {
		const id = columnIds().at(-1);
		if (id !== undefined) api!.exec("delete-column", { id });
	}
</script>

<DemoPage>
	{#snippet toolbar()}
		<ToolbarGroup label="Columns">
			<Button onclick={addColumn}>Add</Button>
			<Button onclick={moveColumn}>Move last to first</Button>
			<Button onclick={renameColumn}>Rename first</Button>
			<Button onclick={deleteColumn}>Delete last</Button>
		</ToolbarGroup>
	{/snippet}
	<!-- on<action> props report each column action after the store applied it -->
	<Kanban
		bind:this={api}
		{cards}
		{columns}
		onaddcolumn={ev => log.add(`add-column "${ev.column.label}"`)}
		onupdatecolumn={ev => log.add(`update-column ${ev.id}`)}
		onmovecolumn={ev =>
			log.add(`move-column ${ev.id} before ${ev.before ?? "end"}`)}
		ondeletecolumn={ev => log.add(`delete-column ${ev.id}`)}
	/>
	{#snippet bottom()}
		<EventLog {log} />
	{/snippet}
</DemoPage>
