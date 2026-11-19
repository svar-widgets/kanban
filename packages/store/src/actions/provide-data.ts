import { writeMembership } from "../accessor";
import type { IKanbanStore, StoreActions } from "../types";

export default function (
	store: IKanbanStore,
	ev: StoreActions["provide-data"]
) {
	const { cards, columns, columnAccessor, columnData } = store.getState();

	if (ev.id !== undefined) {
		if (!columns.some(column => column.id === ev.id)) {
			return;
		}

		ev.cards.forEach(card => {
			cards.upsert(writeMembership(card, columnAccessor, ev.id!));
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
