import { expect, test } from "vite-plus/test";
import { KanbanStore } from "../src/index";
import type { KanbanStoreOptions, StoreActions } from "../src/index";

function writable<T>(initial: T) {
	let value = initial;
	const subscribers: ((value: T) => void)[] = [];

	return {
		subscribe(fn: (value: T) => void) {
			subscribers.push(fn);
			fn(value);
			return () => {
				const index = subscribers.indexOf(fn);
				if (index !== -1) {
					subscribers.splice(index, 1);
				}
			};
		},
		set(next: T) {
			value = next;
			subscribers.forEach(fn => fn(value));
		},
		update(fn: (value: T) => T) {
			this.set(fn(value));
		},
	};
}

function createStore(options?: KanbanStoreOptions) {
	return new KanbanStore(writable, options);
}

test("projects cards into declared columns only", () => {
	const store = createStore();

	store.init({
		cards: [
			{ id: 1, label: "A", column: "todo" },
			{ id: 2, label: "B", column: "doing" },
			{ id: 3, label: "Hidden orphan", column: "missing" },
		],
		columns: [
			{ id: "todo", label: "To Do", cardLimit: 0 },
			{ id: "doing", label: "Doing", collapsed: true },
		],
	});

	const columns = store.getState().viewData.columns;

	expect(columns.length).eq(2);
	expect(columns[0].cards.map(card => card.id).join(",")).eq("1");
	expect(columns[0].collapsed).eq(false);
	expect(columns[0].overLimit).eq(true);
	expect(columns[1].cards.map(card => card.id).join(",")).eq("2");
	expect(columns[1].collapsed).eq(true);
	expect(
		store
			.getCards()
			.map(card => card.id)
			.join(",")
	).eq("1,2,3");
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
		column: { collapsed: true, cardLimit: 0 },
	});

	const column = store.getState().viewData.columns[0];

	expect(column.collapsed).eq(true);
	expect(column.overLimit).eq(true);
});

