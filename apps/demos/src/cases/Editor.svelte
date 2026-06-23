<script lang="ts">
	import { getContext } from "svelte";
	import { getData } from "../data.js";
	import {
		Kanban,
		Editor,
		getEditorItems,
		registerEditorItem,
	} from "@svar-ui/svelte-kanban";
	import type { KanbanInstanceApi } from "@svar-ui/svelte-kanban";
	import { Comments } from "@svar-ui/svelte-comments";
	import { Tasklist } from "@svar-ui/svelte-tasklist";

	const { showModal } = getContext<{
		showModal: (msg: {
			title: string;
			message: string;
		}) => Promise<unknown>;
	}>("wx-helpers");

	registerEditorItem("comments", Comments);
	registerEditorItem("tasks", Tasklist);

	const users = [
		{ id: 1, name: "Alice" },
		{ id: 2, name: "Bob" },
		{ id: 3, name: "Carol" },
	];

	const { columns, cards: rawCards } = getData();

	const today = new Date();
	const dayOffset = (days: number, h = 10, m = 0) => {
		const d = new Date(today);
		d.setDate(d.getDate() + days);
		d.setHours(h, m, 0, 0);
		return d;
	};

	const cards = rawCards.map(c => {
		if (c.id === 1) {
			return {
				...c,
				comments: [
					{
						id: 1,
						user: 2,
						content: "Agenda is ready, let's align on priorities.",
						date: dayOffset(-1, 10, 0),
					},
					{
						id: 2,
						user: 3,
						content: "I'll review the draft this afternoon.",
						date: dayOffset(-1, 14, 30),
					},
				],
				tasks: [
					{ id: 1, content: "Outline data flow", status: 1 },
					{ id: 2, content: "Describe state shape", status: 1 },
					{ id: 3, content: "Add diagrams", status: 0 },
					{ id: 4, content: "Review with team", status: 0 },
				],
			};
		}
		if (c.id === 2) {
			return {
				...c,
				comments: [],
				tasks: [
					{ id: 1, content: "Draft store API", status: 0 },
					{ id: 2, content: "Wire reactive projection", status: 0 },
				],
			};
		}
		return { ...c, comments: [], tasks: [] };
	});

	let api = $state<KanbanInstanceApi>();

	function getDefaultEditorItem(key: string) {
		const item = getEditorItems().find(item => item.key === key);
		if (!item) throw new Error(`Default editor item not found: ${key}`);
		return item;
	}

	const priorityItem = getDefaultEditorItem("priority");
	const progressItem = getDefaultEditorItem("progress");

	const items = [
		{
			comp: "text",
			key: "label",
			label: "Title",
			column: "left",
			required: true,
		},
		{
			comp: "textarea",
			key: "description",
			label: "Description",
			column: "left",
		},
		{
			...priorityItem,
			column: "right",
			required: true,
		},
		{
			...progressItem,
			column: "right",
		},
		{
			key: "comments",
			comp: "comments",
			label: "Comments",
			users,
			activeUser: 1,
			column: "left",
		},
		{
			key: "tasks",
			comp: "tasks",
			label: "Checklist",
			column: "right",
		},
	];

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
			{
				comp: "button",
				id: "close",
				text: "Cancel",
				type: "default",
			},
			{
				comp: "button",
				id: "save",
				text: "Done",
				type: "primary",
			},
		],
	};

	async function handleDelete() {
		if (!api) return;
		const data = api.getState().editorData;
		if (!data) return;
		try {
			await showModal({
				title: "Delete card?",
				message: "This action cannot be undone.",
			});
		} catch {
			return;
		}
		api.exec("delete-card", { id: data.id });
		api.exec("select-card", { id: null });
	}

	function handleAction({ item, changes }: any) {
		if (item.id === "save" && changes.length === 0) {
			api?.exec("select-card", { id: null });
		}
	}

	$effect(() => {
		if (api) api.exec("select-card", { id: 1 });
	});
</script>

<Kanban bind:this={api} {cards} {columns} />
{#if api}
	<Editor
		{api}
		{items}
		{bottomBar}
		topBar={false}
		autoSave={false}
		placement="modal"
		layout="columns"
		onaction={handleAction}
		css="wx-editor-custom" />
{/if}

<style>
	:global(div.wx-panel.wx-editor-custom) {
		padding: 20px 20px 16px 20px;
		min-width: 520px;
	}
	:global(.wx-editor-custom .wx-content .wx-right) {
		margin-left: 0px;
		min-height: auto;
	}
	:global(.wx-editor-custom .wx-sections > div:last-child .wx-field) {
		margin-bottom: 4px;
	}
	:global(.wx-editor-custom .wx-comments-list) {
		min-height: 250px;
		max-height: 370px;
	}
	:global(.wx-editor-custom .wx-tasks-list) {
		max-height: 300px;
	}
</style>
