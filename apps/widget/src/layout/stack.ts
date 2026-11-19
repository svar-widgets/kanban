import type {
	ColumnView,
	KanbanCard,
	KanbanModel,
	SwimlaneView,
} from "@svar-ui/kanban-store";

export type StackGroup = {
	/** Stable across re-projection; distinguishes numeric from string IDs. */
	key: string;
	/** The aggregate column, for styling hooks and whole-column summaries. */
	column: ColumnView;
	/** Present only when lanes are enabled. */
	swimlane?: SwimlaneView;
	/** Shared with `viewData`, never copied or reordered. */
	cards: KanbanCard[];
	collapsed: boolean;
};

/** JSON keeps `1` and `"1"` apart, and never collides on separators. */
export function stackGroupKey(
	column: ColumnView["id"],
	lane?: SwimlaneView["id"]
): string {
	return JSON.stringify(lane === undefined ? [column] : [column, lane]);
}

/**
 * Column-major group list for the stack layout. Empty groups are omitted, even
 * when collapsed; a group is collapsed when its column or its lane is.
 */
export function stackGroups(model: KanbanModel): StackGroup[] {
	const groups: StackGroup[] = [];
	const lanes = model.swimlanes;

	model.columns.forEach((column, index) => {
		if (!lanes.length) {
			if (column.cards.length)
				groups.push({
					key: stackGroupKey(column.id),
					column,
					cards: column.cards,
					collapsed: column.collapsed,
				});
			return;
		}

		for (const lane of lanes) {
			const cell = lane.cells[index];
			if (!cell.cards.length) continue;
			groups.push({
				key: stackGroupKey(column.id, lane.id),
				column,
				swimlane: lane,
				cards: cell.cards,
				collapsed: column.collapsed || lane.collapsed,
			});
		}
	});

	return groups;
}
