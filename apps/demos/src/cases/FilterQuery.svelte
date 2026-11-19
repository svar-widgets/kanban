<script lang="ts">
	import { Kanban } from "@svar-ui/svelte-kanban";
	import type { KanbanInstanceApi } from "@svar-ui/svelte-kanban";
	import {
		Willow,
		WillowDark,
		FilterQuery,
		createFilter,
		getQueryString,
		type FilterQueryEvent,
		type IField,
		type IFilterSet,
	} from "@svar-ui/svelte-filter";
	import { DemoPage, ToolbarGroup, useDialogs } from "../ui";
	import { card, getData } from "../data.js";

	const { columns, cards } = getData();
	const { notice } = useDialogs();
	let api = $state<KanbanInstanceApi>();
	let query = $state("");

	const fields: IField[] = [
		{ id: "label", label: "Title", type: "text" },
		{ id: "description", label: "Description", type: "text" },
		{ id: "priority", label: "Priority", type: "number" },
		{ id: "deadline", label: "Deadline", type: "date" },
	];

	// free text is turned into a filter by the SVAR text-to-filter service
	const url = "https://filter-backend.svar.dev/text-to-json";
	async function textToFilter(text: string): Promise<IFilterSet | null> {
		const response = await fetch(url, {
			method: "POST",
			body: JSON.stringify({ text, fields }),
		});
		const json = await response.json();
		if (!response.ok) {
			notice(json.error || "Request failed", "danger");
			return null;
		}
		return json;
	}

	async function applyQuery(ev: FilterQueryEvent) {
		let value = ev.value as IFilterSet | null;
		let error: { message?: string; code?: string } | null | undefined =
			ev.error;

		if (ev.text) {
			error = null;
			try {
				ev.startProgress();
				value = await textToFilter(ev.text);
				query = value ? getQueryString(value).query : "";
			} catch (e) {
				error = e as Error;
			} finally {
				ev.endProgress();
			}
		}

		if (error) {
			notice(error.message ?? "Invalid query", "danger");
			if (error.code !== "NO_DATA") return;
		}

		api?.exec("filter-cards", {
			filter: value ? createFilter(value, {}, fields) : null,
		});
	}
</script>

<Willow />
<WillowDark />

<DemoPage>
	{#snippet toolbar()}
		<ToolbarGroup>
			<div class="query">
				<FilterQuery
					value={query}
					{fields}
					onchange={applyQuery}
					placeholder="Type a query as plain text, e.g. high priority tasks"
				/>
			</div>
		</ToolbarGroup>
	{/snippet}
	<Kanban bind:this={api} {cards} {columns} {card} />
</DemoPage>

<style>
	.query {
		width: 480px;
		max-width: 100%;
	}
</style>
