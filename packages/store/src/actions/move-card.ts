import type {
	ColumnAccessor,
	ColumnID,
	IKanbanStore,
	KanbanCard,
	StoreActions,
} from "../types";

export default function (store: IKanbanStore, ev: StoreActions["move-card"]) {
	const state = store.getState();
	const { cards, columns, columnAccessor } = state;
	const card = cards.getById(ev.id);

	if (!card) {
		return;
	}

	const currentColumn = readColumn(card, columnAccessor);
	const targetColumn = ev.column ?? currentColumn;

	if (
		ev.column !== undefined &&
		!columns.some(column => column.id === targetColumn)
	) {
		return;
	}

	if (ev.before != null) {
		const beforeCard = cards.getById(ev.before);
		const beforeColumn =
			ev.before === ev.id
				? targetColumn
				: beforeCard && readColumn(beforeCard, columnAccessor);

		if (!beforeCard || beforeColumn !== targetColumn) {
			return;
		}
	}

	if (targetColumn !== currentColumn) {
		const nextCard = writeColumn(card, columnAccessor, targetColumn);
		cards.update(ev.id, nextCard);
	}

	if (cards.move(ev.id, ev.before)) {
		store.setState({ cards });
	}
}

function readColumn(card: KanbanCard, accessor: ColumnAccessor): ColumnID {
	return typeof accessor === "string" ? card[accessor] : accessor.get(card);
}

function writeColumn(
	card: KanbanCard,
	accessor: ColumnAccessor,
	column: ColumnID
): Partial<KanbanCard> {
	return typeof accessor === "string"
		? { [accessor]: column }
		: accessor.set(card, column);
}
