import type { CardID, ColumnID } from "@svar-ui/kanban-store";
import type { CardProjectionTarget } from "../types.js";

export type DndTarget = CardProjectionTarget;

export class DndState {
	active = $state(false);
	cardId = $state<CardID | null>(null);
	sourceColumn = $state<ColumnID | null>(null);
	width = $state(0);
	height = $state(0);
	pointer = $state({ x: 0, y: 0 });
	offset = $state({ x: 0, y: 0 });
	target = $state<DndTarget | null>(null);
	/** Target of the external `cardProjection`; never touched by internal drag. */
	external = $state<DndTarget | null>(null);

	/** Placeholder target: an active internal drag wins even without a target. */
	get preview(): DndTarget | null {
		return this.active ? this.target : this.external;
	}

	reset() {
		this.active = false;
		this.cardId = null;
		this.sourceColumn = null;
		this.target = null;
	}
}
