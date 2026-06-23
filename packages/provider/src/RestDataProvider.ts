import { Rest } from "@svar-ui/lib-data-provider";
import type { ActionMap } from "@svar-ui/lib-data-provider";
import type { KanbanCard, StoreActions } from "@svar-ui/kanban-store";

type TMethodsConfig = Pick<
	StoreActions,
	"add-card" | "update-card" | "delete-card" | "move-card" | "duplicate-card"
>;

export default class RestDataProvider extends Rest<TMethodsConfig> {
	getHandlers(): ActionMap<TMethodsConfig> {
		return {
			"add-card": {
				ignoreID: true,
				handler: async data => {
					return this.send("cards", "POST", data.card);
				},
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
				ignoreID: true,
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
