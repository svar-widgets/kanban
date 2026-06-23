import { getID, locate } from "@svar-ui/lib-dom";
import type { TPosition } from "@svar-ui/lib-dom";
import type { CardID, KanbanCard } from "@svar-ui/kanban-store";

export type CardPopupInfo = {
	cardId: CardID;
	element: HTMLElement;
};

export function useCardOverlay(
	getCard: (id: CardID) => KanbanCard | undefined,
	popupAt: TPosition = "right-start"
) {
	let _tooltipTarget: HTMLElement | null = null;
	let tooltipState = $state<{ card: KanbanCard } | null>(null);
	let mousePos = $state({ x: 0, y: 0 });
	let cardPopupState = $state<{
		card: KanbanCard;
		element: HTMLElement;
		at: TPosition;
	} | null>(null);

	function handleTooltipMove(e: MouseEvent) {
		mousePos = { x: e.clientX, y: e.clientY };
		if (cardPopupState || !e.target) return;
		const el = locate(e.target as HTMLElement) ?? null;
		if (el === _tooltipTarget) return;
		_tooltipTarget = el;
		if (!el) {
			tooltipState = null;
			return;
		}
		const card = getCard(getID(el) as CardID);
		tooltipState = card ? { card } : null;
	}

	function handleTooltipLeave() {
		_tooltipTarget = null;
		tooltipState = null;
	}

	function handleCardPopup(info: CardPopupInfo | null) {
		tooltipState = null;
		_tooltipTarget = null;
		if (!info) {
			cardPopupState = null;
			return;
		}
		const card = getCard(info.cardId);
		if (card) {
			cardPopupState = {
				card,
				element: info.element,
				at: popupAt,
			};
		}
	}

	function hideCardPopup() {
		cardPopupState = null;
	}

	return {
		get tooltipState() {
			return tooltipState;
		},
		get mousePos() {
			return mousePos;
		},
		get cardPopupState() {
			return cardPopupState;
		},
		handleTooltipMove,
		handleTooltipLeave,
		handleCardPopup,
		hideCardPopup,
	};
}
