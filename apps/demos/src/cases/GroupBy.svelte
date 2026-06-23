<script lang="ts">
	import { Kanban } from "@svar-ui/svelte-kanban";
	import type { KanbanCard, KanbanInstanceApi } from "@svar-ui/svelte-kanban";
	import { Field, Select } from "@svar-ui/svelte-core";
	import { Layout, Cell } from "@svar-ui/svelte-layout";
	import { getGroupByData, users } from "../data.js";

	type GroupBy = "stage" | "priority" | "user";
	type SelectChange = { value: string | number };

	const { columns: groupColumns, cards: sourceCards, priorities } = getGroupByData();

	const options = [
		{ id: "stage", label: "By stage" },
		{ id: "priority", label: "By priority" },
		{ id: "user", label: "By person" },
	];

	const card = {
		priority: { data: priorities },
		progress: { showLabel: true },
		description: true,
		users,
		tags: true,
		attachments: true,
		comments: true,
	};

	const userAccessor = {
		get: (card: KanbanCard) => card.user,
		set: (card: KanbanCard, value: string | number) => ({
			...card,
			user: value,
			users: [value],
		}),
	};

	let api = $state<KanbanInstanceApi | undefined>();
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

	function isGroupBy(value: string | number): value is GroupBy {
		return value === "stage" || value === "priority" || value === "user";
	}

	function changeGroup({ value }: SelectChange) {
		if (!isGroupBy(value)) return;

		cards = cloneCards(api?.getCards() ?? cards);
		groupBy = value;
	}
</script>

<Layout>
	<div class="group-toolbar">
		<Field label="Group cards" position="left">
			<Select value={groupBy} {options} onchange={changeGroup} />
		</Field>
	</div>
	<Cell>
		<Kanban bind:this={api} {cards} {columns} {columnAccessor} {card} />
	</Cell>
</Layout>

<style>
	.group-toolbar {
		display: flex;
		align-items: center;
		padding: 10px 10px 0;
	}

	.group-toolbar :global(.wx-select) {
		--wx-input-width: 180px;
	}
</style>
