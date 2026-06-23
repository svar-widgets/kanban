import type { CardsStore } from "./cards_store";

export type Brandmark = {
	text: string;
	link?: string;
	style: string;
};

export type CardID = string | number;
export type ColumnID = string | number;
export type ColumnDataStatus = "unknown" | "loading" | "loaded";

export type ColumnDataState = {
	status: ColumnDataStatus;
};

export type KanbanCard = {
	id: CardID;
	[key: string]: any;
};

export type ColumnConfig = {
	id: ColumnID;
	label: string;
	css?: string;
	metadata?: Record<string, any>;
	cardLimit?: number | boolean;
	addCard?: boolean;
	collapsed?: boolean;
};

export type ColumnView = {
	id: ColumnID;
	label: string;
	css?: string;
	metadata?: Record<string, any>;
	cardLimit?: number | boolean;
	addCard: boolean;
	collapsed: boolean;
	overLimit: boolean;
	dataStatus: ColumnDataStatus;
	cards: KanbanCard[];
};

export type KanbanModel = {
	columns: ColumnView[];
};

export type ColumnAccessor =
	| string
	| {
			get: (card: KanbanCard) => ColumnID;
			set: (card: KanbanCard, value: ColumnID) => KanbanCard;
	  };

export type SortCriterion =
	| ((a: KanbanCard, b: KanbanCard) => number)
	| { field: string; dir?: "asc" | "desc" }
	| null;

export type FilterPredicate = (card: KanbanCard) => boolean;

export type State = {
	renderMode: string;
	cards: CardsStore;
	columns: ColumnConfig[];
	columnAccessor: ColumnAccessor;
	filters: Map<string, FilterPredicate>;
	sort: SortCriterion;
	editorData: KanbanCard | null;
	dynamicData: boolean;
	columnData: Map<ColumnID, ColumnDataState>;
	history: HistoryState;
	viewData: KanbanModel;
};

export type IData = State;

export type StateInput = Partial<
	Omit<State, "cards" | "columns" | "filters"> & {
		cards: KanbanCard[] | CardsStore;
		columns: ColumnConfig[];
		filters: Map<string, FilterPredicate>;
	}
>;

export type KanbanStoreOptions = {
	undo?: boolean;
};

export type HistoryState = {
	undo: number;
	redo: number;
};

export type HistoryActionName =
	| "add-card"
	| "update-card"
	| "move-card"
	| "duplicate-card"
	| "delete-card";

export type ExportConfig = {
	url?:
		| string
		| ((
				data: ExportConfig,
				records: KanbanCard[],
				helpers: ExportHelpers
		  ) => void);
	format?: string;
	fileName?: string;
	skin?: string;
	paper?: {
		fitSize?: boolean;
		size?:
			| string
			| {
					width: number;
					height: number;
			  };
		landscape?: boolean;
		styles?: string | string[];
		margins?: {
			top?: number;
			bottom?: number;
			left?: number;
			right?: number;
		};
		header?: string;
		footer?: string;
		scale?: number;
	};
	excel?: {
		sheetNames?: string[];
		dateFormat?: string;
		// columns?: IGanttColumn[];
		indent?: "native" | "spaces";
	};
	data?: Record<string, any>;
};

export type ExportHelpers = {
	post: (url: string, data: Record<string, string>) => void;
	serialize: (value: any) => string;
};

export interface IKanbanStore {
	getState(): State;
	setState(state: StateInput, ctx?: any): any;
	pushUndo<A extends HistoryActionName>(action: A, ev: StoreActions[A]): void;
	undo(): void;
	redo(): void;
	resetHistory(): void;
}

export interface StoreActions {
	["add-card"]: {
		card: Partial<KanbanCard>;
		edit?: boolean;
		id?: CardID;
		after?: CardID;
	};
	["update-card"]: {
		id: CardID;
		card: Partial<KanbanCard>;
	};
	["move-card"]: {
		id: CardID;
		column?: ColumnID;
		before?: CardID | null;
	};
	["update-column"]: {
		id: ColumnID;
		column: Partial<ColumnConfig>;
	};
	["duplicate-card"]: {
		id: CardID;
		card?: Partial<KanbanCard>;
		edit?: boolean;
	};
	["delete-card"]: {
		id: CardID;
	};
	["select-card"]: {
		id: CardID | null;
	};
	["filter-cards"]: {
		filter?: FilterPredicate | null;
		tag?: string;
	};
	["sort-cards"]: {
		sort?: SortCriterion;
	};
	["request-data"]: {
		id: ColumnID;
	};
	["provide-data"]: {
		id?: ColumnID;
		cards: KanbanCard[];
	};
	["export-data"]: ExportConfig;
	["undo"]: Record<string, never>;
	["redo"]: Record<string, never>;
}
