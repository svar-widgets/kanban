<script lang="ts">
	import { Kanban } from "@svar-ui/svelte-kanban";
	import type { KanbanInstanceApi } from "@svar-ui/svelte-kanban";
	import {
		Willow,
		WillowDark,
		FilterBuilder,
		createFilter,
		getOptionsMap,
		type IField,
		type IFilterSet,
	} from "@svar-ui/svelte-filter";
	import { DemoPage, ToolbarGroup } from "../ui";
	import { card, getData } from "../data.js";

	const { columns, cards } = getData();
	let api = $state<KanbanInstanceApi>();

	const fields: IField[] = [
		{ id: "label", label: "Title", type: "text" },
		{ id: "description", label: "Description", type: "text" },
		{ id: "priority", label: "Priority", type: "number" },
		{ id: "deadline", label: "Deadline", type: "date" },
	];

	// values offered for each field, collected from the cards
	const options = getOptionsMap(cards, fields);

	function applyFilter({ value }: { value: IFilterSet }) {
		api?.exec("filter-cards", { filter: createFilter(value, {}, fields) });
	}
</script>

<Willow />
<WillowDark />

<DemoPage>
	{#snippet toolbar()}
		<ToolbarGroup>
			<FilterBuilder {fields} {options} type="line" onchange={applyFilter} />
		</ToolbarGroup>
	{/snippet}
	<Kanban bind:this={api} {cards} {columns} {card} />
</DemoPage>
