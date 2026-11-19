import type { TDataConfig } from "@svar-ui/lib-state";

import type { KanbanStore } from "./kanban_store";
import { KanbanModel } from "./model";
import { readMembership } from "./accessor";
const laneFilter = (_: State): ((card: KanbanCard) => boolean) | null => null; // pro feature
const projectSwimlanes = (_: State, __: ColumnView[]): SwimlaneView[] => []; // pro feature
import type {
	ColumnAccessor,
	ColumnConfig,
	ColumnDataStatus,
	ColumnID,
	ColumnView,
	ColumnSummaryResult,
	KanbanCard,
	SortCriterion,
	State,
	SwimlaneView,
} from "./types";

declare const console: { error: (...args: unknown[]) => void };

export function reactive(store: KanbanStore): TDataConfig {
	let fallbackColumn = false;
	return [
		{
			in: ["cards", "columnAccessor", "swimlaneAccessor"],
			out: ["columns", "swimlanes"],
			exec: ctx => {
				const { cards, columnAccessor, swimlaneAccessor } = store.getState();
				const next: Partial<State> = {};
				fallbackColumn = false;
				if (store._autoColumns) {
					next.columns = collectGroups(cards.getCards(), columnAccessor);
					if (!next.columns.length) {
						fallbackColumn = true;
						next.columns = [{ id: "", label: "" }];
					}
				}
				store.setState(next, ctx);
			},
		},
		{
			in: [
				"cards",
				"columns",
				"columnAccessor",
				"swimlanes",
				"swimlaneAccessor",
				"filters",
				"sort",
				"dynamicData",
				"columnData",
			],
			out: ["viewData"],
			exec: () => {
				store.setState({
					viewData: projectKanbanModel(store.getState(), fallbackColumn),
				});
			},
		},
	];
}

export function collectGroups(cards: KanbanCard[], accessor: ColumnAccessor) {
	const ids = new Set<ColumnID>();
	for (const card of cards) {
		const id = readMembership(card, accessor);
		if (typeof id === "string" || typeof id === "number") ids.add(id);
	}
	return Array.from(ids, id => ({ id, label: String(id) }));
}

export function projectKanbanModel(
	state: State,
	fallbackColumn = false
): KanbanModel {
	const {
		cards,
		columns,
		columnAccessor,
		filters,
		sort,
		dynamicData,
		columnData,
	} = state;
	const getColumn = getColumnReader(columnAccessor);
	const inLane = laneFilter(state);
	const buckets = new Map<ColumnID, KanbanCard[]>();
	const knownColumns = new Set(columns.map(column => column.id));

	columns.forEach(column => {
		buckets.set(column.id, []);
	});

	cards.getCards().forEach(card => {
		const columnId = fallbackColumn ? "" : getColumn(card);
		if (knownColumns.has(columnId) && (!inLane || inLane(card))) {
			buckets.get(columnId)!.push(card);
		}
	});

	const predicates = Array.from(filters.values());
	const compare = getComparator(sort);

	const columnViews = columns.map(column => {
		let columnCards = buckets.get(column.id) || [];

		if (predicates.length) {
			columnCards = columnCards.filter(card =>
				predicates.every(predicate => predicate(card))
			);
		} else {
			columnCards = columnCards.slice();
		}

		if (compare) {
			columnCards.sort(compare);
		}

		return toColumnView(
			column,
			columnCards,
			getColumnStatus(dynamicData, columnData, column.id)
		);
	});

	const laneViews: SwimlaneView[] = inLane
		? projectSwimlanes(state, columnViews)
		: [];
	return new KanbanModel({ columns: columnViews, swimlanes: laneViews });
}

function getColumnReader(accessor: ColumnAccessor) {
	return typeof accessor === "string"
		? (card: KanbanCard) => card[accessor] as ColumnID
		: accessor.get;
}

function getComparator(sort: SortCriterion) {
	if (!sort) {
		return null;
	}

	if (typeof sort === "function") {
		return sort;
	}

	const direction = sort.dir === "desc" ? -1 : 1;
	return (a: KanbanCard, b: KanbanCard) => {
		const left = a[sort.field];
		const right = b[sort.field];

		if (left === right) {
			return 0;
		}
		if (left === undefined) {
			return -1 * direction;
		}
		if (right === undefined) {
			return 1 * direction;
		}
		if (left < right) {
			return -1 * direction;
		}
		if (left > right) {
			return 1 * direction;
		}

		return 0;
	};
}

function getColumnStatus(
	dynamicData: boolean,
	columnData: State["columnData"],
	id: ColumnID
): ColumnDataStatus {
	return dynamicData ? (columnData.get(id)?.status ?? "unknown") : "loaded";
}

function toColumnView(
	column: ColumnConfig,
	cards: KanbanCard[],
	dataStatus: ColumnDataStatus
): ColumnView {
	// custom fields pass through; summaries and dimensions are normalized below
	const {
		summaries: _summaries,
		width,
		cardWidth,
		cardHeight,
		...custom
	} = column;
	const view: ColumnView = {
		...custom,
		id: column.id,
		label: column.label,
		collapsed: column.collapsed ?? false,
		addCard: column.addCard !== false,
		menu: column.menu === true,
		summaries: calculateSummaries(column, cards),
		dataStatus,
		cards,
	};

	if (width) view.width = width;

	return view;
}

// Keep callback failures local to a single tag so the board still projects.
function calculateSummaries(
	column: ColumnConfig,
	cards: KanbanCard[]
): ColumnSummaryResult[] {
	const results: ColumnSummaryResult[] = [];
	if (!cards.length) return results;

	for (const summary of column.summaries ?? []) {
		try {
			const value = summary.calculate(cards, column);
			if (value === null || value === undefined) continue;
			// format may return anything; coerce the way a missing format does
			const formatted = summary.format ? summary.format(value, column) : value;
			if (formatted === null || formatted === undefined) continue;
			const text = String(formatted);
			if (text.trim() === "") continue;
			const css = summary.css?.(value, column);
			results.push({ id: summary.id, value, text, ...(css ? { css } : {}) });
		} catch (error) {
			console.error(
				`Kanban summary "${summary.id}" failed for column "${column.id}"`,
				error
			);
		}
	}
	return results;
}
