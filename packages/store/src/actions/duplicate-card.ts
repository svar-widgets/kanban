import { tempID } from "@svar-ui/lib-state";
import type { IKanbanStore, KanbanCard, StoreActions } from "../types";

export default function (
	store: IKanbanStore,
	ev: StoreActions["duplicate-card"]
) {
	const { cards } = store.getState();
	const source = cards.getById(ev.id);

	if (!source) {
		return false;
	}

	const duplicate: KanbanCard = {
		...source,
		...ev.card,
		id: tempID(),
	};
	const added = cards.add(duplicate, ev.id);

	store.setState({
		cards,
		...(ev.edit ? { editorData: { ...added } } : {}),
	});
}
