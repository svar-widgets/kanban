import { test, expect } from "vite-plus/test";
import type { StoreActions } from "../../src/index";
import { createStore } from "./store";

export type Axis = "column" | "swimlane";

export function setup(axis: Axis) {
	const store = createStore({ undo: true });
	store.init({
		columns: [
			{ id: 0, label: "Zero" },
			{ id: "0", label: "String" },
		],
		swimlanes: [
			{ id: 0, label: "Zero" },
			{ id: "0", label: "String" },
		],
		cards: [{ id: 1, column: 0, swimlane: 0 }],
		dynamicData: true,
	});
	const key = axis === "column" ? "columns" : "swimlanes";
	const exec = (op: "add" | "move" | "delete" | "update", data: any) =>
		store.in.exec(`${op}-${axis}` as keyof StoreActions, data);
	const ids = () => store.getState()[key].map(group => group.id);
	const add = (id?: string | number, before?: string | number | null) => ({
		id,
		before,
		[axis]: { label: "New" },
	});

	return { store, exec, ids, add };
}

/** Group CRUD behavior shared by both axes; history and lane cells are Pro. */
export function crudTests(axis: Axis) {
	test(`${axis} add generates an ID and writes it back to the payload`, async () => {
		const { exec, ids, add } = setup(axis);
		const generated = add();
		await exec("add", generated);
		expect(generated.id).toBeDefined();
		expect(ids()).toEqual([0, "0", generated.id]);
	});

	test.each([
		["before numeric zero", 0, ["new", 0, "0"]],
		["before string zero", "0", [0, "new", "0"]],
		["with an unknown anchor", "missing", [0, "0", "new"]],
		["with a null anchor", null, [0, "0", "new"]],
	] as const)(`${axis} add inserts %s`, async (_name, before, expected) => {
		const { exec, ids, add } = setup(axis);
		await exec("add", add("new", before));
		expect(ids()).toEqual(expected);
	});

	test.each([
		["before another group", { id: "0", before: 0 }],
		["to an unknown anchor", { id: 0, before: "missing" }],
		["to the end", { id: 0, before: null }],
	])(`${axis} move reorders %s`, async (_name, payload) => {
		const { exec, ids } = setup(axis);
		await exec("move", payload);
		expect(ids()).toEqual(["0", 0]);
	});

	for (const op of ["add", "move", "delete"] as const) {
		test(`${axis} ${op} preserves source cards and loading state`, async () => {
			const { store, exec, add } = setup(axis);
			const cards = store.getCards().slice();
			const loading = store.getState().columnData;
			await exec(op, op === "add" ? add("new") : { id: 0, before: null });
			expect(store.getCards()).toEqual(cards);
			expect(store.getState().columnData).toBe(loading);
		});
	}

	test(`${axis} deletion hides cards until the same ID is restored`, async () => {
		const { store, exec, ids, add } = setup(axis);
		await exec("delete", { id: 0 });
		expect(ids()).toEqual(["0"]);
		expect(
			store.getState().viewData.columns.flatMap(column => column.cards)
		).toEqual([]);
		await exec("add", add(0));
		expect(
			store
				.getState()
				.viewData.columns.flatMap(column => column.cards)
				.map(card => card.id)
		).toEqual([1]);
	});
}
