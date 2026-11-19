<script lang="ts">
	import { card, getData } from "../data.js";
	import { Kanban, Editor } from "@svar-ui/svelte-kanban";
	import type { KanbanInstanceApi } from "@svar-ui/svelte-kanban";
	import { DemoPage, useDialogs } from "../ui";

	const { confirm } = useDialogs();
	const { columns, cards } = getData();
	let api = $state<KanbanInstanceApi>();

	// the editor's own buttons are replaced: a title on top, actions below
	const topBar = {
		items: [
			{ comp: "label", text: "Edit card" },
			{ comp: "spacer" },
			{ comp: "icon", icon: "wxi-close", id: "close" },
		],
	};
	const bottomBar = {
		items: [
			{
				comp: "button",
				id: "delete",
				text: "Delete",
				type: "danger",
				onclick: handleDelete,
			},
			{ comp: "spacer" },
			{ comp: "button", id: "close", text: "Cancel" },
			{ comp: "button", id: "save", text: "Done", type: "primary" },
		],
	};

	async function handleDelete() {
		const data = api?.getState().editorData;
		if (!data) return;
		if (!(await confirm("Delete card?", "This action cannot be undone.")))
			return;
		api!.exec("delete-card", { id: data.id });
		api!.exec("select-card", { id: null });
	}

	function onaction({ item, changes }: any) {
		if (item.id === "save" && changes.length === 0)
			api?.exec("select-card", { id: null });
	}
</script>

<DemoPage>
	<Kanban bind:this={api} {cards} {columns} {card} />
	{#if api}
		<Editor {api} {topBar} {bottomBar} autoSave={false} {onaction} />
	{/if}
</DemoPage>
