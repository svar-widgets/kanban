import type { CardID, ColumnID } from "@svar-ui/kanban-store";

export type DndTarget = { column: ColumnID; beforeId: CardID | null };

export class DndState {
	active = $state(false);
	cardId = $state<CardID | null>(null);
	sourceColumn = $state<ColumnID | null>(null);
	width = $state(0);
	height = $state(0);
	pointer = $state({ x: 0, y: 0 });
	offset = $state({ x: 0, y: 0 });
	target = $state<DndTarget | null>(null);

	reset() {
		this.active = false;
		this.cardId = null;
		this.sourceColumn = null;
		this.target = null;
	}
}
