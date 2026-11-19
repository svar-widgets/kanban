<script lang="ts">
	import { Kanban } from "@svar-ui/svelte-kanban";
	import type { KanbanCard, KanbanInstanceApi } from "@svar-ui/svelte-kanban";
	import { DemoPage, ToolbarGroup, SelectBox } from "../ui";
	import { getGroupByData, users } from "../data.js";

	type GroupBy = "stage" | "priority" | "user";

	const {
		columns: groupColumns,
		cards: sourceCards,
		priorities,
	} = getGroupByData();

	const options = [
		{ id: "stage", label: "Stage" },
		{ id: "priority", label: "Priority" },
		{ id: "user", label: "Person" },
	];

	const card = {
		priority: { data: priorities },
		progress: { showLabel: true },
		description: true,
		users,
		tags: true,
	};

	// a field name or a get/set pair maps cards to columns; moving a card
	// between "person" columns writes both fields
	const userAccessor = {
		get: (card: KanbanCard) => card.user,
		set: (card: KanbanCard, value: string | number) => ({
			...card,
			user: value,
			users: [value],
		}),
	};

	let api = $state<KanbanInstanceApi>();
	let groupBy = $state<GroupBy>("stage");
	let cards = $state.raw<KanbanCard[]>(cloneCards(sourceCards));

	const columns = $derived(groupColumns[groupBy]);
	const columnAccessor = $derived(groupBy === "user" ? userAccessor : groupBy);

	function cloneCards(items: KanbanCard[]): KanbanCard[] {
		return items.map(card => ({
			...card,
			tags: Array.isArray(card.tags) ? [...card.tags] : card.tags,
			users: Array.isArray(card.users) ? [...card.users] : card.users,
		}));
	}

	function changeGroup({ value }: { value: string | number }) {
		// keep the edits made under the previous grouping
		cards = cloneCards(api?.getCards() ?? cards);
		groupBy = value as GroupBy;
	}
</script>

<DemoPage>
	{#snippet toolbar()}
		<ToolbarGroup label="Group by">
			<SelectBox value={groupBy} {options} onchange={changeGroup} />
		</ToolbarGroup>
	{/snippet}
	<Kanban bind:this={api} {cards} {columns} {columnAccessor} {card} />
</DemoPage>
