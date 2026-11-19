import type { IKanbanStore, StoreActions } from "../types";
import { tempID } from "@svar-ui/lib-state";
export default function (store: IKanbanStore, ev: StoreActions["add-column"]) {
	const { columns } = store.getState();
	const id = ev.id ?? ev.column.id ?? tempID();
	ev.id = id;
	if (columns.some(group => group.id === id)) return;
	const next = columns.slice();
	const index = next.findIndex(group => group.id === ev.before);
	const group = { label: String(id), ...ev.column, id };
	next.splice(index < 0 ? next.length : index, 0, group);
	ev.column = group;
	store.setState({ columns: next });
	store.resetHistory();
}
