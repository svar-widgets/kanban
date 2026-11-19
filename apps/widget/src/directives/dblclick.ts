import { writeMembership } from "@svar-ui/kanban-store";
import type { ColumnAccessor, ColumnID, KanbanCard } from "@svar-ui/kanban-store";
import type { KanbanContextApi } from "../types.js";

export type DblClickAddCardParams = {
	store: KanbanContextApi;
	column: ColumnID;
	columnAccessor: ColumnAccessor;
	readonly?: boolean;
	swimlane?: ColumnID;
};

export function dblclick(node: HTMLElement, initial: DblClickAddCardParams) {
	let params = initial;

	function onDblClick(e: MouseEvent) {
		if (params.readonly) return;
		if (e.target !== node) return;

		const base = { label: "New card" } as unknown as KanbanCard;
		let card = createColumnCard(base, params.columnAccessor, params.column);
		if (params.swimlane !== undefined)
			card = createColumnCard(
				card,
				params.store.getState().swimlaneAccessor,
				params.swimlane
			);

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
	card: Partial<KanbanCard>,
	accessor: ColumnAccessor,
	column: ColumnID
): Partial<KanbanCard> {
	return writeMembership(card as KanbanCard, accessor, column);
}
