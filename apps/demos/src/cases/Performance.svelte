<script lang="ts">
	import { getContext } from "svelte";
	import { Kanban } from "@svar-ui/svelte-kanban";
	import { Layout, Cell } from "@svar-ui/svelte-layout";
	import { Slider, Button, Field } from "@svar-ui/svelte-core";

	const { showNotice } = getContext<{ showNotice: (msg: any) => void }>(
		"wx-helpers"
	);

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
		return 0.75 + (((index * 37 + 13) % 51) / 100);
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
				showNotice({
					type: "info",
					text: `Kanban render: ${duration.toFixed(2)}ms (${data.cards.length} cards, ${data.columns.length} columns)`,
				});
			}, 0);
		});
	}
</script>

<Layout>
	<Cell height={70}>
		<div class="toolbar">
			<Field label={`Columns: ${numColumns}`} type="slider">
				<Slider bind:value={numColumns} min={1} max={100} width="240px" />
			</Field>
			<Field label={`Cards: ${numCards}`} type="slider">
				<Slider bind:value={numCards} min={1} max={100000} width="240px" />
			</Field>
			<Button type="primary" onclick={reload}>Reload</Button>
		</div>
	</Cell>
	<Cell>
		<Kanban cards={data.cards} columns={data.columns} {render} />
	</Cell>
</Layout>

<style>
	.toolbar {
		display: flex;
		gap: 24px;
		padding: 8px 12px;
		align-items: flex-end;
	}
</style>
