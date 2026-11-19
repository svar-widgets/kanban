import { expect, test } from "vite-plus/test";

import type { KanbanCard } from "../src/index";
import { add, board, ids } from "./helpers/add-card";

test("add-card without hints appends and forwards before: null", async () => {
	const { store, forwarded } = board();
	const ev = await add(store, { id: "n" });
	expect(ev.before).toBe(null);
	expect(forwarded.length).toBe(1);
	expect(forwarded[0].before).toBe(null);
	expect(ids(store)).toEqual([0, "0", 2, 3, 4, 5, "n"]);
});

test("explicit before inserts in place and preserves zero IDs", async () => {
	const { store, forwarded } = board();
	await add(store, { id: "n", before: 0 });
	expect(ids(store)).toEqual(["n", 0, "0", 2, 3, 4, 5]);
	expect(forwarded[0].before).toBe(0);
	await add(store, { id: "m", card: { column: "b" }, before: "0" });
	expect(ids(store)).toEqual(["n", 0, "m", "0", 2, 3, 4, 5]);
	expect(forwarded[1].before).toBe("0");
});

test("explicit before wins over after, including null", async () => {
	const { store, forwarded } = board();
	await add(store, { id: "n", before: 3, after: 0 });
	expect(ids(store)).toEqual([0, "0", 2, "n", 3, 4, 5]);
	await add(store, { id: "m", before: null, after: 0 });
	expect(ids(store).at(-1)).toBe("m");
	expect(forwarded.map(ev => ev.before)).toEqual([3, null]);
	// undefined behaves as omitted
	await add(store, { id: "k", before: undefined, after: 5 });
	expect(forwarded[2].before).toBe("m");
});

test("after resolves to the destination source-order successor", async () => {
	const { store, forwarded } = board();
	// first: successor skips cards from other columns
	await add(store, { id: "f", after: 0 });
	// middle
	await add(store, { id: "m", after: 3 });
	// last: no successor
	await add(store, { id: "l", after: 5 });
	expect(forwarded.map(ev => ev.before)).toEqual([2, 5, null]);
	expect(ids(store)).toEqual([0, "0", "f", 2, 3, 4, "m", 5, "l"]);
});

test("anchors from another lane of the column are valid", async () => {
	const { store, forwarded } = board(true);
	await add(store, { id: "n", before: 2 }); // 2 is in lane y, card goes to x
	await add(store, { id: "m", after: 2 });
	expect(forwarded.map(ev => ev.before)).toEqual([2, 3]);
	expect(ids(store)).toEqual([0, "0", "n", 2, "m", 3, 4, 5]);
	expect(store.getState().cards.getById("n")?.lane).toBe("x");
});

test("unknown after appends; wrong-cell anchors reject without mutation", async () => {
	const { store, forwarded } = board(true);
	await add(store, { id: "u", after: 99 });
	expect(forwarded[0].before).toBe(null);
	expect(ids(store).at(-1)).toBe("u");

	const before = ids(store);
	await add(store, { id: "w1", before: 4 }); // other column
	await add(store, { id: "w2", before: 99 }); // unknown
	await add(store, { id: "w3", before: "0" }); // string/number distinction
	await add(store, { id: "w4", after: "0" }); // string/number distinction
	await add(store, { id: "w5", after: 4 }); // other column
	expect(ids(store)).toEqual(before);
	expect(forwarded.length).toBe(1);
});

test("placement uses source order, not sorted or filtered view", async () => {
	const { store, forwarded } = board();
	await store.in.exec("sort-cards", { sort: { field: "id", dir: "desc" } });
	await store.in.exec("filter-cards", {
		tag: "t",
		filter: (card: KanbanCard) => card.id !== 2,
	});
	await add(store, { id: "n", after: 0 });
	// 2 is hidden by the filter but is still the source-order successor
	expect(forwarded[0].before).toBe(2);
	expect(ids(store)).toEqual([0, "0", "n", 2, 3, 4, 5]);
});

test("membership is resolved before placement validation", async () => {
	const { store, forwarded } = board();
	// missing column falls back to the first column, where 3 lives
	await add(store, { id: "n", card: { column: "missing" }, before: 3 });
	expect(forwarded[0].before).toBe(3);
	expect(store.getState().cards.getById("n")?.column).toBe("a");
});

test("interceptors see caller hints; handler sees canonical before", async () => {
	const { store, forwarded } = board();
	const seen: unknown[] = [];
	store.in.intercept("add-card", (ev: any) => {
		seen.push(ev.before, ev.after);
		ev.after = 3;
	});
	await add(store, { id: "n", after: 0 });
	expect(seen).toEqual([undefined, 0]);
	expect(forwarded[0].before).toBe(5);

	store.in.intercept("add-card", () => false);
	await add(store, { id: "x" });
	expect(store.getState().cards.getById("x")).toBe(undefined);
	expect(forwarded.length).toBe(1);
});
