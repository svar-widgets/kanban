import { Rest } from "@svar-ui/lib-data-provider";
import type { ActionMap } from "@svar-ui/lib-data-provider";
import type { KanbanCard, StoreActions } from "@svar-ui/kanban-store";

type TMethodsConfig = Pick<
	StoreActions,
	| "add-card"
	| "update-card"
	| "delete-card"
	| "move-card"
	| "duplicate-card"
	| "add-column"
	| "update-column"
	| "move-column"
	| "delete-column"
	| "add-swimlane"
	| "update-swimlane"
	| "move-swimlane"
	| "delete-swimlane"
>;

export const CARDS = 1;
export const COLUMNS = 2;
export const SWIMLANES = 3;

// lib-data-provider's public Action type omits `kind`, though the runtime supports it
type TActionMap = {
	[P in keyof TMethodsConfig]?: ActionMap<TMethodsConfig>[P] & {
		kind?: number;
	};
};

export default class RestDataProvider extends Rest<TMethodsConfig> {
	getHandlers(): TActionMap {
		return {
			"add-column": {
				ignoreID: true,
				kind: COLUMNS,
				handler: async data =>
					this.send("columns", "POST", {
						...data.column,
						before:
							data.before == null || data.before === data.id
								? null
								: await this.getQueue().waitId(data.before),
					}),
			},
			"update-column": {
				debounce: 500,
				handler: async data =>
					this.send(
						`columns/${encodeURIComponent(data.id)}`,
						"PUT",
						data.column
					),
			},
			"move-column": {
				handler: async data =>
					this.send(`columns/${encodeURIComponent(data.id)}/move`, "PUT", {
						before: data.before ?? null,
					}),
			},
			"delete-column": {
				handler: async data =>
					this.send(`columns/${encodeURIComponent(data.id)}`, "DELETE"),
			},
			"add-swimlane": {
				ignoreID: true,
				kind: SWIMLANES,
				handler: async data =>
					this.send("swimlanes", "POST", {
						...data.swimlane,
						before:
							data.before == null || data.before === data.id
								? null
								: await this.getQueue().waitId(data.before),
					}),
			},
			"update-swimlane": {
				debounce: 500,
				handler: async data =>
					this.send(
						`swimlanes/${encodeURIComponent(data.id)}`,
						"PUT",
						data.swimlane
					),
			},
			"move-swimlane": {
				handler: async data =>
					this.send(`swimlanes/${encodeURIComponent(data.id)}/move`, "PUT", {
						before: data.before ?? null,
					}),
			},
			"delete-swimlane": {
				handler: async data =>
					this.send(`swimlanes/${encodeURIComponent(data.id)}`, "DELETE"),
			},
			"add-card": {
				ignoreID: true,
				kind: CARDS,
				// the store normalizes `after` into `before` before this runs
				handler: async data =>
					this.send("cards", "POST", {
						...data.card,
						before:
							data.before == null || data.before === data.id
								? null
								: await this.getQueue().waitId(data.before),
					}),
			},
			"update-card": {
				debounce: 500,
				handler: async data => {
					return this.send(`cards/${data.id}`, "PUT", data.card);
				},
			},
			"move-card": {
				handler: async data => {
					return this.send(`cards/${data.id}/move`, "PUT", data);
				},
			},
			"delete-card": {
				handler: async data => this.send(`cards/${data.id}`, "DELETE"),
			},
			"duplicate-card": {
				kind: CARDS,
				handler: async data => {
					return this.send(`cards/${data.id}/duplicate`, "POST", data.card);
				},
			},
		};
	}

	async getData(): Promise<KanbanCard[]> {
		const cards: any = await this.send("cards", "GET");
		return this.parseCards(cards);
	}

	parseCards(data: KanbanCard[]): KanbanCard[] {
		data.forEach(item => {
			if (item.deadline)
				item.deadline = new Date(item.deadline as unknown as string);
		});
		return data;
	}

	protected toPayload(obj: object): string {
		return JSON.stringify(obj, (_key, value) => {
			if (value instanceof Date) {
				return this.formatDate(value);
			}
			return value;
		});
	}

	formatDate(date: Date): string {
		return date.toISOString();
	}
}
