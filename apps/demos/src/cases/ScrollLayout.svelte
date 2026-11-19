<script lang="ts">
	import { Kanban } from "@svar-ui/svelte-kanban";
	import { DemoPage, ToolbarGroup, Toggle } from "../ui";

	// enough cards and columns to scroll in both directions
	const columns = Array.from({ length: 10 }, (_, i) => ({
		id: i,
		label: `Column ${i + 1}`,
	}));
	const cards = Array.from({ length: 300 }, (_, i) => ({
		id: i + 1,
		label: `Card ${i + 1}`,
		column: i % 10,
	}));

	let columnScroll = $state(true);
	let fixedColumnWidth = $state(false);
</script>

<DemoPage>
	{#snippet toolbar()}
		<ToolbarGroup>
			<Toggle label="Per column scroll" bind:value={columnScroll} />
			<Toggle label="Fixed column width" bind:value={fixedColumnWidth} />
		</ToolbarGroup>
	{/snippet}
	<Kanban {cards} {columns} render={{ columnScroll, fixedColumnWidth }} />
</DemoPage>
