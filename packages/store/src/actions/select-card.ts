import type { IKanbanStore, StoreActions } from "../types";

export default function (store: IKanbanStore, ev: StoreActions["select-card"]) {
	if (ev.id === null) {
		store.setState({ editorData: null });
		return;
	}

	const card = store.getState().cards.getById(ev.id);
	if (card) {
		store.setState({ editorData: { ...card } });
	}
}
