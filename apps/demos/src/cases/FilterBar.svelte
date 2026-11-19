<script lang="ts">
	import { Kanban } from "@svar-ui/svelte-kanban";
	import type { KanbanInstanceApi } from "@svar-ui/svelte-kanban";
	import {
		Willow,
		WillowDark,
		FilterBar,
		createFilter,
		type IFilterSet,
	} from "@svar-ui/svelte-filter";
	import { DemoPage, ToolbarGroup } from "../ui";
	import { card, getData } from "../data.js";

	const { columns, cards } = getData();
	let api = $state<KanbanInstanceApi>();

	const fields = [
		{
			type: "text",
			id: "label",
			filter: "contains" as const,
			placeholder: "Search by title",
		},
		{
			type: "number",
			id: "priority",
			placeholder: "Any priority",
			options: [
				{ id: 1, label: "Low" },
				{ id: 2, label: "Medium" },
				{ id: 3, label: "High" },
			],
		},
	];

	// the bar returns a rule set; createFilter turns it into a predicate
	function applyFilter({ value }: { value: IFilterSet }) {
		api?.exec("filter-cards", { filter: createFilter(value) });
	}
</script>

<Willow />
<WillowDark />

<DemoPage>
	{#snippet toolbar()}
		<ToolbarGroup>
			<FilterBar debounce={0} {fields} onchange={applyFilter} />
		</ToolbarGroup>
	{/snippet}
	<Kanban bind:this={api} {cards} {columns} {card} />
</DemoPage>
