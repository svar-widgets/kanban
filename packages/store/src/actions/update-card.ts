import type { IKanbanStore, StoreActions } from "../types";

export default function (store: IKanbanStore, ev: StoreActions["update-card"]) {
	const { cards } = store.getState();
	const updated = cards.update(ev.id, ev.card);

	if (updated) {
		store.setState({ cards });
	}
}
