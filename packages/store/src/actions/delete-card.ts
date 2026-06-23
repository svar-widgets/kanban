import type { IKanbanStore, StoreActions } from "../types";

export default function (store: IKanbanStore, ev: StoreActions["delete-card"]) {
	const { cards, editorData } = store.getState();
	const removed = cards.remove(ev.id);

	if (!removed) {
		return;
	}

	store.setState({
		cards,
		...(editorData?.id === ev.id ? { editorData: null } : {}),
	});
}
