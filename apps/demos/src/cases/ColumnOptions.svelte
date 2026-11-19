<script lang="ts">
	import { Kanban } from "@svar-ui/svelte-kanban";
	import type { ColumnConfig } from "@svar-ui/svelte-kanban";
	import { DemoPage, ToolbarGroup, Hint } from "../ui";
	import { getData } from "../data.js";

	const { cards } = getData();

	// per-column options: a fixed width, an initially collapsed column and
	// columns without the "+" add-card button
	const columns: ColumnConfig[] = [
		{ id: "backlog", label: "Backlog", collapsed: true },
		{ id: "todo", label: "To Do", width: 360 },
		{ id: "doing", label: "In Progress", addCard: false },
		{ id: "done", label: "Done", addCard: false },
	];
</script>

<DemoPage>
	{#snippet toolbar()}
		<ToolbarGroup>
			<Hint>
				"To Do" is 360px wide, "Backlog" starts collapsed. Double-click an empty
				place in any column to add a card; addCard: false only hides the "+"
				button.
			</Hint>
		</ToolbarGroup>
	{/snippet}
	<Kanban {cards} {columns} />
</DemoPage>
