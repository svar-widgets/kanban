import type { Snippet } from "svelte";
import type { EventBus } from "@svar-ui/lib-state";
import type {
	Brandmark,
	KanbanStore,
	StoreActions,
	KanbanCard,
	CardID,
	ColumnID,
	ColumnView,
	SwimlaneID,
	SwimlaneView,
} from "@svar-ui/kanban-store";

export type CardListSlotProps = {
	column: ColumnView;
	swimlane?: SwimlaneView;
	/** All filtered and sorted cards in this area. */
	cards: KanbanCard[];
	readonly: boolean;
};

export type CardCssFn = (card: KanbanCard, column: ColumnView) => string;
export type ColumnCssFn = (cards: KanbanCard[], column: ColumnView) => string;

type ShapeConfig<T> = boolean | T;

export type CardShapeItem = {
	id: CardID;
	label: string;
	css?: string;
};

export type CardShapeUserItem = {
	id: CardID;
	label: string;
	img?: string;
};

export type CardPriorityShape = {
	data?: CardShapeItem[];
};

export type CardTagsShape = {
	max?: number;
	data?: CardShapeItem[];
};

export type CardUsersShape = {
	max?: number;
	data?: CardShapeUserItem[];
};

export type CardDeadlineShape = {
	format?: string | ((date: Date) => string);
};

/** What a column menu was opened for. */
export type ColumnMenuContext = {
	column: ColumnView;
	/** Cards under the clicked header: the column's cards, or one lane's in the stack layout. */
	cards: KanbanCard[];
	/** The lane of the clicked header; only set in the stack layout. */
	swimlane?: SwimlaneView;
};

/** Props shared by `CardActionMenu`, `CardContextMenu`, `ColumnActionMenu` and `ColumnContextMenu`. */
export type KanbanMenuProps<T> = {
	/** Kanban instance (`bind:this` / `init`); the menu stays inert until it is set. */
	api?: KanbanInstanceApi | null;
	/** Items, or a function called on every open. Empty/nullish result - no menu. Omitted - defaults. */
	options?: any[] | ((ctx: T) => any[] | null | undefined | false);
	/** Gate after the target is resolved; falsy - no menu. */
	resolver?: ((ctx: T, ev: MouseEvent) => any) | null;
	/** Per-item filter for the resolved target. */
	filter?: ((item: any, ctx: T) => boolean) | null;
	/** Called after built-in items ran; `ev.context` is the target. */
	onclick?: (ev: any) => void;
	/** Placement, forwarded to the menu (default `"point"`). */
	at?: string;
	css?: string;
	children?: Snippet;
};

export type CardShape = {
	cover?: boolean;
	priority?: ShapeConfig<CardPriorityShape>;
	progress?: ShapeConfig<{ showLabel?: boolean }>;
	deadline?: ShapeConfig<CardDeadlineShape>;
	users?: ShapeConfig<CardUsersShape>;
	tags?: ShapeConfig<CardTagsShape>;
	attachments?: boolean;
	comments?: boolean;
	description?: boolean;
	/** Renders the card ⋯ button for an outer `CardActionMenu`. */
	menu?: boolean;
};

export type EditorShape = {
	description?: boolean;
	priority?: ShapeConfig<CardPriorityShape>;
	progress?: ShapeConfig<{ showLabel?: boolean }>;
	deadline?: ShapeConfig<CardDeadlineShape>;
	tags?: ShapeConfig<CardTagsShape>;
	users?: ShapeConfig<CardUsersShape>;
};

export type RenderConfig = {
	/** `"stack"` renders one vertical column of groups; default `"board"`. */
	layout?: "board" | "stack";
	columnScroll?: boolean;
	fixedColumnWidth?: boolean;
	virtualizeCards?: boolean;
	virtualizeColumns?: boolean;
	estimatedCardHeight?: number;
	cardOverscan?: number;
	columnOverscan?: number;
};

export type { KanbanCard, CardID, ColumnID };

/** Destination resolved by the widget; `before: null` appends to the cell. */
export type CardProjectionTarget = {
	column: ColumnID;
	swimlane?: SwimlaneID;
	before: CardID | null;
};

/**
 * Application-owned external drag descriptor. The host sets `card` and
 * `htmlEvent`; the widget writes `target` and destination membership into `card`.
 */
export type CardProjection = {
	htmlEvent: { clientX: number; clientY: number } | null;
	card: Partial<KanbanCard>;
	target?: CardProjectionTarget | null;
};

type KanbanEventBus = EventBus<StoreActions, keyof StoreActions>;

type KanbanApi = {
	getState: KanbanStore["getState"];
	getReactiveState: KanbanStore["getReactive"];
	exec: KanbanEventBus["exec"];
};

export type KanbanContextApi = KanbanApi & {
	getBrandmark: () => Brandmark | null;
};

export type KanbanInstanceApi = KanbanApi & {
	getStores: () => { data: KanbanStore };
	setNext: (handler: any) => any;
	intercept: KanbanEventBus["intercept"];
	on: KanbanEventBus["on"];
	detach: KanbanEventBus["detach"];
	getCards: KanbanStore["getCards"];
};

// Match EventBusRouter's dash-free callback prop names.
type WithoutDashes<T extends string> = T extends `${infer A}-${infer B}`
	? `${A}${WithoutDashes<B>}`
	: T;
export type KanbanEventHandlers = {
	[A in keyof StoreActions as `on${WithoutDashes<A>}`]?: (
		event: StoreActions[A]
	) => void;
};

export type GroupManagerProps = {
	api?: KanbanInstanceApi | null;
	placement?: "sidebar" | "modal" | "popup" | "inline";
	parent?: HTMLElement;
	swimlanes?: boolean;
	readonly?: boolean;
	onclose?: () => void;
};
