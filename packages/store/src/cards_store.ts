import type { CardID, KanbanCard } from "./types";

export class CardsStore {
	private _cards: KanbanCard[];

	constructor(initial: KanbanCard[] = []) {
		this._cards = initial.slice();
		this._cards.forEach(card => this._assertHasId(card));
	}

	getCards(): KanbanCard[] {
		return this._cards;
	}

	getById(id: CardID): KanbanCard | undefined {
		return this._cards.find(card => card.id === id);
	}

	add(card: KanbanCard, after?: CardID): KanbanCard {
		this._assertHasId(card);

		const next = { ...card };
		const index =
			after === undefined
				? -1
				: this._cards.findIndex(item => item.id === after);

		if (index === -1) {
			this._cards.push(next);
		} else {
			this._cards.splice(index + 1, 0, next);
		}

		return next;
	}

	update(id: CardID, patch: Partial<KanbanCard>): KanbanCard | undefined {
		const index = this._cards.findIndex(card => card.id === id);
		if (index === -1) {
			return undefined;
		}

		const next = { ...this._cards[index], ...patch };
		this._assertHasId(next);
		this._cards[index] = next;

		return next;
	}

	upsert(card: KanbanCard): KanbanCard {
		this._assertHasId(card);

		const next = { ...card };
		const index = this._cards.findIndex(item => item.id === card.id);

		if (index === -1) {
			this._cards.push(next);
		} else {
			this._cards[index] = next;
		}

		return next;
	}

	remove(id: CardID): boolean {
		const index = this._cards.findIndex(card => card.id === id);
		if (index === -1) {
			return false;
		}

		this._cards.splice(index, 1);
		return true;
	}

	move(id: CardID, before?: CardID | null): boolean {
		const from = this._cards.findIndex(card => card.id === id);
		if (from === -1) {
			return false;
		}

		if (before === id) {
			return true;
		}

		let to = this._cards.length;
		if (before != null) {
			to = this._cards.findIndex(card => card.id === before);
			if (to === -1) {
				return false;
			}
		}

		const [card] = this._cards.splice(from, 1);
		if (from < to) {
			to -= 1;
		}
		this._cards.splice(to, 0, card);

		return true;
	}

	private _assertHasId(card: KanbanCard) {
		if (card.id == null) {
			throw new Error("Kanban cards must have an id");
		}
	}
}
