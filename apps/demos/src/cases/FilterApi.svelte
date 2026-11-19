<script lang="ts">
	import { Kanban } from "@svar-ui/svelte-kanban";
	import type { KanbanCard, KanbanInstanceApi } from "@svar-ui/svelte-kanban";
	import { DemoPage, ToolbarGroup, Text, Toggle, Button } from "../ui";
	import { getStyledData } from "../data.js";

	type Predicate = (card: KanbanCard) => boolean;

	const { columns, cards } = getStyledData();
	let api = $state<KanbanInstanceApi>();

	const highPriority: Predicate = card => card.priority === 3;

	// filters active on load, one predicate per tag
	const filters = new Map<string, Predicate>([["priority", highPriority]]);

	let search = $state("");
	let onlyHigh = $state(true);

	// each control owns its tag, so the predicates stack
	function setSearch({ value }: { value: string | number }) {
		search = String(value);
		const text = search.trim().toLowerCase();
		api?.exec("filter-cards", {
			tag: "search",
			filter: text ? card => card.label.toLowerCase().includes(text) : null,
		});
	}

	function setPriority({ value }: { value: boolean }) {
		api?.exec("filter-cards", {
			tag: "priority",
			filter: value ? highPriority : null,
		});
	}

	function clear() {
		search = "";
		onlyHigh = false;
		api?.exec("filter-cards", {});
	}
</script>

<DemoPage>
	{#snippet toolbar()}
		<ToolbarGroup>
			<Text
				value={search}
				placeholder="Search by title"
				icon="wxi-search"
				onchange={setSearch}
			/>
			<Toggle
				label="Only high priority"
				bind:value={onlyHigh}
				onchange={setPriority}
			/>
		</ToolbarGroup>
		<ToolbarGroup align="right">
			<Button onclick={clear}>Clear filters</Button>
		</ToolbarGroup>
	{/snippet}
	<Kanban
		bind:this={api}
		{cards}
		{columns}
		{filters}
		card={{ priority: true, progress: true }}
	/>
</DemoPage>
