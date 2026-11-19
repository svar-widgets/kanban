<script lang="ts">
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
	import { DemoPage } from "../ui";

	// any component with a value/onchange pair can be an editor item
	registerEditorItem("comments", Comments);
	registerEditorItem("tasks", Tasklist);

	const users = [
		{ id: 1, name: "Alice" },
		{ id: 2, name: "Bob" },
		{ id: 3, name: "Carol" },
	];

	const { columns, cards: rawCards } = getData();

	const daysAgo = (days: number, h: number) => {
		const d = new Date();
		d.setDate(d.getDate() - days);
		d.setHours(h, 0, 0, 0);
		return d;
	};

	const cards = rawCards.map(c => ({
		...c,
		comments:
			c.id === 1
				? [
						{
							id: 1,
							user: 2,
							content: "Agenda is ready.",
							date: daysAgo(1, 10),
						},
						{
							id: 2,
							user: 3,
							content: "I'll review the draft.",
							date: daysAgo(1, 14),
						},
					]
				: [],
		tasks:
			c.id === 1
				? [
						{ id: 1, content: "Outline data flow", status: 1 },
						{ id: 2, content: "Add diagrams", status: 0 },
					]
				: [],
	}));

	let api = $state<KanbanInstanceApi>();

	const items = [
		...getEditorItems(),
		{ key: "tasks", comp: "tasks", label: "Checklist" },
		{
			key: "comments",
			comp: "comments",
			label: "Comments",
			users,
			activeUser: 1,
		},
	];

	$effect(() => {
		if (api) api.exec("select-card", { id: 1 });
	});
</script>

<DemoPage>
	<Kanban bind:this={api} {cards} {columns} />
	{#if api}<Editor {api} {items} />{/if}
</DemoPage>
