import { expect, test, vi } from "vite-plus/test";
import { getColumnMenuOptions } from "../src/index";

import type {
	ColumnConfig,
	ColumnSummaryConfig,
	KanbanCard,
	StoreActions,
} from "../src/index";

import { createStore } from "./helpers/store";

test("projects cards into declared columns only", () => {
	const store = createStore();

	store.init({
		cards: [
			{ id: 1, label: "A", column: "todo" },
			{ id: 2, label: "B", column: "doing" },
			{ id: 3, label: "Hidden orphan", column: "missing" },
		],
		columns: [
			{ id: "todo", label: "To Do" },
			{ id: "doing", label: "Doing", collapsed: true },
		],
	});

	const columns = store.getState().viewData.columns;

	expect(columns.length).eq(2);
	expect(columns[0].cards.map(card => card.id).join(",")).eq("1");
	expect(columns[0].collapsed).eq(false);
	expect(columns[1].cards.map(card => card.id).join(",")).eq("2");
	expect(columns[1].collapsed).eq(true);
	expect(
		store
			.getCards()
			.map(card => card.id)
			.join(",")
	).eq("1,2,3");
});

test("column views keep custom config fields; computed fields win", async () => {
	const store = createStore();
	const summary: ColumnSummaryConfig = {
		id: "n",
		calculate: cards => cards.length,
	};

	store.init({
		cards: [{ id: 1, column: "todo" }],
		columns: [
			{
				id: "todo",
				label: "To Do",
				wipLimit: 3,
				owner: { name: "Ann" },
				metadata: { kind: "inbox" },
				summaries: [summary],
				cards: ["shadowed"],
				dataStatus: "shadowed",
				width: 0,
				cardWidth: 0,
			},
		],
	});

	const view = () => store.getState().viewData.columns[0];
	expect(view().wipLimit).eq(3);
	expect(view().owner).toEqual({ name: "Ann" });
	expect(view().metadata).toEqual({ kind: "inbox" });
	expect(view().summaries).toEqual([{ id: "n", value: 1, text: "1" }]);
	expect(view().cards.map(card => card.id)).toEqual([1]);
	expect(view().dataStatus).eq("loaded");
	expect(view()).not.toHaveProperty("width");
	expect(view()).not.toHaveProperty("cardWidth");

	await store.in.exec("update-column", { id: "todo", column: { wipLimit: 5 } });
	expect(view().wipLimit).eq(5);
});

test("filters stack and sort does not mutate source order", async () => {
	const store = createStore();

	store.init({
		cards: [
			{ id: 1, column: "todo", priority: 2, owner: "a" },
			{ id: 2, column: "todo", owner: "a" },
			{ id: 3, column: "todo", priority: 1, owner: "b" },
			{ id: 4, column: "todo", priority: 3, owner: "a" },
		],
		columns: [{ id: "todo", label: "To Do" }],
	});

	await store.in.exec("filter-cards", {
		tag: "owner",
		filter: card => card.owner === "a",
	});
	await store.in.exec("sort-cards", {
		sort: { field: "priority", dir: "asc" },
	});

	expect(
		store
			.getState()
			.viewData.columns[0].cards.map(card => card.id)
			.join(",")
	).eq("2,1,4");
	expect(
		store
			.getCards()
			.map(card => card.id)
			.join(",")
	).eq("1,2,3,4");

	await store.in.exec("filter-cards", { tag: "owner" });
	await store.in.exec("sort-cards", { sort: null });

	expect(
		store
			.getState()
			.viewData.columns[0].cards.map(card => card.id)
			.join(",")
	).eq("1,2,3,4");
});

test("card actions mutate source data and refresh viewData", async () => {
	const store = createStore();

	store.init({
		cards: [
			{ id: 1, label: "A", column: "todo" },
			{ id: 2, label: "B", column: "done" },
			{ id: 3, label: "C", column: "done" },
		],
		columns: [
			{ id: "todo", label: "To Do" },
			{ id: "done", label: "Done" },
		],
	});

	const addEvent: StoreActions["add-card"] = {
		card: { label: "New" },
		edit: true,
	};
	await store.in.exec("add-card", addEvent);

	expect(addEvent.id != null).eq(true);
	expect(store.getState().editorData?.id).eq(addEvent.id);
	expect(store.getState().viewData.columns[0].cards.length).eq(2);

	const beforeUpdate = store.getState().cards.getById(addEvent.id!);
	await store.in.exec("update-card", {
		id: addEvent.id!,
		card: { label: "Updated" },
	});
	const afterUpdate = store.getState().cards.getById(addEvent.id!);

	expect(afterUpdate?.label).eq("Updated");
	expect(afterUpdate === beforeUpdate).eq(false);

	await store.in.exec("move-card", { id: 1, column: "done", before: 3 });
	expect(
		store
			.getState()
			.viewData.columns[1].cards.map(card => card.id)
			.join(",")
	).eq("2,1,3");
});

