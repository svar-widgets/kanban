import type {
	CardID,
	HistoryActionName,
	HistoryState,
	IKanbanStore,
	KanbanCard,
	StoreActions,
} from "./types";

type HistoryEntry = {
	action: HistoryActionName;
	cards: KanbanCard[];
	subject?: CardID;
	updatedAt: number;
};

const TIGHT_GROUP_DELAY = 250;
const UPDATE_GROUP_DELAY = 5000;
const TIGHT_GROUP_ACTIONS = new Set<HistoryActionName>([
	"add-card",
	"move-card",
	"duplicate-card",
	"delete-card",
]);

export class HistoryManager {
	private undoStack: HistoryEntry[] = [];
	private redoStack: HistoryEntry[] = [];

	constructor(
		private store: IKanbanStore,
		private enabled = false
	) {}

	pushUndo<A extends HistoryActionName>(action: A, ev: StoreActions[A]) {
		if (!this.enabled) return;

		const now = Date.now();
		const subject = getSubject(action, ev);
		const hadRedo = this.redoStack.length > 0;

		if (hadRedo) {
			this.redoStack = [];
		}

		const last = this.undoStack[this.undoStack.length - 1];
		if (!hadRedo && last && shouldMerge(last, action, subject, now)) {
			last.updatedAt = now;
			return;
		}

		this.undoStack.push({
			action,
			cards: this.snapshot(),
			subject,
			updatedAt: now,
		});

		this.setHistoryState();
	}

	undo() {
		if (!this.enabled) return;

		const entry = this.undoStack.pop();
		if (!entry) return;

		this.redoStack.push({
			...entry,
			cards: this.snapshot(),
			updatedAt: Date.now(),
		});
		this.restore(entry.cards);
	}

	redo() {
		if (!this.enabled) return;

		const entry = this.redoStack.pop();
		if (!entry) return;

		this.undoStack.push({
			...entry,
			cards: this.snapshot(),
			updatedAt: Date.now(),
		});
		this.restore(entry.cards);
	}

	reset(updateState = true) {
		this.undoStack = [];
		this.redoStack = [];

		if (updateState) {
			this.setHistoryState();
		}
	}

	private snapshot(): KanbanCard[] {
		return this.store.getState().cards.getCards().slice();
	}

	private restore(cards: KanbanCard[]) {
		this.store.setState({
			cards,
			editorData: null,
			history: this.getHistoryState(),
		});
	}

	private setHistoryState() {
		this.store.setState({
			history: this.getHistoryState(),
		});
	}

	private getHistoryState(): HistoryState {
		return {
			undo: this.undoStack.length,
			redo: this.redoStack.length,
		};
	}
}

function shouldMerge(
	last: HistoryEntry,
	action: HistoryActionName,
	subject: CardID | undefined,
	now: number
): boolean {
	const delay = now - last.updatedAt;

	if (action === "update-card") {
		return (
			last.action === action &&
			last.subject === subject &&
			delay <= UPDATE_GROUP_DELAY
		);
	}

	return (
		TIGHT_GROUP_ACTIONS.has(action) &&
		last.action === action &&
		delay <= TIGHT_GROUP_DELAY
	);
}

function getSubject<A extends HistoryActionName>(
	action: A,
	ev: StoreActions[A]
): CardID | undefined {
	if (action === "add-card") {
		const data = ev as StoreActions["add-card"];
		return data.id ?? data.card.id;
	}

	return (ev as { id?: CardID }).id;
}
