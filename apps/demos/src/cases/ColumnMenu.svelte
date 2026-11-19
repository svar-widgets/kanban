<script lang="ts">
	import { card, getData } from "../data.js";
	import {
		Kanban,
		Editor,
		CardContextMenu,
		ColumnActionMenu,
		ColumnContextMenu,
		getColumnMenuOptions,
		type ColumnMenuContext,
	} from "@svar-ui/svelte-kanban";
	import { DemoPage, useDialogs } from "../ui";

	const { notice } = useDialogs();

	const data = getData();
	const cards = data.cards;
	// the header ⋯ button is per column; right click works on every header
	const columns = data.columns.map(c => ({ ...c, menu: true, addCard: false }));
	let api = $state<any>();

	// called on every open, so items follow the current column content
	function columnOptions(ctx: ColumnMenuContext) {
		const items: any[] = getColumnMenuOptions();
		if (ctx.cards.length) {
			items.push(
				{ comp: "separator" },
				{
					id: "clear-column",
					text: `Delete ${ctx.cards.length} card(s)`,
					icon: "wxi-delete",
				}
			);
		}
		if (ctx.column.id === "done") {
			items.push({ id: "archive", text: "Archive done", icon: "wxi-empty" });
		}
		return items;
	}

	function onColumnClick({ action, context }: any) {
		if (action.id === "clear-column") {
			context.cards.forEach((c: any) => api.exec("delete-card", { id: c.id }));
		} else if (action.id === "archive") {
			notice("`Archive done` clicked", "success");
		}
	}
</script>

<DemoPage>
	<!-- menus nest: each opens only for its own targets -->
	<CardContextMenu {api}>
		<ColumnContextMenu {api} options={columnOptions} onclick={onColumnClick}>
			<ColumnActionMenu {api} options={columnOptions} onclick={onColumnClick}>
				<Kanban bind:this={api} {cards} {columns} {card} />
			</ColumnActionMenu>
		</ColumnContextMenu>
	</CardContextMenu>
	{#if api}<Editor {api} />{/if}
</DemoPage>
