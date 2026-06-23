import type { IKanbanStore, StoreActions } from "../types";

export default function (
	store: IKanbanStore,
	ev: StoreActions["update-column"]
) {
	const { columns } = store.getState();
	const index = columns.findIndex(column => column.id === ev.id);

	if (index === -1) {
		return;
	}

	columns[index] = { ...columns[index], ...ev.column };
	store.setState({ columns });
}
