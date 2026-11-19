<script lang="ts">
	import { card, getData } from "../data.js";
	import {
		Kanban,
		CardActionMenu,
		CardContextMenu,
		Editor,
		getMenuOptions,
	} from "@svar-ui/svelte-kanban";
	import type { KanbanInstanceApi } from "@svar-ui/svelte-kanban";
	import { DemoPage, useDialogs } from "../ui";

	const { notice } = useDialogs();

	const { columns, cards } = getData();
	let api = $state<KanbanInstanceApi>();

	const options = [
		...getMenuOptions(),
		{ id: "my-action", text: "My action", icon: "wxi-empty" },
	];

	function onclick({ action }: any) {
		if (action.id === "my-action") {
			notice("`My action` clicked", "success");
		}
	}
</script>

<DemoPage>
	<!-- right click anywhere on a card, or the card ⋯ button -->
	<CardContextMenu {api} {options} {onclick}>
		<CardActionMenu {api} {options} {onclick}>
			<Kanban
				bind:this={api}
				{cards}
				{columns}
				card={{ ...card, menu: true }}
			/>
		</CardActionMenu>
	</CardContextMenu>
	{#if api}<Editor {api} />{/if}
</DemoPage>
