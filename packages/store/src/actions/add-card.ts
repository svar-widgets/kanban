import { readMembership, writeMembership } from "../accessor";
import { tempID } from "@svar-ui/lib-state";
import type {
	CardID,
	IData,
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
	const columnId = readMembership(card, columnAccessor);
	const hasColumn = columns.some(column => column.id === columnId);

	if (!hasColumn && columns.length) {
		card = writeMembership(card, columnAccessor, columns[0].id);
	}

	if (
		state.swimlanes.length &&
		!state.swimlanes.some(
			lane => lane.id === readMembership(card, state.swimlaneAccessor)
		)
	) {
		card = writeMembership(card, state.swimlaneAccessor, state.swimlanes[0].id);
	}

	// Resolve placement before inserting so a rejected anchor mutates nothing.
	const before = resolveBefore(state, card, ev);
	if (before === false) return false;
	ev.before = before;

	const added = cards.addBefore(card, before);
	const payload: Partial<KanbanCard> = { ...added };
	if (ev.card.id === undefined) delete payload.id;
	ev.card = payload;
	ev.id = added.id;

	store.setState({
		cards,
		...(ev.edit ? { editorData: { ...added } } : {}),
	});
}

/**
 * Canonical insertion anchor in source order: explicit `before` wins, `after`
 * becomes its successor in the destination column, otherwise append. Order is
 * per column; swimlanes only filter it. Returns false for an anchor in another
 * column.
 */
function resolveBefore(
	state: IData,
	card: KanbanCard,
	ev: StoreActions["add-card"]
): CardID | null | false {
	const { cards, columnAccessor } = state;
	const column = readMembership(card, columnAccessor);
	const sameColumn = (other: KanbanCard) =>
		readMembership(other, columnAccessor) === column;

	if (ev.before !== undefined) {
		if (ev.before === null) return null;
		const anchor = cards.getById(ev.before);
		return anchor && sameColumn(anchor) ? anchor.id : false;
	}
	if (ev.after === undefined) return null;

	const source = cards.getCards();
	const index = source.findIndex(item => item.id === ev.after);
	if (index === -1) return null;
	if (!sameColumn(source[index])) return false;
	for (let i = index + 1; i < source.length; i++)
		if (sameColumn(source[i])) return source[i].id;
	return null;
}
