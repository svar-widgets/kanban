import type { DataProvider } from "@svar-ui/lib-data-provider";
import { CARDS } from "./RestDataProvider";
import type { EventBus } from "@svar-ui/lib-state";

type EventHandler = (data: any) => void | boolean;
type EventConfigOption = EventHandler | number;

export class EventBridge<E, T> {
	private es: EventSource;

	constructor(
		url: string,
		private clientId: string,
		// structural: accepts KanbanInstanceApi and any provider with a queue (Rest, DataProvider)
		private api: Pick<EventBus<E, keyof E>, "exec">,
		private provider: Pick<DataProvider<T>, "getQueue">,
		events: Record<string, EventConfigOption>
	) {
		const es = (this.es = new EventSource(url));
		for (var key in events) {
			es.addEventListener(key, this._eventHandler(key, events[key]));
		}
	}

	// stops the stream and its auto-reconnect; the bridge cannot be reopened
	close() {
		this.es.close();
	}

	protected resolveId(id: number | string, kind: number) {
		return this.provider.getQueue().resolve(id, kind);
	}

	protected correctId(data: any, kind: number) {
		if (data[kind]) {
			data[kind] = this.resolveId(data[kind], kind);
		}
		return data;
	}

	private _eventHandler(event: string, handler: EventConfigOption) {
		return (ev: MessageEvent) => {
			const data = JSON.parse(ev.data);

			// ignore self generated events
			if (data.client === this.clientId) return;
			let pack = { ...data.data };

			// resolve id or apply custom processing
			if (typeof handler === "number") {
				pack = this.correctId(pack, handler);
			} else if (typeof handler === "function") {
				if (handler(pack) === false) return;
			}

			void this.api.exec(data.op, { skipProvider: true, ...pack });
		};
	}
}

export class KanbanEventBridge extends EventBridge<any, any> {
	protected correctId(data: any, kind: number) {
		if (kind === CARDS) {
			if (data.id) data.id = this.resolveId(data.id, kind);
			if (data.before) data.before = this.resolveId(data.before, kind);
			if (data.card && data.card.id)
				data.card.id = this.resolveId(data.card.id, kind);
			// events arrive as JSON; the widget renders Date deadlines only
			if (data.card && typeof data.card.deadline === "string")
				data.card.deadline = new Date(data.card.deadline);
		}
		return data;
	}
}
