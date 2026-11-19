import { KanbanStore, type KanbanStoreOptions } from "../../src/index";

function writable<T>(initial: T) {
	let value = initial;
	const subscribers: ((value: T) => void)[] = [];

	return {
		subscribe(fn: (value: T) => void) {
			subscribers.push(fn);
			fn(value);
			return () => {
				const index = subscribers.indexOf(fn);
				if (index !== -1) {
					subscribers.splice(index, 1);
				}
			};
		},
		set(next: T) {
			value = next;
			subscribers.forEach(fn => fn(value));
		},
		update(fn: (value: T) => T) {
			this.set(fn(value));
		},
	};
}

export function createStore(options?: KanbanStoreOptions) {
	return new KanbanStore(writable, options);
}
