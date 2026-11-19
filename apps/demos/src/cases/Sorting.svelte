<script lang="ts">
	import { Kanban } from "@svar-ui/svelte-kanban";
	import type { KanbanCard, KanbanInstanceApi } from "@svar-ui/svelte-kanban";
	import { DemoPage, ToolbarGroup, SelectBox } from "../ui";
	import { getStyledData, users } from "../data.js";

	// a criterion is a { field, dir } pair or a comparator function
	type SortCriterion =
		| ((a: KanbanCard, b: KanbanCard) => number)
		| { field: string; dir?: "asc" | "desc" }
		| null;

	const { columns, cards } = getStyledData();
	let api = $state<KanbanInstanceApi>();

	const assignedFirst = (a: KanbanCard, b: KanbanCard) =>
		(b.users?.length ?? 0) - (a.users?.length ?? 0) ||
		a.label.localeCompare(b.label);

	const criteria: Record<string, SortCriterion> = {
		"priority-desc": { field: "priority", dir: "desc" },
		"label-asc": { field: "label", dir: "asc" },
		"progress-asc": { field: "progress", dir: "asc" },
		"assigned-first": assignedFirst,
		none: null,
	};
	const options = [
		{ id: "priority-desc", label: "Priority, high first" },
		{ id: "label-asc", label: "Title, A to Z" },
		{ id: "progress-asc", label: "Progress, lowest first" },
		{ id: "assigned-first", label: "Assigned first (comparator)" },
		{ id: "none", label: "Source order" },
	];

	const initial = "priority-desc";
	let sortBy = $state<string | number>(initial);
	// the initial criterion; later changes go through the action
	const sort = criteria[initial];

	function changeSort({ value }: { value: string | number }) {
		api?.exec("sort-cards", { sort: criteria[value] });
	}
</script>

<DemoPage>
	{#snippet toolbar()}
		<ToolbarGroup label="Sort by">
			<SelectBox
				bind:value={sortBy}
				{options}
				width="240px"
				onchange={changeSort}
			/>
		</ToolbarGroup>
	{/snippet}
	<Kanban
		bind:this={api}
		{cards}
		{columns}
		{sort}
		card={{ priority: true, progress: true, users }}
	/>
</DemoPage>
