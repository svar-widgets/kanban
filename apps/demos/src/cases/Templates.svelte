<script lang="ts">
	import { Kanban, Editor } from "@svar-ui/svelte-kanban";
	import CustomCard from "../custom/CustomCard.svelte";
	import { Layout } from "@svar-ui/svelte-layout";
	import { Segmented } from "@svar-ui/svelte-core";
	import { getData, users } from "../data.js";

	const { columns, cards } = getData();
	let api = $state();

	const zoomLevels = [
		{ id: 1, label: "XS" },
		{ id: 2, label: "S" },
		{ id: 3, label: "M" },
		{ id: 4, label: "L" },
		{ id: 5, label: "XL" },
		{ id: 6, label: "Custom" },
	];
	let zoom = $state(3);
	let customCards = $derived(zoom === 6);

	let card = $derived.by(() => {
		switch (zoom) {
			case 1:
				return {};
			case 2:
				return {
					priority: true,
					users,
				};
			case 3:
				return {
					priority: true,
					users,
					progress: true,
					deadline: true,
				};
			case 4:
				return {
					priority: true,
					users,
					progress: { showLabel: true },
					tags: true,
					attachments: true,
					comments: true,
					deadline: true,
				};
			case 5:
				return {
					priority: true,
					progress: { showLabel: true },
					description: true,
					tasks: true,
					users,
					tags: true,
					attachments: true,
					comments: true,
					deadline: true,
				};
		}
	});

</script>



<Layout>
	<Segmented options={zoomLevels} bind:value={zoom} />
	<Kanban
		bind:this={api}
		{cards}
		{columns}
		card={customCards ? undefined : card}
		cardContent={customCards ? CustomCard : undefined}
	/>
	{#if api}<Editor {api} />{/if}
</Layout>
