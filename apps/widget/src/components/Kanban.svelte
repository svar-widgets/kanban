<script lang="ts">
	import type { Component } from "svelte";
	import { setContext } from "svelte";
	import { writable } from "svelte/store";

	import { EventBusRouter } from "@svar-ui/lib-state";
	import { KanbanStore } from "@svar-ui/kanban-store";
	import type {
		KanbanCard,
		ColumnConfig,
		ColumnAccessor,
		SortCriterion,
		FilterPredicate,
	} from "@svar-ui/kanban-store";

	import Layout from "./Layout.svelte";
	import ExportLayout from "./ExportLayout.svelte";

	import type {
		CardShape,
		KanbanInstanceApi,
		KanbanContextApi,
		RenderConfig,
		CardCssFn,
		ColumnCssFn,
	} from "../types.js";
	import { KANBAN_API_CONTEXT, DND_CONTEXT } from "../context.js";
	import { DndState } from "./useDrag.svelte.js";
	import { getCardShape } from "../defaults.js";

	// locales
	import { en } from "@svar-ui/kanban-locales";
	import { en as coreEn } from "@svar-ui/core-locales";
    import { Locale } from "@svar-ui/svelte-core";

	type Props = {
		cards: KanbanCard[];
		columns: ColumnConfig[];
		columnAccessor?: ColumnAccessor;
		filters?: Map<string, FilterPredicate>;
		sort?: SortCriterion;
		card?: CardShape;
		readonly?: boolean;
		render?: RenderConfig;
		dynamicData?: boolean;
		history?: boolean;
		cardContent?: Component<{ card: KanbanCard; cardShape: CardShape }>;
		init?: (api: KanbanInstanceApi) => void;
		tooltip?: any;
		cardPopup?: any;
		cardCss?: CardCssFn;
		columnCss?: ColumnCssFn;
	};

	let {
		cards,
		columns,
		columnAccessor = "column",
		filters = new Map(),
		sort = null,
		card = getCardShape(),
		readonly = false,
		render,
		dynamicData = false,
		history = false,
		cardContent,
		init,
		tooltip,
		cardPopup,
		cardCss,
		columnCss,
		...restProps
	}: Props = $props();

	// svelte-ignore state_referenced_locally
	const store = new KanbanStore(writable, { undo: history });
	// define event route
	let firstInRoute = store.in;

	const dash = /-/g;
	let lastInRoute: any = new EventBusRouter((a: string, b: any) => {
		const name = "on" + a.replace(dash, "");
		const handler = (restProps as Record<string, (e: any) => void>)[name];
		if (handler) {
			handler(b);
		}
	});
	firstInRoute.setNext(lastInRoute);

	

	export const
		getState = store.getState.bind(store),
		getReactiveState = store.getReactive.bind(store),
		getStores = () => ({ data: store }),
		getCards = store.getCards.bind(store),
		exec = store.in.exec.bind(store.in),
		on = store.in.on.bind(store.in),
		detach = store.in.detach.bind(store.in),
		setNext = store.in.setNext.bind(store.in),
		intercept = store.in.intercept.bind(store.in);

	const api: KanbanInstanceApi = {
		getState,
		getReactiveState,
		getStores,
		getCards,
		setNext,
		exec,
		on,
		detach,
		intercept,
	};


	setContext(KANBAN_API_CONTEXT, {
		getReactiveState, getState, exec,
		getBrandmark: store.getBrandmark.bind(store),
	} as KanbanContextApi);
	setContext(DND_CONTEXT, new DndState());


	const input = () => ({ cards, columns, columnAccessor, filters, sort, dynamicData });

	store.init({ ...input(), renderMode: "" });
	// svelte-ignore state_referenced_locally
	init?.(api);

	let firstEffect = true;
	$effect(() => {
		const data = input();
		if (firstEffect) { firstEffect = false; return; }
		store.init(data);
	});

	$effect(() => {
		store.meta["export-data"] = { card, cardContent, cardCss, columnCss };
	});

	const renderMode = store.getReactive().renderMode;
</script>

<Locale words={{...coreEn, ...en}} optional={true}>
	<Layout
		cardShape={card}
		{readonly}
		{render}
		{cardContent}
		{tooltip}
		{cardPopup}
		{cardCss}
		{columnCss}
	/>
	{#if $renderMode === "export"}
		<ExportLayout
			cardShape={card}
			{cardContent}
			{cardCss}
			{columnCss}
		/>
	{/if}
</Locale>