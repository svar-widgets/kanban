import type { IKanbanStore, StoreActions } from "../types";

export default function (
	store: IKanbanStore,
	ev: StoreActions["sort-cards"] = {}
) {
	if (
		!Object.prototype.hasOwnProperty.call(ev, "sort") ||
		ev.sort === undefined
	) {
		return;
	}

	store.setState({ sort: ev.sort });
}
