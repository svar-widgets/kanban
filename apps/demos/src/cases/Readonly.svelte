<script lang="ts">
	import { card, getData } from "../data.js";
	import { Kanban, Editor } from "@svar-ui/svelte-kanban";
	import type { KanbanInstanceApi } from "@svar-ui/svelte-kanban";
	import { DemoPage, ToolbarGroup, Toggle, Hint } from "../ui";

	const { columns, cards } = getData();
	let api = $state<KanbanInstanceApi>();
	let readonly = $state(true);

	// readonly blocks opening the editor, but keeps an already open one
	// mounted, so the sample closes it when switching readonly on
	function toggle({ value }: { value: boolean }) {
		if (value) api?.exec("select-card", { id: null });
	}
</script>

<DemoPage>
	{#snippet toolbar()}
		<ToolbarGroup>
			<Toggle label="Readonly" bind:value={readonly} onchange={toggle} />
			<Hint>Drag, add and edit are blocked; columns still collapse.</Hint>
		</ToolbarGroup>
	{/snippet}
	<Kanban bind:this={api} {cards} {columns} {card} {readonly} />
	{#if api}<Editor {api} />{/if}
</DemoPage>
