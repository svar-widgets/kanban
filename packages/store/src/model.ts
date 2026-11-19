import type {
	ColumnView,
	SwimlaneView,
	KanbanModel as KanbanModelData,
} from "./types";

export class KanbanModel implements KanbanModelData {
	columns: ColumnView[];
	swimlanes: SwimlaneView[];

	constructor(data: Partial<KanbanModelData> = {}) {
		this.columns = data.columns ?? [];
		this.swimlanes = data.swimlanes ?? [];
	}
}
