export type LogEntry = { id: number; time: string; text: string };

// Reactive list of messages shown by EventLog; newest first.
export class EventLogState {
	entries = $state<LogEntry[]>([]);
	#next = 1;
	#limit: number;

	constructor(limit = 50) {
		this.#limit = limit;
	}

	add(text: string) {
		const time = new Date().toLocaleTimeString();
		this.entries = [{ id: this.#next++, time, text }, ...this.entries].slice(
			0,
			this.#limit
		);
	}

	clear() {
		this.entries = [];
	}
}
