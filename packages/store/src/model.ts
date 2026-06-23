import type { ColumnView, KanbanModel as KanbanModelData } from "./types";

export class KanbanModel implements KanbanModelData {
	columns: ColumnView[];

	constructor(data: Partial<KanbanModelData> = {}) {
		this.columns = data.columns || [];
	}
}
