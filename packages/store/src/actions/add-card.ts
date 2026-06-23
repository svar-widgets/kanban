import { tempID } from "@svar-ui/lib-state";
import type {
	ColumnAccessor,
	ColumnID,
	IKanbanStore,
	KanbanCard,
	StoreActions,
} from "../types";

export default function (store: IKanbanStore, ev: StoreActions["add-card"]) {
	const state = store.getState();
	const { cards, columns, columnAccessor } = state;
	let card: KanbanCard = {
		...ev.card,
		id: ev.id ?? ev.card.id ?? tempID(),
	};
	const columnId = readColumn(card, columnAccessor);
	const hasColumn = columns.some(column => column.id === columnId);

	if (!hasColumn && columns.length) {
		card = writeColumn(card, columnAccessor, columns[0].id);
	}

	const added = cards.add(card, ev.after);
	ev.id = added.id;

	store.setState({
		cards,
		...(ev.edit ? { editorData: { ...added } } : {}),
	});
}

function readColumn(card: KanbanCard, accessor: ColumnAccessor): ColumnID {
	return typeof accessor === "string" ? card[accessor] : accessor.get(card);
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
