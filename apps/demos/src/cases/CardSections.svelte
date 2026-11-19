<script lang="ts">
	import { getData, users } from "../data.js";
	import { Kanban, Editor, getEditorItems } from "@svar-ui/svelte-kanban";
	import type { CardShape, KanbanInstanceApi } from "@svar-ui/svelte-kanban";
	import { DemoPage, ToolbarGroup, Choice } from "../ui";

	const { columns, cards } = getData();
	let api = $state<KanbanInstanceApi>();

	// section options: own labels for priorities and tags, a date format
	const priority = {
		data: [
			{ id: 1, label: "Low", css: "wx-card-priority-low" },
			{ id: 2, label: "Normal", css: "wx-card-priority-medium" },
			{ id: 3, label: "Urgent", css: "wx-card-priority-high" },
		],
	};
	const tags = {
		data: [
			{ id: "spec", label: "Spec" },
			{ id: "docs", label: "Docs" },
			{ id: "store", label: "Store" },
			{ id: "ui", label: "UI" },
			{ id: "editor", label: "Editor" },
		],
	};
	const deadline = { format: "%M %d" };

	const levels = [
		{ id: 1, label: "XS" },
		{ id: 2, label: "S" },
		{ id: 3, label: "M" },
		{ id: 4, label: "L" },
		{ id: 5, label: "XL" },
	];
	let level = $state<string | number>(3);

	// each level turns on more CardShape sections
	const shapes: Record<number, CardShape> = {
		1: {
			priority: false,
			progress: false,
			deadline: false,
			tags: false,
			description: false,
		},
		2: {
			priority,
			users,
			progress: false,
			deadline: false,
			tags: false,
			description: false,
		},
		3: {
			priority,
			users,
			progress: true,
			deadline,
			tags: false,
			description: false,
		},
		4: {
			priority,
			users,
			progress: { showLabel: true },
			deadline,
			tags,
			attachments: true,
			comments: true,
			description: false,
		},
		5: {
			cover: true,
			priority,
			users,
			progress: { showLabel: true },
			deadline,
			tags,
			attachments: true,
			comments: true,
			description: true,
		},
	};
	const card = $derived(shapes[Number(level)]);
	// the editor shows every field with the same priority and tag labels
	const items = getEditorItems(shapes[5]);
</script>

<DemoPage>
	{#snippet toolbar()}
		<ToolbarGroup label="Card size">
			<Choice options={levels} bind:value={level} />
		</ToolbarGroup>
	{/snippet}
	<Kanban bind:this={api} {cards} {columns} {card} />
	{#if api}<Editor {api} {items} />{/if}
</DemoPage>
