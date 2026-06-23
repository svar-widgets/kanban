<script lang="ts">
	import { Kanban } from "@svar-ui/svelte-kanban";
	import { Layout, Cell } from "@svar-ui/svelte-layout";
	import { Switch, Field } from "@svar-ui/svelte-core";
	import { getGeneratedData } from "../data.js";

	const { columns, cards } = getGeneratedData(30);

	let manyColumns = $state(false);
	let manyCards = $state(false);
	let perColumnScroll = $state(true);
	let fixedColumnWidth = $state(false);

	const columnsList = $derived(manyColumns ? columns : columns.slice(0, 3));
	const cardsList = $derived(manyCards ? cards : cards.slice(0, 5));

	const render = $derived({
		columnScroll: perColumnScroll,
		fixedColumnWidth
	});
</script>

<Layout>
	<div style="padding: 10px 10px 0; display: flex; flex-direction: row;">
		<Field label="Fixed column width" position="left">
			<Switch bind:value={fixedColumnWidth} />
		</Field>
		<Field label="More columns" position="left">
			<Switch bind:value={manyColumns} />
		</Field>
		<Field label="More cards" position="left">
			<Switch bind:value={manyCards} />
		</Field>
		<Field label="Per column scroll" position="left">
			<Switch bind:value={perColumnScroll} />
		</Field>
	</div>
	<Cell>
		<Kanban cards={cardsList} columns={columnsList} {render} />
	</Cell>
</Layout>
