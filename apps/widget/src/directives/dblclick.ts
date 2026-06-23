import type { ColumnAccessor, ColumnID, KanbanCard } from "@svar-ui/kanban-store";
import type { KanbanContextApi } from "../types.js";

export type DblClickAddCardParams = {
	store: KanbanContextApi;
	column: ColumnID;
	columnAccessor: ColumnAccessor;
	readonly?: boolean;
};

export function dblclick(node: HTMLElement, initial: DblClickAddCardParams) {
	let params = initial;

	function onDblClick(e: MouseEvent) {
		if (params.readonly) return;
		if (e.target !== node) return;

		const base = { label: "New card" } as unknown as KanbanCard;
		const card = createColumnCard(base, params.columnAccessor, params.column);

		void params.store.exec("add-card", { card });
	}

	node.addEventListener("dblclick", onDblClick);

	return {
		update(next: DblClickAddCardParams) {
			params = next;
		},
		destroy() {
			node.removeEventListener("dblclick", onDblClick);
		},
	};
}

export function createColumnCard(
	card: KanbanCard,
	accessor: ColumnAccessor,
	column: ColumnID
): KanbanCard {
	return typeof accessor === "string"
		? { ...card, [accessor]: column }
		: accessor.set(card, column);
}
