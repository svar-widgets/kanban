<script lang="ts">
	import { getData } from "../data.js";
	import { Kanban, Editor, CardActionMenu } from "@svar-ui/svelte-kanban";
	import type { KanbanInstanceApi } from "@svar-ui/svelte-kanban";
	import CustomCard from "../custom/CustomCard.svelte";
	import { DemoPage } from "../ui";

	const { columns, cards } = getData();
	let api = $state<KanbanInstanceApi>();
</script>

<DemoPage>
	<!-- CustomCard renders the whole card body; its CardMenuButton
	     opens this CardActionMenu -->
	<CardActionMenu {api}>
		<Kanban bind:this={api} {cards} {columns} cardContent={CustomCard} />
	</CardActionMenu>
	{#if api}<Editor {api} />{/if}
</DemoPage>
