import type {
	CardID,
	ColumnID,
	KanbanCard,
	KanbanModel,
	SwimlaneID,
} from "@svar-ui/kanban-store";
import { getID } from "@svar-ui/lib-dom";
import type { CardProjectionTarget } from "../types.js";

/** Drop resolution for a cell that lays cards out itself (e.g. a card grid). */
export type CellDestination = {
	before: (x: number, y: number, source: CardID | null) => CardID | null;
	/** Changes when the cell's layout changes (rewrap or new card size). */
	layout: () => string;
};
// Retained cell shells provide current geometry and O(1) indexed ID resolution.
export const cellDestinations = new WeakMap<HTMLElement, CellDestination>();

/** Card cell of this board under the hit element; cells of other boards are ignored. */
export function dropCell(
	root: HTMLElement,
	hit: Element | null
): HTMLElement | null {
	const cell = hit?.closest<HTMLElement>("[data-kanban-column-cards]") ?? null;
	return cell && root.contains(cell) ? cell : null;
}

/**
 * Destination under a viewport point, shared by internal moves and external
 * projections. Pure: returns null outside an expanded, rendered cell and never
 * keeps a previous result. `exclude` is the internally dragged card, if any.
 */
export function resolveDropTarget(
	root: HTMLElement,
	model: Pick<KanbanModel, "columns" | "swimlanes">,
	x: number,
	y: number,
	exclude: CardID | null,
	hit: Element | null = document.elementFromPoint(x, y)
): CardProjectionTarget | null {
	const cell = dropCell(root, hit);
	if (!cell) return null;

	const columnId = getID(cell, "data-kanban-column-cards") as ColumnID | null;
	if (columnId == null) return null;
	const column = model.columns.find(c => c.id === columnId);
	if (!column || column.collapsed) return null;

	const laneId = getID(cell, "data-kanban-swimlane") as SwimlaneID | null;
	const lane = model.swimlanes.find(l => l.id === laneId);
	if (model.swimlanes.length > 0 && (!lane || lane.collapsed)) return null;
	const swimlane = lane?.id;

	const cards = lane
		? (lane.cells.find(c => c.column === column.id)?.cards ?? [])
		: column.cards;

	// Slots refer to the full area, even when no cards are currently rendered.
	if (hit?.closest(".wx-card-list-start"))
		return {
			column: column.id,
			swimlane,
			before: cards.find(c => c.id !== exclude)?.id ?? null,
		};
	if (hit?.closest(".wx-card-list-end"))
		return { column: column.id, swimlane, before: null };

	const custom = cellDestinations.get(cell);
	if (custom)
		return {
			column: column.id,
			swimlane,
			before: custom.before(x, y, exclude),
		};

	// Stack: insert before the first rendered card whose midpoint is below y.
	for (const cardEl of Array.from(
		cell.querySelectorAll<HTMLElement>("[data-kanban-card-id]")
	)) {
		const id = getID(cardEl, "data-kanban-card-id") as CardID | null;
		if (id === exclude) continue;
		const rect = cardEl.getBoundingClientRect();
		if (y < rect.top + rect.height / 2) {
			const before = renderedCardId(cards, id);
			if (before != null) return { column: column.id, swimlane, before };
			break;
		}
	}

	// Below the rendered slice of a virtual list: before the next unrendered card.
	const before = renderedCardId(
		cards,
		getID(cell, "data-kanban-after-rendered-before-id") as CardID | null
	);
	return { column: column.id, swimlane, before };
}

export function sameTarget(
	a: CardProjectionTarget | null | undefined,
	b: CardProjectionTarget | null | undefined
): boolean {
	if (!a || !b) return !a && !b;
	return (
		a.column === b.column && a.swimlane === b.swimlane && a.before === b.before
	);
}

function renderedCardId(cards: KanbanCard[], id: CardID | null): CardID | null {
	if (id == null) return null;
	return cards.find(card => card.id === id)?.id ?? null;
}