test("column updates refresh derived column flags", async () => {
	const store = createStore();

	store.init({
		cards: [{ id: 1, column: "todo" }],
		columns: [{ id: "todo", label: "To Do" }],
	});

	await store.in.exec("update-column", {
		id: "todo",
		column: { collapsed: true },
	});

	const column = store.getState().viewData.columns[0];

	expect(column.collapsed).eq(true);
});

test("column addCard defaults on and can be disabled", async () => {
	const store = createStore();

	store.init({
		cards: [],
		columns: [
			{ id: "todo", label: "To Do" },
			{ id: "done", label: "Done", addCard: false },
		],
	});

	let columns = store.getState().viewData.columns;

	expect(columns[0].addCard).eq(true);
	expect(columns[1].addCard).eq(false);

	await store.in.exec("update-column", {
		id: "todo",
		column: { addCard: false },
	});

	columns = store.getState().viewData.columns;

	expect(columns[0].addCard).eq(false);
});

test("column menu defaults off and can be enabled", async () => {
	const store = createStore();

	store.init({
		cards: [],
		columns: [
			{ id: "todo", label: "To Do" },
			{ id: "done", label: "Done", menu: true },
		],
	});

	let columns = store.getState().viewData.columns;

	expect(columns[0].menu).eq(false);
	expect(columns[1].menu).eq(true);

	await store.in.exec("update-column", {
		id: "todo",
		column: { menu: true },
	});

	columns = store.getState().viewData.columns;

	expect(columns[0].menu).eq(true);
});

test("getColumnMenuOptions returns fresh built-in items", () => {
	const options = getColumnMenuOptions();

	expect(options.map(o => o.id)).toEqual(["add-card"]);
	expect(getColumnMenuOptions()).not.toBe(options);
});

test("object column accessor is used for reads and writes", async () => {
	const store = createStore();

	store.init({
		cards: [{ id: 1, status: { id: "todo" } }],
		columns: [
			{ id: "todo", label: "To Do" },
			{ id: "done", label: "Done" },
		],
		columnAccessor: {
			get: card => card.status?.id,
			set: (card, value) => ({ ...card, status: { id: value } }),
		},
	});

	await store.in.exec("move-card", { id: 1, column: "done" });

	expect(store.getCards()[0].status.id).eq("done");
	expect(store.getState().viewData.columns[1].cards[0].id).eq(1);

	const addEvent: StoreActions["add-card"] = { card: { label: "New" } };
	await store.in.exec("add-card", addEvent);

	expect(store.getState().cards.getById(addEvent.id!)?.status.id).eq("todo");
});

test("static loading mode reports columns as loaded", () => {
	const store = createStore();

	store.init({
		cards: [],
		columns: [{ id: "todo", label: "To Do" }],
	});

	expect(store.getState().viewData.columns[0].dataStatus).eq("loaded");
});

test("incompatible membership setters cannot partially mutate a move", async () => {
	const store = createStore();
	store.init({
		cards: [{ id: 1, column: "a", team: 0 }],
		columns: [
			{ id: "a", label: "A" },
			{ id: "b", label: "B" },
		],
		swimlanes: [
			{ id: 0, label: "Zero" },
			{ id: 1, label: "One" },
		],
		swimlaneAccessor: {
			get: card => card.team,
			set: (card, team) => ({ ...card, column: "invalid", team }),
		},
	});
	const original = store.getCards()[0];
	await store.in.exec("move-card", { id: 1, column: "b", swimlane: 1 });
	expect(store.getCards()[0]).toBe(original);
});

test("infers columns independently of empty configuration arrays", () => {
	const store = createStore();
	store.init({
		columnAccessor: "status",
		cards: [
			{ id: 1, status: 0, team: "a" },
			{ id: 2, status: "0", team: "b" },
			{ id: 3, status: 0, team: "a" },
			{ id: 4, status: "", team: "" },
			{ id: 5 },
		],
	});
	expect(store.getState().columns).toEqual([
		{ id: 0, label: "0" },
		{ id: "0", label: "0" },
		{ id: "", label: "" },
	]);
	expect(
		store
			.getState()
			.viewData.columns.map(column => column.cards.map(card => card.id))
	).toEqual([[1, 3], [2], [4]]);
});

