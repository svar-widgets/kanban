<script lang="ts">
	import { card, getData } from "../data.js";
	import { Kanban, Editor } from "@svar-ui/svelte-kanban";
	import type {
		ColumnConfig,
		ColumnID,
		KanbanInstanceApi,
		StoreActions,
	} from "@svar-ui/svelte-kanban";
	import { DemoPage, ToolbarGroup, Hint, useDialogs } from "../ui";

	const { notice } = useDialogs();
	const data = getData();
	const cards = data.cards;
	// wipLimit is a custom column field; the board itself ignores it
	const columns: ColumnConfig[] = data.columns.map(c =>
		c.id === "doing" ? { ...c, label: "In Progress (max 3)", wipLimit: 3 } : c
	);
	let api = $state<KanbanInstanceApi>();

	// moves that skip a stage are not allowed
	const forbidden: Record<string, ColumnID> = { todo: "done" };

	function init(value: KanbanInstanceApi) {
		api = value;

		// returning false cancels the action
		api.intercept("move-card", ev => {
			const { id, column: to } = ev as StoreActions["move-card"];
			const all = api!.getCards();
			const from = all.find(c => c.id === id)?.column;
			if (!to || to === from) return;

			if (forbidden[from as string] === to) {
				notice("Move the card to In Progress first", "warning");
				return false;
			}
			const limit = columns.find(c => c.id === to)?.wipLimit;
			if (limit && all.filter(c => c.column === to).length >= limit) {
				notice(`Only ${limit} cards are allowed in this column`, "warning");
				return false;
			}
		});

		// intercept can also change the payload before the action runs
		api.intercept("add-card", ev => {
			const { card } = ev as StoreActions["add-card"];
			card.priority ??= 2;
		});
	}
</script>

<DemoPage>
	{#snippet toolbar()}
		<ToolbarGroup>
			<Hint>
				To Do cannot go straight to Done; In Progress takes at most 3 cards; new
				cards get medium priority.
			</Hint>
		</ToolbarGroup>
	{/snippet}
	<Kanban {init} {cards} {columns} {card} />
	{#if api}<Editor {api} />{/if}
</DemoPage>
