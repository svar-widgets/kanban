import type { IKanbanStore, StoreActions } from "../types";
export default function (
	store: IKanbanStore,
	ev: StoreActions["delete-column"]
) {
	const { columns } = store.getState();
	const index = columns.findIndex(group => group.id === ev.id);
	if (index < 0) return;
	const next = columns.slice();
	next.splice(index, 1);
	store.setState({ columns: next });
	store.resetHistory();
}