test("column inference follows replacement data and edits, but not filters or sorting", async () => {
	const store = createStore();
	const cards = [{ id: 1, column: "todo", swimlane: "a" }];
	store.init({ cards });
	const columns = store.getState().columns;
	store.init({ cards, sort: { field: "id" } });
	await store.in.exec("filter-cards", { filter: () => false });
	expect(store.getState().columns).toBe(columns);
	await store.in.exec("filter-cards", {});
	await store.in.exec("update-card", {
		id: 1,
		card: { column: "done", swimlane: "b" },
	});
	expect(store.getState().columns.map(column => column.id)).toEqual(["done"]);
	store.init({ cards: [{ id: 2, column: "new", swimlane: "c" }] });
	expect(
		store.getState().viewData.columns[0].cards.map(card => card.id)
	).toEqual([2]);
	expect(store.getState().columns.map(column => column.id)).toEqual(["new"]);
});

test("undefined memberships produce one column, no lanes, and unchanged cards", () => {
	const store = createStore();
	store._autoColumns = true;
	store._autoSwimlanes = true;
	const cards = [{ id: 1 }, { id: 2 }];
	store.init({ cards });
	expect(store.getState().viewData.columns).toHaveLength(1);
	expect(store.getState().viewData.columns[0].cards).toEqual(cards);
	expect(store.getState().swimlanes).toEqual([]);
	expect(store.getCards()).toEqual(cards);
	store.init({ cards: [] });
	expect(store.getState().viewData.columns).toHaveLength(1);
	expect(store.getState().viewData.columns[0].cards).toEqual([]);
	store.init({ cards: [{ id: 3, column: "todo" }, { id: 4 }] });
	expect(store.getState().viewData.columns[0].id).toBe("todo");
	expect(
		store.getState().viewData.columns[0].cards.map(card => card.id)
	).toEqual([3]);
});

test("summaries use projected sorted cards and original column configuration", async () => {
	const store = createStore();
	const calculate = vi.fn(
		(cards: readonly KanbanCard[], column: ColumnConfig) => ({
			ids: cards.map(card => card.id),
			limit: column.wipLimit,
		})
	);
	const format = vi.fn(
		(value, column) => `${value.ids.join(",")}/${column.wipLimit}`
	);
	const css = vi.fn((value, column) =>
		value.ids.length > column.wipLimit ? "full" : ""
	);
	const column: ColumnConfig = {
		id: "todo",
		label: "Todo",
		wipLimit: 1,
		collapsed: true,
		summaries: [{ id: "capacity", calculate, format, css }],
	};
	store.init({
		columns: [column],
		cards: [
			{ id: 1, column: "todo", rank: 2 },
			{ id: 2, column: "todo", rank: 1 },
		],
	});
	await store.in.exec("sort-cards", { sort: { field: "rank" } });
	let view = store.getState().viewData.columns[0];
	expect(calculate).toHaveBeenLastCalledWith(view.cards, column);
	expect(calculate.mock.calls.at(-1)![0]).toBe(view.cards);
	expect(calculate.mock.calls.at(-1)![1]).toBe(column);
	expect(format).toHaveBeenLastCalledWith(view.summaries[0].value, column);
	expect(css).toHaveBeenLastCalledWith(view.summaries[0].value, column);
	expect(view.summaries).toEqual([
		{
			id: "capacity",
			value: { ids: [2, 1], limit: 1 },
			text: "2,1/1",
			css: "full",
		},
	]);
	expect(view.wipLimit).eq(1);
	await store.in.exec("filter-cards", { filter: card => card.id === 1 });
	view = store.getState().viewData.columns[0];
	expect(view.summaries[0]).toEqual({
		id: "capacity",
		value: { ids: [1], limit: 1 },
		text: "1/1",
	});
});

test("summaries preserve zero, order and raw values while suppressing individual tags", () => {
	const store = createStore();
	const skipped = vi.fn();
	store.init({
		cards: [{ id: 1, column: "a" }],
		columns: [
			{
				id: "a",
				label: "A",
				summaries: [
					{ id: "zero", calculate: () => 0 },
					{ id: "null", calculate: () => null, format: skipped, css: skipped },
					{ id: "undefined", calculate: () => undefined, format: skipped },
					{ id: "empty", calculate: () => 1, format: () => "", css: skipped },
					{ id: "blank", calculate: () => 1, format: () => "  ", css: skipped },
					{
						id: "voidFormat",
						calculate: () => 1,
						format: () => undefined as unknown as string,
						css: skipped,
					},
					{
						id: "number",
						calculate: () => 1,
						format: () => 5 as unknown as string,
					},
					{ id: "false", calculate: () => false, css: () => "" },
					{ id: "html", calculate: () => "<b>text</b>" },
				],
			},
		],
	});
	expect(store.getState().viewData.columns[0].summaries).toEqual([
		{ id: "zero", value: 0, text: "0" },
		{ id: "number", value: 1, text: "5" },
		{ id: "false", value: false, text: "false" },
		{ id: "html", value: "<b>text</b>", text: "<b>text</b>" },
	]);
	expect(skipped).not.toHaveBeenCalled();
});

