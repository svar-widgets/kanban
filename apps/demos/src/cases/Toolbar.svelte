<script lang="ts">
	import { getData, getStyledData } from "../data.js";
	import { Kanban, Toolbar, Editor } from "@svar-ui/svelte-kanban";
	import { Layout } from "@svar-ui/svelte-layout";

	const { cards } = getStyledData();
	const { columns } = getData();

	let api = $state<any>();
</script>

<Layout>
	<Toolbar {api} sort={true} />
	<Kanban bind:this={api} {cards} {columns} history={true} />
	{#if api}<Editor {api} />{/if}
</Layout>
