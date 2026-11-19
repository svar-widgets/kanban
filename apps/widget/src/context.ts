export type CellViewport = {
	subscribe: (callback: () => void) => () => void;
	schedule: () => void;
	inset: () => number;
};
export const CELL_VIEWPORT_CONTEXT = Symbol("wx/kanban-cell-viewport");
export const SCROLL_CONTAINER_CONTEXT = Symbol("wx/kanban-scroll-container");
export const KANBAN_API_CONTEXT = Symbol("kanban-api");
export const DND_CONTEXT = Symbol("wx/kanban-dnd");
