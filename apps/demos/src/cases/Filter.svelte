<script lang="ts">
	import { getContext } from "svelte";
	import { getData } from "../data.js";
	import { Kanban } from "@svar-ui/svelte-kanban";
	import { Segmented } from "@svar-ui/svelte-core";
	import { Layout, Cell } from "@svar-ui/svelte-layout";
	import {
		Willow,
		WillowDark,
		FilterQuery,
		FilterBar,
		FilterBuilder,
		createFilter,
		getQueryString,
	} from "@svar-ui/svelte-filter";

	const { columns, cards } = getData();
	const helpers = getContext("wx-helpers");

	let api: any;
	let mode = $state("plain");
	let textValue = $state("");

	function onInit(obj: any) {
		api = obj;
	}

	const fields = [
		{
			id: "label",
			label: "Label",
			type: "text",
		},
		{
			id: "description",
			label: "Description",
			type: "text",
		},
		{
			id: "priority",
			label: "Priority",
			type: "number",
		},
		{
			id: "column",
			label: "Column",
			type: "text",
		},
	];

	const url =
		"https://kanban-backend.svar.dev/text-to-json";
	async function text2filter(text, fields) {
		const response = await fetch(url, {
			method: "POST",
			body: JSON.stringify({ text, fields }),
		});
		const json = await response.json();
		if (!response.ok) {
			helpers.showNotice({
				text: json.error || "Request failed",
				type: "danger",
			});
			return null;
		}
		return json;
	}

	async function applyQueryFilter({
		value,
		error,
		text,
		startProgress,
		endProgress,
	}) {
		if (text) {
			error = null;
			try {
				startProgress();
				value = await text2filter(text, fields);
				textValue = value ? getQueryString(value).query : "";
			} catch (e) {
				error = e;
			} finally {
				endProgress();
			}
		}

		if (error) {
			helpers.showNotice({
				text: error.message,
				type: "danger",
			});

			if (error.code !== "NO_DATA") return;
		}

		api.exec("filter-cards", { filter: createFilter(value, {}, fields) });
	}

	function applyFilter({ value }) {
		api.exec("filter-cards", { filter: createFilter(value) });
	}
</script>

<Willow />
<WillowDark />

<Layout preset="space">
	<Segmented
		bind:value={mode}
		options={[
			{ id: "plain", label: "Plain" },
			{ id: "query", label: "Query" },
			{ id: "builder", label: "Builder" },
		]}
	/>
	{#if mode === "plain"}
		<FilterBar debounce={0} fields={[fields[0]]} onchange={applyFilter} />
	{:else if mode === "query"}
		<FilterQuery
			value={textValue}
			{fields}
			onchange={applyQueryFilter}
			placeholder="type your query as plain text"
		/>
	{:else if mode === "builder"}
		<FilterBuilder {fields} type={"line"} onchange={applyFilter} />
	{/if}

	<Cell>
		<Kanban {cards} {columns} init={onInit} />
	</Cell>
</Layout>

<style>
	:global(.wx-filter-bar) {
		width: 100% !important;
	}
</style>
