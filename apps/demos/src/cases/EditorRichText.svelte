<script lang="ts">
	import { getData } from "../data.js";
	import { Kanban, Editor, registerEditorItem } from "@svar-ui/svelte-kanban";
	import type { KanbanInstanceApi } from "@svar-ui/svelte-kanban";
	import { TinyMCE } from "@svar-ui/svelte-editor";
	import { DemoPage } from "../ui";

	registerEditorItem("tinymce", TinyMCE);

	const { columns, cards: rawCards } = getData();

	const details: Partial<Record<number, string>> = {
		1: `<h3>Kanban spec</h3>
<p>Cover the <strong>model</strong>, the <strong>state</strong> and the <em>data flow</em>.</p>
<p>Keep the public API surface as small as possible.</p>`,
		2: `<p>Cards store with a <strong>reactive projection</strong> that builds the view data.</p>`,
		3: `<p>Theme variables for the card and column layout.</p>`,
	};

	const cards = rawCards.map(c => ({
		...c,
		details: details[c.id as number] ?? "",
	}));

	let api = $state<KanbanInstanceApi>();

	const items = [
		{ comp: "text", key: "label", label: "Title", required: true },
		{
			comp: "tinymce",
			key: "details",
			label: "Details",
			toolbar:
				"undo redo | blocks | bold italic underline | alignleft aligncenter alignright",
		},
	];

	const topBar = {
		items: [
			{ comp: "icon", icon: "wxi-close", id: "close" },
			{ comp: "spacer" },
			{ comp: "button", id: "save", text: "Save", type: "primary" },
		],
	};

	function handleAction({ item, changes }: any) {
		if (item.id === "save" && changes.length === 0)
			api?.exec("select-card", { id: null });
	}

	$effect(() => {
		if (api) api.exec("select-card", { id: 1 });
	});
</script>

<DemoPage>
	<Kanban bind:this={api} {cards} {columns} />
	{#if api}
		<Editor
			{api}
			{items}
			{topBar}
			autoSave={false}
			onaction={handleAction}
			css="wx-editor-rich"
		/>
	{/if}
</DemoPage>

<style>
	:global(.wx-sidearea .wx-editor-kanban.wx-editor-rich) {
		width: 640px;
	}
</style>