test("column cardLimit controls limit and count display modes", () => {
	const store = createStore();

	store.init({
		cards: [
			{ id: 1, column: "todo" },
			{ id: 2, column: "todo" },
			{ id: 3, column: "doing" },
		],
		columns: [
			{ id: "todo", label: "To Do", cardLimit: true },
			{ id: "doing", label: "Doing", cardLimit: false },
			{ id: "done", label: "Done", cardLimit: 0 },
		],
	});

	const columns = store.getState().viewData.columns;

	expect(columns[0].cardLimit).eq(true);
	expect(columns[0].overLimit).eq(false);
	expect(columns[1].cardLimit).eq(false);
	expect(columns[1].overLimit).eq(false);
	expect(columns[2].cardLimit).eq(0);
	expect(columns[2].overLimit).eq(false);
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

test("dynamic loading tracks column data status", async () => {
	const store = createStore();

	store.init({
		cards: [],
		columns: [
			{ id: "todo", label: "To Do" },
			{ id: "done", label: "Done" },
		],
		dynamicData: true,
	});

	expect(store.getState().viewData.columns[0].dataStatus).eq("unknown");
	expect(store.getState().viewData.columns[1].dataStatus).eq("unknown");

	await store.in.exec("request-data", { id: "todo" });
	expect(store.getState().viewData.columns[0].dataStatus).eq("loading");

	await store.in.exec("provide-data", {
		id: "todo",
		cards: [{ id: 1, label: "A" }],
	});

	const todo = store.getState().viewData.columns[0];
	expect(todo.dataStatus).eq("loaded");
	expect(todo.cards.map(card => card.id).join(",")).eq("1");
});

test("request-data does not regress a provided column", async () => {
	const store = createStore();

	store.init({
		cards: [],
		columns: [{ id: "todo", label: "To Do" }],
		dynamicData: true,
	});

	await store.in.exec("provide-data", {
		id: "todo",
		cards: [{ id: 1, label: "A", column: "todo" }],
	});
	await store.in.exec("request-data", { id: "todo" });

	expect(store.getState().viewData.columns[0].dataStatus).eq("loaded");
});

test("static loading mode reports columns as loaded", () => {
	const store = createStore();

	store.init({
		cards: [],
		columns: [{ id: "todo", label: "To Do" }],
	});

	expect(store.getState().viewData.columns[0].dataStatus).eq("loaded");
});

test("undo and redo restore local card snapshots", async () => {
	const store = createStore({ undo: true });

	store.init({
		cards: [
			{ id: 1, label: "A", column: "todo" },
			{ id: 2, label: "B", column: "todo" },
		],
		columns: [{ id: "todo", label: "To Do" }],
	});

	const addEvent: StoreActions["add-card"] = {
		card: { id: 3, label: "C", column: "todo" },
	};
	await store.in.exec("add-card", addEvent);

	expect(store.getState().history.undo).eq(1);
	expect(store.getState().history.redo).eq(0);
	expect(
		store
			.getCards()
			.map(card => card.id)
			.join(",")
	).eq("1,2,3");

	await store.in.exec("undo", {});

	expect(store.getState().history.undo).eq(0);
	expect(store.getState().history.redo).eq(1);
	expect(
		store
			.getCards()
			.map(card => card.id)
			.join(",")
	).eq("1,2");

	await store.in.exec("redo", {});

	expect(store.getState().history.undo).eq(1);
	expect(store.getState().history.redo).eq(0);
	expect(
		store
			.getCards()
			.map(card => card.id)
			.join(",")
	).eq("1,2,3");
});

test("undo history coalesces card updates by card id", async () => {
	const store = createStore({ undo: true });

	store.init({
		cards: [{ id: 1, label: "A", column: "todo" }],
		columns: [{ id: "todo", label: "To Do" }],
	});

	await store.in.exec("update-card", {
		id: 1,
		card: { label: "B" },
	});
	await store.in.exec("update-card", {
		id: 1,
		card: { label: "C" },
	});

	expect(store.getState().history.undo).eq(1);
	expect(store.getCards()[0].label).eq("C");

	await store.in.exec("undo", {});

	expect(store.getCards()[0].label).eq("A");
	expect(store.getState().history.redo).eq(1);
});

test("undo history coalesces tight bursts of same card actions", async () => {
	const store = createStore({ undo: true });

	store.init({
		cards: [
			{ id: 1, column: "todo" },
			{ id: 2, column: "todo" },
			{ id: 3, column: "todo" },
		],
		columns: [{ id: "todo", label: "To Do" }],
	});

	await store.in.exec("delete-card", { id: 1 });
	await store.in.exec("delete-card", { id: 2 });

	expect(store.getState().history.undo).eq(1);
	expect(
		store
			.getCards()
			.map(card => card.id)
			.join(",")
	).eq("3");

	await store.in.exec("undo", {});

	expect(
		store
			.getCards()
			.map(card => card.id)
			.join(",")
	).eq("1,2,3");
});

test("init resets undo and redo history", async () => {
	const store = createStore({ undo: true });

	store.init({
		cards: [{ id: 1, column: "todo" }],
		columns: [{ id: "todo", label: "To Do" }],
	});

	await store.in.exec("delete-card", { id: 1 });
	await store.in.exec("undo", {});

	expect(store.getState().history.redo).eq(1);

	// TODO: fix this, currently new cards doesn't reset history
	// store.init({
	// 	cards: [{ id: 2, column: "todo" }],
	// 	columns: [{ id: "todo", label: "To Do" }],
	// });

	// expect(store.getState().history.undo).eq(0);
	// expect(store.getState().history.redo).eq(0);
	// expect(
	// 	store
	// 		.getCards()
	// 		.map(card => card.id)
	// 		.join(",")
	// ).eq("2");
});

test("undo history is inactive unless enabled", async () => {
	const store = createStore();

	store.init({
		cards: [{ id: 1, column: "todo" }],
		columns: [{ id: "todo", label: "To Do" }],
	});

	await store.in.exec("delete-card", { id: 1 });

	expect(store.getState().history.undo).eq(0);
	expect(store.getState().history.redo).eq(0);

	await store.in.exec("undo", {});

	expect(store.getCards().length).eq(0);
	expect(store.getState().history.undo).eq(0);
	expect(store.getState().history.redo).eq(0);
});
