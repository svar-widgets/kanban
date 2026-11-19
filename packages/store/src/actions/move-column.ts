import type { IKanbanStore, StoreActions } from "../types";
export default function (store: IKanbanStore, ev: StoreActions["move-column"]) {
	const { columns } = store.getState();
	const index = columns.findIndex(group => group.id === ev.id);
	if (index < 0 || ev.id === ev.before) return;
	const next = columns.slice();
	const [group] = next.splice(index, 1);
	const anchor = next.findIndex(item => item.id === ev.before);
	const at = anchor < 0 ? next.length : anchor;
	// landing back on the same index changes no structure, so history survives
	if (at === index) return;
	next.splice(at, 0, group);
	store.setState({ columns: next });
	store.resetHistory();
}
