import type { ColumnAccessor, ColumnID, KanbanCard } from "./types";
export function readMembership(
	card: KanbanCard,
	accessor: ColumnAccessor
): ColumnID {
	return typeof accessor === "string" ? card[accessor] : accessor.get(card);
}
export function writeMembership(
	card: KanbanCard,
	accessor: ColumnAccessor,
	value: ColumnID
): KanbanCard {
	return typeof accessor === "string"
		? { ...card, [accessor]: value }
		: accessor.set({ ...card }, value);
}
