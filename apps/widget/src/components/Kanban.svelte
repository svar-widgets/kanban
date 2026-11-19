<script lang="ts">
	import type { CardListSlotProps } from "../types.js";
	import type { Component } from "svelte";
	import { setContext } from "svelte";
	import { writable } from "svelte/store";

	import { EventBusRouter } from "@svar-ui/lib-state";
	import { KanbanStore } from "@svar-ui/kanban-store";
	import type {
		KanbanCard,
		ColumnConfig,
		ColumnAccessor,
		SwimlaneConfig,
		SwimlaneAccessor,
		SortCriterion,
		FilterPredicate,
	} from "@svar-ui/kanban-store";

	import Layout from "./Layout.svelte";

	const ExportLayout = null; // pro feature

	import type {
		CardShape,
		KanbanInstanceApi,
		KanbanContextApi,
		KanbanEventHandlers,
		RenderConfig,
		CardCssFn,
		ColumnCssFn,
		CardProjection,
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
		// omitted: columns are inferred from the cards through columnAccessor
		columns?: ColumnConfig[];
		columnAccessor?: ColumnAccessor;
		swimlanes?: SwimlaneConfig[];
		swimlaneAccessor?: SwimlaneAccessor;
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
		cardListStart?: Component<CardListSlotProps>;
		cardListEnd?: Component<CardListSlotProps>;
		cardCss?: CardCssFn;
		columnCss?: ColumnCssFn;
		cardProjection?: CardProjection | null;
	} & KanbanEventHandlers;

	let {
		cards,
		columns,
		columnAccessor = "column",
		swimlanes,
		swimlaneAccessor = "swimlane",
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
		cardListStart,
		cardListEnd,
		cardCss,
		columnCss,
		cardProjection = null,
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

	export const getState = store.getState.bind(store),
		getReactiveState = store.getReactive.bind(store),
		getStores = () => ({ data: store }),
		getCards = store.getCards.bind(store),
		exec = store.in.exec.bind(store.in),
		on = store.in.on.bind(store.in),
		detach = store.in.detach.bind(store.in),
		setNext = (ev: any) => (lastInRoute = lastInRoute.setNext(ev)),
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
		getReactiveState,
		getState,
		exec,
		getBrandmark: store.getBrandmark.bind(store),
	} as KanbanContextApi);
	setContext(DND_CONTEXT, new DndState());

	const input = () => ({
		cards,
		columns,
		columnAccessor,
		swimlanes,
		swimlaneAccessor,
		filters,
		sort,
		dynamicData,
	});

	store.init({ ...input(), renderMode: "" });
	// svelte-ignore state_referenced_locally
	init?.(api);

	let firstEffect = true;
	$effect(() => {
		const data = input();
		if (firstEffect) {
			firstEffect = false;
			return;
		}
		store.init(data);
	});


	const renderMode = store.getReactive().renderMode;
</script>

<Locale words={{ ...coreEn, ...en }} optional={true}>
	<Layout
		cardShape={card}
		{readonly}
		{render}
		{cardContent}
		{tooltip}
		{cardPopup}
		{cardListStart}
		{cardListEnd}
		{cardCss}
		{columnCss}
		{cardProjection}
	/>
	{#if ExportLayout && $renderMode === "export"}
		<ExportLayout cardShape={card} {cardContent} {cardCss} {columnCss} />
	{/if}
</Locale>

<style>
	/* TEMPORARY (remove when fixed in @svar-ui/svelte-menu). */
	:global([data-menu-ignore]) {
		display: contents;
	}
</style>
