import type {
	CardID,
	ColumnID,
	ColumnView,
	KanbanCard,
} from "@svar-ui/kanban-store";
import { getID } from "@svar-ui/lib-dom";

import type { KanbanContextApi } from "../types.js";
import type { DndState } from "../components/useDrag.svelte.js";

export type CardDragParams = {
	dnd: DndState | undefined;
	store: KanbanContextApi;
	readonly?: boolean;
};

type Resolved = {
	dnd: DndState;
	store: KanbanContextApi;
	id: CardID;
	column: ColumnID;
	cardEl: HTMLElement;
};

const DRAG_THRESHOLD_PX = 4;

export function cardDrag(node: HTMLElement, initial: CardDragParams) {
	let params = initial;
	let startX = 0;
	let startY = 0;
	let pending = false;
	let started = false;
	let active: Resolved | null = null;

	function onPointerDown(e: PointerEvent) {
		if (e.button !== 0 || params.readonly || !params.dnd || !params.store)
			return;

		const target = e.target as HTMLElement | null;
		const cardEl = target
			? (target.closest("[data-kanban-card-id]") as HTMLElement | null)
			: null;
		if (!cardEl || !node.contains(cardEl)) return;

		const columnEl = cardEl.closest(
			"[data-kanban-column-cards]"
		) as HTMLElement | null;
		if (!columnEl) return;

		const id = getID(cardEl, "data-kanban-card-id") as CardID | null;
		const columnId = getID(
			columnEl,
			"data-kanban-column-cards"
		) as ColumnID | null;
		if (id == null || columnId == null) return;

		const { viewData } = params.store.getState();
		const column = viewData.columns.find((c: ColumnView) => c.id === columnId);
		const cardRec = column?.cards.find((c: KanbanCard) => c.id === id);
		if (!column || !cardRec || cardRec.id == null) return;

		active = {
			dnd: params.dnd,
			store: params.store,
			id: cardRec.id,
			column: column.id,
			cardEl,
		};

		pending = true;
		started = false;
		startX = e.clientX;
		startY = e.clientY;
		window.addEventListener("pointermove", onPointerMove);
		window.addEventListener("pointerup", onPointerUp);
		window.addEventListener("keydown", onKeyDown);
	}

	function onPointerMove(e: PointerEvent) {
		if (!pending || !active) return;
		if (params.readonly) {
			cancelActiveDrag();
			return;
		}

		if (!started) {
			const dx = e.clientX - startX;
			const dy = e.clientY - startY;
			if (dx * dx + dy * dy < DRAG_THRESHOLD_PX * DRAG_THRESHOLD_PX) return;
			beginDrag(e, active);
		}
		active.dnd.pointer = { x: e.clientX, y: e.clientY };
		updateTarget(e.clientX, e.clientY, active);
	}

	function onPointerUp() {
		teardownListeners();
		if (started && active) {
			commitDrop(active);
			active.dnd.reset();
			document.body.style.userSelect = "";
			suppressNextClick();
		}
		pending = false;
		started = false;
		active = null;
	}

	function onKeyDown(e: KeyboardEvent) {
		if (e.key !== "Escape" || !started || !active) return;
		cancelActiveDrag();
	}

	function beginDrag(e: PointerEvent, a: Resolved) {
		const rect = a.cardEl.getBoundingClientRect();
		a.dnd.width = rect.width;
		a.dnd.height = rect.height;
		a.dnd.offset = { x: startX - rect.left, y: startY - rect.top };
		a.dnd.pointer = { x: e.clientX, y: e.clientY };
		a.dnd.cardId = a.id;
		a.dnd.sourceColumn = a.column;
		a.dnd.target = { column: a.column, beforeId: null };
		a.dnd.active = true;
		document.body.style.userSelect = "none";
		started = true;
	}

	function teardownListeners() {
		window.removeEventListener("pointermove", onPointerMove);
		window.removeEventListener("pointerup", onPointerUp);
		window.removeEventListener("keydown", onKeyDown);
	}

	function cancelActiveDrag() {
		teardownListeners();
		if (started && active) {
			active.dnd.reset();
			document.body.style.userSelect = "";
		}
		pending = false;
		started = false;
		active = null;
	}

	node.addEventListener("pointerdown", onPointerDown);

	return {
		update(next: CardDragParams) {
			params = next;
			if (params.readonly && (pending || started)) cancelActiveDrag();
		},
		destroy() {
			node.removeEventListener("pointerdown", onPointerDown);
			cancelActiveDrag();
		},
	};
}

function updateTarget(x: number, y: number, a: Resolved) {
	const el = document.elementFromPoint(x, y);
	const columnEl = el
		? (el.closest("[data-kanban-column-cards]") as HTMLElement | null)
		: null;

	if (!columnEl) {
		// keep the last known target so the placeholder stays visible when the
		// pointer briefly leaves a column
		return;
	}

	const columnId = getID(
		columnEl,
		"data-kanban-column-cards"
	) as ColumnID | null;
	if (columnId == null) return;

	const viewData = a.store.getState().viewData;
	const column = viewData.columns.find((c: ColumnView) => c.id === columnId);
	if (!column) return;

	const cardEls = Array.from(
		columnEl.querySelectorAll<HTMLElement>("[data-kanban-card-id]")
	).filter(n => getID(n, "data-kanban-card-id") !== a.id);

	let beforeId: CardID | null = null;
	for (const cardEl of cardEls) {
		const rect = cardEl.getBoundingClientRect();
		if (y < rect.top + rect.height / 2) {
			beforeId = resolveRenderedCardId(
				column,
				getID(cardEl, "data-kanban-card-id") as CardID | null
			);
			break;
		}
	}

	if (beforeId == null) {
		beforeId = resolveRenderedCardId(
			column,
			getID(columnEl, "data-kanban-after-rendered-before-id") as CardID | null
		);
	}

	const next = { column: column.id, beforeId };
	const prev = a.dnd.target;
	if (!prev || prev.column !== next.column || prev.beforeId !== next.beforeId) {
		a.dnd.target = next;
	}
}

function resolveRenderedCardId(
	column: ColumnView,
	id: CardID | null
): CardID | null {
	if (id == null) return null;
	return column.cards.find(card => card.id === id)?.id ?? null;
}

function commitDrop(a: Resolved) {
	const target = a.dnd.target;
	if (!target) return;

	const payload: { id: CardID; column?: ColumnID; before?: CardID | null } = {
		id: a.id,
		column: target.column,
	};
	if (target.beforeId != null) payload.before = target.beforeId;

	void a.store.exec("move-card", payload);
}

function suppressNextClick() {
	const handler = (e: Event) => {
		e.preventDefault();
		e.stopPropagation();
		window.removeEventListener("click", handler, true);
	};
	window.addEventListener("click", handler, true);
	// if no click follows (pointerup without a click event), drop the listener
	// on the next tick so it doesn't swallow a later unrelated click.
	setTimeout(() => window.removeEventListener("click", handler, true), 0);
}
