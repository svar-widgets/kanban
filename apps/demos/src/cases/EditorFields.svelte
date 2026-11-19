<script lang="ts">
	import { card, getData } from "../data.js";
	import { Kanban, Editor, getEditorItems } from "@svar-ui/svelte-kanban";
	import type { KanbanInstanceApi } from "@svar-ui/svelte-kanban";
	import { DemoPage } from "../ui";

	const { columns, cards } = getData();
	let api = $state<KanbanInstanceApi>();

	// the default fields for the card shape, priority made required
	const items = [
		...getEditorItems(card).map(item =>
			item.key === "priority" ? { ...item, required: true } : item
		),
		{ comp: "text", key: "estimate", label: "Estimate, hours" },
	];

	// with autoSave off, changes are applied by the Save button
	const topBar = {
		items: [
			{ comp: "icon", icon: "wxi-close", id: "close" },
			{ comp: "spacer" },
			{ comp: "button", id: "save", text: "Save", type: "primary" },
		],
	};

	function onaction({ item, changes }: any) {
		if (item.id === "save" && changes.length === 0)
			api?.exec("select-card", { id: null });
	}
</script>

<DemoPage>
	<Kanban bind:this={api} {cards} {columns} {card} />
	{#if api}
		<Editor {api} {items} {topBar} autoSave={false} {onaction} />
	{/if}
</DemoPage>
