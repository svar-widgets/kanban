import type { IKanbanStore, StoreActions } from "../types";
import { readMembership as read, writeMembership as write } from "../accessor";
export default function (store: IKanbanStore, ev: StoreActions["move-card"]) {
	const { cards, columns, columnAccessor, swimlanes, swimlaneAccessor } =
		store.getState();
	const card = cards.getById(ev.id);
	if (!card) return false;
	const hasSwimlanes = swimlanes.length > 0;
	const column = ev.column ?? read(card, columnAccessor);
	const lane = ev.swimlane ?? read(card, swimlaneAccessor);
	if (ev.column !== undefined && !columns.some(c => c.id === column))
		return false;
	if (ev.swimlane !== undefined && !swimlanes.some(l => l.id === lane))
		return false;
	// Order is per column; swimlanes only filter it, so any anchor in the
	// destination column is valid.
	if (ev.before != null && ev.before !== ev.id) {
		const before = cards.getById(ev.before);
		if (!before || read(before, columnAccessor) !== column) return false;
	}
	let next = card;
	if (column !== read(card, columnAccessor))
		next = write(next, columnAccessor, column);
	if (hasSwimlanes && lane !== read(card, swimlaneAccessor))
		next = write(next, swimlaneAccessor, lane);
	if (
		read(next, columnAccessor) !== column ||
		(hasSwimlanes && read(next, swimlaneAccessor) !== lane)
	)
		return false;
	if (next !== card) cards.update(ev.id, { ...next, id: ev.id });
	if (cards.move(ev.id, ev.before)) store.setState({ cards });
}
