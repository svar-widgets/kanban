import type {
	ColumnAccessor,
	ColumnID,
	IKanbanStore,
	KanbanCard,
	StoreActions,
} from "../types";

export default function (
	store: IKanbanStore,
	ev: StoreActions["provide-data"]
) {
	const { cards, columns, columnAccessor, columnData } = store.getState();

	if (ev.id) {
		if (!columns.some(column => column.id === ev.id)) {
			return;
		}

		ev.cards.forEach(card => {
			cards.upsert(writeColumn(card, columnAccessor, ev.id!));
		});

		const next = new Map(columnData);
		next.set(ev.id, { status: "loaded" });
		store.setState({ cards, columnData: next });
	} else {
		ev.cards.forEach(card => {
			cards.upsert(card);
		});

		store.setState({ cards });
	}
}

function writeColumn(
	card: KanbanCard,
	accessor: ColumnAccessor,
	column: ColumnID
): KanbanCard {
	return typeof accessor === "string"
		? { ...card, [accessor]: column }
		: accessor.set(card, column);
}
