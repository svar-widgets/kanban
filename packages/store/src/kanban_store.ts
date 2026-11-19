import { Store, EventBus, DataRouter } from "@svar-ui/lib-state";
import type { TDataConfig, TWritableCreator } from "@svar-ui/lib-state";

import type {
	Brandmark,
	IData,
	State,
	StateInput,
	StoreActions,
	HistoryActionName,
	KanbanStoreOptions,
} from "./types";

import { CardsStore } from "./cards_store";
import { KanbanModel } from "./model";


import { init } from "./actions/index";
import { reactive } from "./kanban_reactive";

declare const __TRIAL__: boolean;
declare const window: any;

export class KanbanStore extends Store<IData> {
	public in: EventBus<StoreActions, keyof StoreActions>;
	public meta: Record<string, any>;
	public _autoColumns = false;
	public _autoSwimlanes = false;
	private _router: DataRouter<State, Partial<State>, StoreActions>;


	constructor(w: TWritableCreator, options?: KanbanStoreOptions) {
		super({ writable: w, async: false });

		this.meta = {};

		this._router = new DataRouter(super.setState.bind(this), reactive(this), {
			columns: v => [...(v ?? [])],
			swimlanes: (v: StateInput["swimlanes"]) =>
				v?.map(lane => ({ ...lane })) ?? [],
			cards: v => new CardsStore(v),
		});

		// Initialize with default values
		super.setState({
			cards: new CardsStore([]),
			columns: [],
			columnAccessor: "column",
			swimlanes: [],
			swimlaneAccessor: "swimlane",
			filters: new Map(),
			sort: null,
			editorData: null,
			dynamicData: false,
			columnData: new Map(),
			history: { undo: 0, redo: 0 },
			viewData: new KanbanModel({ columns: [] }),
		});


		// Setup event bus for handling all the actions
		const inBus = (this.in = new EventBus());
		init(inBus, this);
	}

	init(state: StateInput) {
		this._autoColumns = state.columns === undefined;
		this._autoSwimlanes = state.swimlanes === undefined;
		this._router.init(state as any);
	}

	getCards() {
		return this.getState().cards.getCards();
	}

	resetHistory() {
		// do nothing
	}

	getBrandmark(): Brandmark | null {
		if (__TRIAL__) {
			if (typeof window !== "undefined") {
				const { hostname } = window.location;
				if (hostname === "svar.dev" || hostname.endsWith(".svar.dev")) {
					return null;
				}
			}

			const color =
				new Date().getTime() - new Date(2026, 9, 1).getTime() < 0
					? "#bbb"
					: "#fc6519";

			return {
				text: "SVAR Kanban Trial",
				link: "https://svar.dev",
				style: [
					"right:26px",
					"bottom:8px",
					"color:" + color,
					"font-size:12px",
					"font-weight:500",
					"z-index:100001",
					"position:absolute",
					"text-decoration: none",
				].join(";"),
			};
		}
		return null;
	}

	setState(state: Partial<IData>, ctx?: TDataConfig) {
		// history sets cards as an array. We need to convert it to a CardsStore
		if (state.cards && Array.isArray(state.cards)) {
			state = { ...state, cards: new CardsStore(state.cards) };
		}

		// FIXME: it would be better to call history reset when cards or columns are changed
		// unfortunately, router doesn't provide such info
		return this._router.setState(state, ctx);
	}
}
