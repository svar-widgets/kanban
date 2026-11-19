import { test, expect } from "vite-plus/test";
import { createStore } from "./helpers/store";
import { crudTests } from "./helpers/groups";
import { collectGroups } from "../src/index";

test("group collection preserves valid membership identity and source appearance order", () => {
	const cards = [0, "0", "", null, undefined, {}, "a", 0].map((team, id) => ({
		id,
		team,
	}));
	const expected = [
		{ id: 0, label: "0" },
		{ id: "0", label: "0" },
		{ id: "", label: "" },
		{ id: "a", label: "a" },
	];
	expect(collectGroups(cards, "team")).toEqual(expected);
	expect(
		collectGroups(cards, {
			get: card => card.team,
			set: (card, team) => ({ ...card, team }),
		})
	).toEqual(expected);
});

crudTests("column");

test("restoring a column retains its loaded status", async () => {
	const store = createStore();
	store.init({
		cards: [{ id: 1, column: "a" }],
		dynamicData: true,
		swimlanes: [],
	});
	await store.in.exec("provide-data", { id: "a", cards: [] });
	await store.in.exec("delete-column", { id: "a" });
	await store.in.exec("add-column", { id: "a", column: { label: "Restored" } });
	expect(store.getState().viewData.columns[0].dataStatus).toBe("loaded");
});

test("a newly added column has unknown loading status", async () => {
	const store = createStore();
	store.init({
		cards: [{ id: 1, column: "a" }],
		dynamicData: true,
		swimlanes: [],
	});
	await store.in.exec("add-column", { id: "b", column: {} });
	expect(store.getState().viewData.columns[1].dataStatus).toBe("unknown");
});

test("card changes rebuild inferred columns after manual group operations", async () => {
	const store = createStore();
	store.init({ cards: [{ id: 1, column: "a" }], swimlanes: [] });
	await store.in.exec("add-column", { id: "b", column: {} });
	await store.in.exec("update-card", { id: 1, card: { label: "Updated" } });
	expect(store.getState().columns).toEqual([{ id: "a", label: "a" }]);
});

test("group deletion restores filtered and sorted projection without changing the source", async () => {
	const store = createStore();
	store.init({
		columns: [
			{ id: "a", label: "A" },
			{ id: "b", label: "B" },
		],
		swimlanes: [],
		cards: [
			{ id: 1, column: "a", label: "Z" },
			{ id: 2, column: "a", label: "A" },
			{ id: 3, column: "a", label: "Hidden" },
		],
	});
	await store.in.exec("filter-cards", { filter: c => c.id !== 3 });
	await store.in.exec("sort-cards", { sort: { field: "label" } });
	await store.in.exec("select-card", { id: 1 });
	const editor = store.getState().editorData;
	const source = store.getCards();
	await store.in.exec("delete-column", { id: "a" });
	expect(store.getState().editorData).toBe(editor);
	expect(store.getCards()).toEqual(source);
	await store.in.exec("add-column", {
		column: { id: "a", label: "A" },
		before: "b",
	});
	expect(store.getState().viewData.columns[0].cards.map(c => c.id)).toEqual([
		2, 1,
	]);
	await store.in.exec("move-column", { id: "a", before: null });
	expect(store.getState().viewData.columns.map(c => c.id)).toEqual(["b", "a"]);
});
