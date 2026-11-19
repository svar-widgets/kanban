<script lang="ts">
	import { card, getData } from "../data.js";
	import { Kanban, Editor, getEditorItems } from "@svar-ui/svelte-kanban";
	import type { KanbanInstanceApi } from "@svar-ui/svelte-kanban";
	import { DemoPage, ToolbarGroup, Choice, Toggle, Hint } from "../ui";

	const { columns, cards } = getData();
	let api = $state<KanbanInstanceApi>();

	const placements = [
		{ id: "sidebar", label: "Sidebar" },
		{ id: "modal", label: "Modal" },
		{ id: "inline", label: "Inline" },
		{ id: "fullscreen", label: "Fullscreen" },
	];
	let placement = $state<string | number>("sidebar");
	let columnsLayout = $state(false);

	// in the columns layout, text fields go left and the rest right
	const items = getEditorItems(card).map(item => ({
		...item,
		column:
			item.key === "label" || item.key === "description" ? "left" : "right",
	}));
</script>

<DemoPage>
	{#snippet toolbar()}
		<ToolbarGroup label="Placement">
			<Choice options={placements} bind:value={placement} />
		</ToolbarGroup>
		<ToolbarGroup>
			<Toggle label="Columns layout" bind:value={columnsLayout} />
		</ToolbarGroup>
		<ToolbarGroup>
			<Hint>Click a card to open the editor</Hint>
		</ToolbarGroup>
	{/snippet}
	<div class="area">
		<Kanban bind:this={api} {cards} {columns} {card} />
		{#if api}
			{#key placement}
				<Editor
					{api}
					{items}
					placement={placement as string}
					layout={columnsLayout ? "columns" : "default"}
				/>
			{/key}
		{/if}
	</div>
</DemoPage>

<style>
	/* an inline editor takes its place next to the board */
	.area {
		position: relative;
		display: flex;
		flex: 1;
		min-height: 0;
	}
	.area :global(.wx-kanban) {
		flex: 1;
		min-width: 0;
	}
</style>
