<script lang="ts">
	import { Kanban } from "@svar-ui/svelte-kanban";
	import {
		DemoPage,
		ToolbarGroup,
		RangeInput,
		Button,
		useDialogs,
	} from "../ui";

	const { notice } = useDialogs();

	const render = {
		columnScroll: false,
		virtualizeCards: true,
		virtualizeColumns: true,
	};

	let numColumns = $state(5);
	let numCards = $state(3000);
	// svelte-ignore state_referenced_locally
	let data = $state(generate(numColumns, numCards));

	function getColumnWeight(index: number) {
		// Deterministic spread keeps the demo stable while avoiding equal-height columns.
		return 0.75 + ((index * 37 + 13) % 51) / 100;
	}

	function splitCardsByColumn(columnsCount: number, totalCards: number) {
		if (columnsCount <= 0) return [];

		const weights = Array.from({ length: columnsCount }, (_, i) =>
			getColumnWeight(i)
		);
		const totalWeight = weights.reduce((sum, weight) => sum + weight, 0);
		const exactCounts = weights.map(
			weight => (totalCards * weight) / totalWeight
		);
		const counts = exactCounts.map(count => Math.floor(count));
		const remaining =
			totalCards - counts.reduce((sum, count) => sum + count, 0);
		const remainders = exactCounts
			.map((count, index) => ({
				index,
				remainder: count - counts[index],
			}))
			.sort((a, b) => b.remainder - a.remainder);

		for (let i = 0; i < remaining; i++) {
			counts[remainders[i].index] += 1;
		}

		return counts;
	}

	function generate(columnsCount: number, totalCards: number) {
		const columns = Array.from({ length: columnsCount }, (_, i) => ({
			id: `col-${i + 1}`,
			label: `Column ${i + 1}`,
		}));
		const cardCounts = splitCardsByColumn(columnsCount, totalCards);
		let nextId = 1;
		const cards = columns.flatMap((column, columnIndex) =>
			Array.from({ length: cardCounts[columnIndex] }, () => {
				const id = nextId++;
				const userId = ((id - 1) % 5) + 1;

				return {
					id,
					label: `Generated card ${id}`,
					description: `Generated card ${id} in ${column.label}`,
					column: column.id,
					priority: ((id - 1) % 3) + 1,
					progress: (((id - 1) % 10) + 1) / 10,
					tags: [`group-${columnIndex + 1}`],
					users: [{ id: userId, name: `User ${userId}` }],
				};
			})
		);
		return { columns, cards };
	}

	function reload() {
		const start = performance.now();
		data = generate(numColumns, numCards);
		requestAnimationFrame(() => {
			setTimeout(() => {
				const duration = performance.now() - start;
				notice(
					`Kanban render: ${duration.toFixed(2)}ms (${data.cards.length} cards, ${data.columns.length} columns)`
				);
			}, 0);
		});
	}
</script>

<DemoPage>
	{#snippet toolbar()}
		<ToolbarGroup label="Data">
			<RangeInput label="Columns" bind:value={numColumns} min={1} max={100} />
			<RangeInput label="Cards" bind:value={numCards} min={1} max={100000} />
		</ToolbarGroup>
		<ToolbarGroup align="right">
			<Button type="primary" onclick={reload}>Reload</Button>
		</ToolbarGroup>
	{/snippet}
	<Kanban cards={data.cards} columns={data.columns} {render} />
</DemoPage>
