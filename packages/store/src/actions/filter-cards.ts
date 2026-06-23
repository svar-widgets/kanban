import type { IKanbanStore, StoreActions } from "../types";

export default function (
	store: IKanbanStore,
	ev: StoreActions["filter-cards"] = {}
) {
	const { filters } = store.getState();
	const hasFilter = Object.prototype.hasOwnProperty.call(ev, "filter");
	const hasTag = Object.prototype.hasOwnProperty.call(ev, "tag");
	const tag = ev.tag ?? "_default";

	if (!hasFilter) {
		if (hasTag) {
			filters.delete(tag);
		} else {
			filters.clear();
		}
	} else if (ev.filter == null) {
		if (hasTag) {
			filters.delete(tag);
		} else {
			filters.clear();
		}
	} else {
		filters.set(tag, ev.filter);
	}

	store.setState({ filters });
}
