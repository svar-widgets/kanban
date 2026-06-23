import type { TDataConfig } from "@svar-ui/lib-state";

import type { KanbanStore } from "./kanban_store";
import { KanbanModel } from "./model";
import type {
	ColumnAccessor,
	ColumnConfig,
	ColumnDataStatus,
	ColumnID,
	ColumnView,
	KanbanCard,
	SortCriterion,
	State,
} from "./types";

export function reactive(store: KanbanStore): TDataConfig {
	return [
		{
			in: [
				"cards",
				"columns",
				"columnAccessor",
				"filters",
				"sort",
				"dynamicData",
				"columnData",
			],
			out: ["viewData"],
			exec: () => {
				store.setState({
					viewData: projectKanbanModel(store.getState()),
				});
			},
		},
	];
}

export function projectKanbanModel(state: State): KanbanModel {
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
	const buckets = new Map<ColumnID, KanbanCard[]>();
	const knownColumns = new Set(columns.map(column => column.id));

	columns.forEach(column => {
		buckets.set(column.id, []);
	});

	cards.getCards().forEach(card => {
		const columnId = getColumn(card);
		if (knownColumns.has(columnId)) {
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

	return new KanbanModel({ columns: columnViews });
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
	const view: ColumnView = {
		id: column.id,
		label: column.label,
		collapsed: column.collapsed ?? false,
		addCard: column.addCard !== false,
		overLimit:
			typeof column.cardLimit === "number" && cards.length > column.cardLimit,
		dataStatus,
		cards,
	};

	if (column.css !== undefined) {
		view.css = column.css;
	}
	if (column.metadata !== undefined) {
		view.metadata = column.metadata;
	}
	if (column.cardLimit !== undefined) {
		view.cardLimit = column.cardLimit;
	}

	return view;
}
