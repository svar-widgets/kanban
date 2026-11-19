import type { KanbanCard, StoreActions } from "../../src/index";

import { createStore } from "./store";

export function board(swimlanes = false, history = false) {
	const store = createStore({ undo: history });
	store.init({
		cards: [
			{ id: 0, column: "a", lane: "x" },
			{ id: "0", column: "b", lane: "x" },
			{ id: 2, column: "a", lane: "y" },
			{ id: 3, column: "a", lane: "x" },
			{ id: 4, column: "b", lane: "x" },
			{ id: 5, column: "a", lane: "x" },
		],
		columns: [
			{ id: "a", label: "A" },
			{ id: "b", label: "B" },
		],
		...(swimlanes
			? {
					swimlaneAccessor: "lane",
					swimlanes: [
						{ id: "x", label: "X" },
						{ id: "y", label: "Y" },
					],
				}
			: {}),
	});
	const forwarded: StoreActions["add-card"][] = [];
	store.in.setNext({
		exec: async (name: string, ev: any) => {
			if (name === "add-card") forwarded.push({ ...ev });
		},
	} as any);
	return { store, forwarded };
}

export const ids = (store: ReturnType<typeof createStore>) =>
	store.getCards().map((card: KanbanCard) => card.id);

export async function add(
	store: ReturnType<typeof createStore>,
	ev: Partial<StoreActions["add-card"]>
) {
	const payload = { card: { column: "a", lane: "x" }, ...ev } as any;
	await store.in.exec("add-card", payload);
	return payload as StoreActions["add-card"];
}
