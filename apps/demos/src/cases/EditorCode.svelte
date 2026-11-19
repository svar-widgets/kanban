<script lang="ts">
	import { getData } from "../data.js";
	import { Kanban, Editor, registerEditorItem } from "@svar-ui/svelte-kanban";
	import type { KanbanInstanceApi } from "@svar-ui/svelte-kanban";
	import { CodeMirror } from "@svar-ui/svelte-editor";
	import { DemoPage } from "../ui";

	registerEditorItem("code-mirror", CodeMirror);

	const { columns, cards: rawCards } = getData();

	// card descriptions are written in markdown
	const descriptions: Partial<Record<number, string>> = {
		1: `# Kanban spec

Cover the **model**, the **state** and the *data flow*.

- \`KanbanModel\` - columns and cards
- \`CardsStore\` - CRUD and ordering

> Keep the public API surface as small as possible.`,
		2: `## Store

Cards store with a **reactive projection** that builds the view data.

1. CRUD and ordered insertion
2. \`upsert\` for dynamic hydration`,
		3: `Theme variables for the *card* and *column* layout.`,
	};

	const cards = rawCards.map(c => ({
		...c,
		description: descriptions[c.id as number] ?? c.description,
	}));

	let api = $state<KanbanInstanceApi>();

	const items = [
		{ comp: "text", key: "label", label: "Title", required: true },
		{
			comp: "code-mirror",
			key: "description",
			label: "Description",
			language: "markdown",
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
			css="wx-editor-code"
		/>
	{/if}
</DemoPage>

<style>
	:global(.wx-sidearea .wx-editor-kanban.wx-editor-code) {
		width: 640px;
	}
	:global(.wx-editor-code .wx-codemirror .cm-editor) {
		height: 320px;
	}
</style>
