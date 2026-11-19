<script lang="ts">
	import { Kanban } from "@svar-ui/svelte-kanban";
	import { DemoPage, ToolbarGroup, Toggle } from "../ui";

	let stack = $state(true);
	let virtual = $state(true);

	const columns = [
		{ id: "backlog", label: "Backlog" },
		{ id: "todo", label: "To do" },
		{ id: "doing", label: "In progress" },
		{ id: "done", label: "Done", collapsed: true },
	];
	const cards = Array.from({ length: 450 }, (_, i) => ({
		id: i,
		label: `Task ${i + 1}`,
		column: columns[i % 4].id,
		description: i % 3 ? "Plan, review, and deliver the next improvement." : "",
		priority: (i % 3) + 1,
	}));
</script>

<DemoPage>
	{#snippet toolbar()}
		<ToolbarGroup>
			<Toggle label="Stack layout" bind:value={stack} />
			<Toggle label="Virtualize cards" bind:value={virtual} />
		</ToolbarGroup>
	{/snippet}
	<Kanban
		{cards}
		{columns}
		card={{ priority: true, description: true }}
		render={{ layout: stack ? "stack" : "board", virtualizeCards: virtual }}
	/>
</DemoPage>
