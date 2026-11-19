<script lang="ts">
	import { Kanban } from "@svar-ui/svelte-kanban";
	import type { KanbanCard } from "@svar-ui/svelte-kanban";
	import { DemoPage, ToolbarGroup, SelectBox, Hint } from "../ui";

	// no columns prop: the board builds one column per distinct "status"
	const options = [
		{ id: "initial", label: "Grouped cards" },
		{ id: "updated", label: "Other statuses" },
		{ id: "ungrouped", label: "Without status" },
	];
	const datasets: Record<string, KanbanCard[]> = {
		initial: [
			{ id: 1, label: "Plan onboarding", status: "To do" },
			{ id: 2, label: "Build search", status: "In progress" },
			{ id: 3, label: "Review navigation", status: "In progress" },
			{ id: 4, label: "Update dependencies", status: "Done" },
			{ id: 5, label: "Write release notes", status: "To do" },
			{ id: 6, label: "Publish API guide", status: "Done" },
		],
		updated: [
			{ id: 1, label: "Plan onboarding", status: "In review" },
			{ id: 3, label: "Review navigation", status: "Done" },
			{ id: 7, label: "Verify help articles", status: "In review" },
			{ id: 8, label: "Answer customer questions", status: "Done" },
		],
		ungrouped: [
			{ id: 9, label: "Capture customer feedback" },
			{ id: 10, label: "Explore new ideas" },
			{ id: 11, label: "Prepare next planning session" },
		],
	};

	let dataset = $state<string | number>("initial");
	const cards = $derived(datasets[dataset]);
</script>

<DemoPage>
	{#snippet toolbar()}
		<ToolbarGroup label="Data">
			<SelectBox bind:value={dataset} {options} />
			<Hint>Columns are generated from the cards.</Hint>
		</ToolbarGroup>
	{/snippet}
	<Kanban {cards} columnAccessor="status" readonly />
</DemoPage>
