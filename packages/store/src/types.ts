import type { CardsStore } from "./cards_store";

export type Brandmark = {
	text: string;
	link?: string;
	style: string;
};

export type CardID = string | number;
export type ColumnID = string | number;
export type SwimlaneID = string | number;
export type SwimlaneAccessor = ColumnAccessor;
export type SwimlaneConfig = {
	id: SwimlaneID;
	label: string;
	collapsed?: boolean;
	css?: string;
	metadata?: Record<string, any>;
};
export type SwimlaneCellView = { column: ColumnID; cards: KanbanCard[] };
export type SwimlaneView = SwimlaneConfig & {
	collapsed: boolean;
	count: number;
	cells: SwimlaneCellView[];
};
export type ColumnDataStatus = "unknown" | "loading" | "loaded";

export type ColumnDataState = {
	status: ColumnDataStatus;
};

export type KanbanCard = {
	id: CardID;
	[key: string]: any;
};

export type ColumnSummaryConfig<T = any> = {
	id: string;
	calculate: (cards: readonly KanbanCard[], column: ColumnConfig) => T;
	format?: (value: T, column: ColumnConfig) => string;
	css?: (value: T, column: ColumnConfig) => string;
};

export type ColumnSummaryResult<T = any> = {
	id: string;
	value: T;
	text: string;
	css?: string;
};

/** Column dimensions are outer-box CSS pixels. */
export type ColumnConfig = {
	[key: string]: any;
	summaries?: ColumnSummaryConfig[];
	id: ColumnID;
	label: string;
	css?: string;
	metadata?: Record<string, any>;
	width?: number;
	cardWidth?: number;
	cardHeight?: number;
	addCard?: boolean;
	/** Shows the header menu button for an outer `ContextMenu target="column"` (default `false`). */
	menu?: boolean;
	collapsed?: boolean;
};

/**
 * Projected column: custom `ColumnConfig` fields pass through unchanged;
 * `summaries`, `dataStatus` and `cards` are computed and override same-named config fields.
 */
export type ColumnView = Omit<ColumnConfig, "summaries"> & {
	width?: number;
	cardWidth?: number;
	cardHeight?: number;
	id: ColumnID;
	label: string;
	css?: string;
	metadata?: Record<string, any>;
	addCard: boolean;
	menu: boolean;
	collapsed: boolean;
	summaries: ColumnSummaryResult[];
	dataStatus: ColumnDataStatus;
	cards: KanbanCard[];
};

export type KanbanModel = {
	columns: ColumnView[];
	swimlanes: SwimlaneView[];
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
	swimlanes: SwimlaneConfig[];
	swimlaneAccessor: SwimlaneAccessor;
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
	resetHistory(): void;
}

export interface StoreActions {
	["add-column"]: {
		column: Partial<ColumnConfig>;
		id?: ColumnID;
		before?: ColumnID | null;
	};
	["delete-column"]: { id: ColumnID };
	["move-column"]: { id: ColumnID; before?: ColumnID | null };
	["add-swimlane"]: {
		swimlane: Partial<SwimlaneConfig>;
		id?: SwimlaneID;
		before?: SwimlaneID | null;
	};
	["delete-swimlane"]: { id: SwimlaneID };
	["move-swimlane"]: { id: SwimlaneID; before?: SwimlaneID | null };
	["add-card"]: {
		card: Partial<KanbanCard>;
		edit?: boolean;
		id?: CardID;
		/** Insert before this card; `null` appends. Wins over `after`. */
		before?: CardID | null;
		/** Convenience hint, normalized to `before` by the handler. */
		after?: CardID;
	};
	["update-card"]: {
		id: CardID;
		card: Partial<KanbanCard>;
	};
	["move-card"]: {
		id: CardID;
		column?: ColumnID;
		swimlane?: SwimlaneID;
		before?: CardID | null;
	};
	["update-swimlane"]: { id: SwimlaneID; swimlane: Partial<SwimlaneConfig> };
	["update-column"]: {
		id: ColumnID;
		column: Partial<ColumnConfig>;
		skipProvider?: boolean;
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