test.each(["calculate", "format", "css"] as const)(
	"a throwing %s drops only its tag and retries on next projection",
	async callback => {
		const store = createStore();
		const error = new Error("host callback");
		const log = vi.spyOn(console, "error").mockImplementation(() => {});
		const fail = vi.fn(() => {
			throw error;
		});
		try {
			store.init({
				cards: [
					{ id: 1, column: "a" },
					{ id: 2, column: "b" },
				],
				columns: [
					{
						id: "a",
						label: "A",
						summaries: [
							{ id: "before", calculate: () => 0 },
							{ id: "bad", calculate: () => 1, [callback]: fail },
							{ id: "after", calculate: cards => cards.length },
						],
					},
					{
						id: "b",
						label: "B",
						summaries: [{ id: "other", calculate: () => 2 }],
					},
				],
			});
			expect(
				store.getState().viewData.columns[0].summaries.map(tag => tag.id)
			).toEqual(["before", "after"]);
			expect(store.getState().viewData.columns[1].summaries[0].value).toBe(2);
			expect(log).toHaveBeenCalledWith(expect.stringContaining('"bad"'), error);
			const calls = fail.mock.calls.length;
			await store.in.exec("update-card", { id: 1, card: { label: "changed" } });
			expect(fail.mock.calls.length).toBeGreaterThan(calls);
		} finally {
			log.mockRestore();
		}
	}
);

test("empty columns skip callbacks during loading, hydration and filtering", async () => {
	const store = createStore();
	const calculate = vi.fn(cards => cards.length);
	const format = vi.fn(String);
	const css = vi.fn(() => "count");
	store.init({
		dynamicData: true,
		cards: [],
		columns: [
			{
				id: "a",
				label: "A",
				summaries: [{ id: "count", calculate, format, css }],
			},
		],
	});
	const tags = () => store.getState().viewData.columns[0].summaries;
	expect(tags()).toEqual([]);
	await store.in.exec("request-data", { id: "a" });
	expect(tags()).toEqual([]);
	await store.in.exec("provide-data", { id: "a", cards: [] });
	expect(tags()).toEqual([]);
	expect(calculate).not.toHaveBeenCalled();
	expect(format).not.toHaveBeenCalled();
	expect(css).not.toHaveBeenCalled();
	await store.in.exec("provide-data", {
		id: "a",
		cards: [{ id: 1, column: "a" }],
	});
	expect(tags()[0].text).toBe("1");
	calculate.mockClear();
	await store.in.exec("filter-cards", { filter: () => false });
	expect(tags()).toEqual([]);
	expect(calculate).not.toHaveBeenCalled();
});

test("summary values refresh across card actions and configuration replacement", async () => {
	const store = createStore();
	const summaries: ColumnSummaryConfig<number>[] = [
		{
			id: "effort",
			calculate: cards => cards.reduce((sum, card) => sum + card.hours, 0),
			format: value => `${value} h`,
		},
	];
	store.init({
		cards: [{ id: 1, column: "a", hours: 2 }],
		columns: [
			{ id: "a", label: "A", summaries },
			{ id: "b", label: "B", summaries },
		],
	});
	const values = () =>
		store
			.getState()
			.viewData.columns.map(column => column.summaries.map(tag => tag.text));
	await store.in.exec("update-card", { id: 1, card: { hours: 5 } });
	expect(values()).toEqual([["5 h"], []]);
	await store.in.exec("move-card", { id: 1, column: "b" });
	expect(values()).toEqual([[], ["5 h"]]);
	await store.in.exec("duplicate-card", { id: 1 });
	expect(values()).toEqual([[], ["10 h"]]);
	await store.in.exec("delete-card", { id: 1 });
	expect(values()).toEqual([[], ["5 h"]]);
	await store.in.exec("add-card", { card: { column: "a", hours: 3 } });
	expect(values()).toEqual([["3 h"], ["5 h"]]);
	// collapse is presentation state: it reprojects like any other column patch
	// and never removes a collapsed column's results from viewData
	await store.in.exec("update-column", {
		id: "a",
		column: { collapsed: true },
	});
	expect(store.getState().viewData.columns[0].collapsed).toBe(true);
	expect(values()).toEqual([["3 h"], ["5 h"]]);
	await store.in.exec("update-column", {
		id: "a",
		column: { collapsed: false },
	});
	expect(values()).toEqual([["3 h"], ["5 h"]]);
	await store.in.exec("update-column", {
		id: "a",
		column: { summaries: [{ id: "count", calculate: cards => cards.length }] },
	});
	expect(values()).toEqual([["1"], ["5 h"]]);
	await store.in.exec("update-column", { id: "a", column: { summaries: [] } });
	expect(values()).toEqual([[], ["5 h"]]);
	store.setState({ columns: [{ id: "b", label: "B" }] });
	expect(values()).toEqual([[]]);
	expect(store.getCards().every(card => !("summaries" in card))).toBe(true);
});
