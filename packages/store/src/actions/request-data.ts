import type { IKanbanStore, StoreActions } from "../types";

export default function (
	store: IKanbanStore,
	ev: StoreActions["request-data"]
) {
	const { columns, columnData, dynamicData } = store.getState();

	if (!dynamicData || !columns.some(column => column.id === ev.id)) {
		return;
	}

	const status = columnData.get(ev.id)?.status ?? "unknown";
	if (status !== "unknown") {
		return;
	}

	const next = new Map(columnData);
	next.set(ev.id, { status: "loading" });
	store.setState({ columnData: next });
}
