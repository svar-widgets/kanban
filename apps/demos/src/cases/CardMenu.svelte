<script lang="ts">
	import { getContext } from "svelte";
	import { card, getData } from "../data.js";
	import {
		Kanban,
		ContextMenu,
		Editor,
		getMenuOptions,
	} from "@svar-ui/svelte-kanban";

	const helpers = getContext<any>("wx-helpers");

	const { columns, cards } = getData();
	let api = $state<any>();

	const options = [
		...getMenuOptions(),
		{ id: "my-action", text: "My action", icon: "wxi-empty" },
	];

	function onclick({ action }: any) {
		if (action.id === "my-action") {
			helpers.showNotice({ text: "`My action` clicked", type: "success" });
		}
	}
</script>

<ContextMenu {api} {options} {onclick}>
	<Kanban
		bind:this={api}
		{cards}
		{columns}
		card={{ ...card, menu: { options, onclick } }}
	/>
</ContextMenu>
{#if api}<Editor {api} />{/if}
