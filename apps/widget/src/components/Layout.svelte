<script lang="ts">
	import type { CardListSlotProps } from "../types.js";
	import type { Component } from "svelte";
	import { getContext, onDestroy, setContext } from "svelte";
	import {
		delegateClick,
		hotkeys,
		locate,
		locateID,
		type ILocale,
	} from "@svar-ui/lib-dom";
	import { Popup } from "@svar-ui/svelte-core";

	import type { KanbanCard, CardID, ColumnID } from "@svar-ui/kanban-store";

	import Column from "./Column.svelte";
	import Stack from "./Stack.svelte";
	const Swimlanes = Column as Component<any>; // pro feature, never rendered: MIT has no lanes
	const useCardProjection = (_: unknown) => {}; // pro feature
	import DragGhost from "./DragGhost.svelte";
	import type { DndState } from "./useDrag.svelte.js";
	import { cardDrag } from "../directives/drag.js";
	import type {
		KanbanContextApi,
		CardShape,
		RenderConfig,
		CardCssFn,
		ColumnCssFn,
		CardProjection,
	} from "../types.js";
	import {
		KANBAN_API_CONTEXT,
		SCROLL_CONTAINER_CONTEXT,
		DND_CONTEXT,
	} from "../context.js";
	import { useCardOverlay } from "./useCardOverlay.svelte.js";

	type Props = {
		cardShape: CardShape;
		readonly?: boolean;
		render?: RenderConfig;
		cardContent?: Component<{ card: KanbanCard; cardShape: CardShape }>;
		tooltip?: any;
		cardPopup?: any;
		cardListStart?: Component<CardListSlotProps>;
		cardListEnd?: Component<CardListSlotProps>;
		cardCss?: CardCssFn;
		columnCss?: ColumnCssFn;
		cardProjection?: CardProjection | null;
	};

	let {
		readonly = false,
		render,
		cardContent,
		cardShape,
		tooltip,
		cardPopup,
		cardListStart,
		cardListEnd,
		cardCss,
		columnCss,
		cardProjection = null,
	}: Props = $props();

	const stack = $derived(render?.layout === "stack");
	const fixedColumnWidth = $derived(render?.fixedColumnWidth ?? true);
	const virtualizeCards = $derived(render?.virtualizeCards ?? false);
	const virtualizeColumns = $derived(render?.virtualizeColumns ?? false);
	const estimatedCardHeight = $derived(render?.estimatedCardHeight ?? 80);
	const cardOverscan = $derived(render?.cardOverscan ?? 5);
	const columnOverscan = $derived(render?.columnOverscan ?? 1);

	const store = getContext<KanbanContextApi>(KANBAN_API_CONTEXT);
	const { viewData } = store.getReactiveState();
	const hasSwimlanes = $derived($viewData.swimlanes.length > 0);
	// Lanes and the stack layout override the effective scroll mode without
	// touching the caller's value, so leaving either restores the preference.
	const columnScroll = $derived(
		!stack && !hasSwimlanes && (render?.columnScroll ?? true)
	);

	const brandmark = store.getBrandmark();

	const _ = getContext<ILocale>("wx-i18n").getGroup("kanban");

	const dnd = getContext<DndState>(DND_CONTEXT);

	let root: HTMLElement | undefined = $state();
	let board: HTMLElement | undefined = $state();
	let scroll: HTMLElement | undefined = $state();
	let visibleColumnIds = $state(new Set<ColumnID>());
	let visibilityFrame = 0;
	const columnElements = new Map<ColumnID, HTMLElement>();

	setContext(SCROLL_CONTAINER_CONTEXT, () =>
		columnScroll ? null : (scroll ?? null)
	);

	function sameSet(a: Set<ColumnID>, b: Set<ColumnID>) {
		if (a.size !== b.size) return false;
		for (const value of a) {
			if (!b.has(value)) return false;
		}
		return true;
	}

	function setVisibleColumns(next: Set<ColumnID>) {
		if (!sameSet(visibleColumnIds, next)) {
			visibleColumnIds = next;
		}
	}

	function updateColumnVisibility() {
		if (stack) return;
		if (!virtualizeColumns || !scroll) {
			setVisibleColumns(new Set());
			return;
		}

		const columns = $viewData.columns;
		if (!columns.length) {
			setVisibleColumns(new Set());
			return;
		}

		const scrollRect = scroll.getBoundingClientRect();
		let first = -1;
		let last = -1;

		for (let i = 0; i < columns.length; i++) {
			const element = columnElements.get(columns[i].id);
			if (!element) continue;

			const rect = element.getBoundingClientRect();
			if (rect.right >= scrollRect.left && rect.left <= scrollRect.right) {
				if (first === -1) first = i;
				last = i;
			}
		}

		if (first === -1 || last === -1) {
			setVisibleColumns(new Set());
			return;
		}

		const overscan = Math.max(0, Math.floor(columnOverscan || 0));
		first = Math.max(0, first - overscan);
		last = Math.min(columns.length - 1, last + overscan);

		const next = new Set<ColumnID>();
		for (let i = first; i <= last; i++) {
			next.add(columns[i].id);
		}
		setVisibleColumns(next);
	}

	function scheduleColumnVisibility(..._tracked: unknown[]) {
		if (stack || visibilityFrame) return;
		visibilityFrame = requestAnimationFrame(() => {
			visibilityFrame = 0;
			updateColumnVisibility();
		});
	}

	function registerColumn(id: ColumnID, element: HTMLElement | null) {
		if (element) columnElements.set(id, element);
		else columnElements.delete(id);

		scheduleColumnVisibility();
	}

	function updateScrollHeightVar() {
		if (!scroll) return;
		scroll.style.setProperty(
			"--wx-kanban-scroll-height",
			`${scroll.clientHeight}px`
		);
	}

	function isColumnContentVisible(id: ColumnID) {
		return (
			!virtualizeColumns ||
			visibleColumnIds.size === 0 ||
			visibleColumnIds.has(id)
		);
	}

	function isColumnRequestVisible(id: ColumnID) {
		return !virtualizeColumns || visibleColumnIds.has(id);
	}

	function getCard(id: CardID): KanbanCard | undefined {
		return store.getState().cards.getById(id);
	}

	const overlay = useCardOverlay(getCard, "right-start");

	const popupExtra: Record<string, any> = { trackScroll: true };

	function selectCard(id: CardID | null) {
		if (!readonly && id != null) {
			store.exec("select-card", { id });
		}
	}

	function handleCardClick(id: CardID | null, ev?: Event) {
		// suppress the click that fires right after a pointerup ends a drag
		if (readonly || dnd?.active) return;
		if (cardPopup && id != null) {
			const target = ev?.target as HTMLElement | undefined;
			const el = target ? locate(target) : null;
			if (el) {
				overlay.handleCardPopup({ cardId: id, element: el });
				return;
			}
		}

		selectCard(id);
	}

	function handleCardKey(e?: KeyboardEvent) {
		if (readonly) return;

		const active = document.activeElement;
		if (!(active instanceof HTMLElement) || !active.matches(".wx-card")) return;
		e?.preventDefault();
		const id = active ? (locateID(active as Element) as CardID | null) : null;
		if (cardPopup && id != null && active) {
			overlay.handleCardPopup({
				cardId: id,
				element: active as HTMLElement,
			});
			return;
		}
		selectCard(id);
	}

	function delegateCardClick(node: HTMLElement) {
		delegateClick(node, {
			click: handleCardClick,
			// the ⋯ button must not select the card; the click bubbles on to an
			// outer CardActionMenu, which owns the menu
			menu: () => {},
		});
	}

	function cardHotkeys(node: HTMLElement) {
		const destroy = hotkeys.subscribe(keys => {
			keys.configure(
				{
					enter: handleCardKey,
					space: handleCardKey,
				},
				node
			);
		});

		return { destroy };
	}

	$effect(() => {
		scheduleColumnVisibility(
			virtualizeColumns,
			columnOverscan,
			fixedColumnWidth,
			$viewData.columns
		);
	});

	$effect(() => {
		if (
			stack ||
			!scroll ||
			!virtualizeColumns ||
			typeof ResizeObserver === "undefined"
		)
			return;

		const observer = new ResizeObserver(() => scheduleColumnVisibility());
		observer.observe(scroll);

		return () => observer.disconnect();
	});

	$effect(() => {
		if (!scroll) return;

		updateScrollHeightVar();
		window.addEventListener("resize", updateScrollHeightVar);

		if (typeof ResizeObserver === "undefined") {
			return () => window.removeEventListener("resize", updateScrollHeightVar);
		}

		const observer = new ResizeObserver(updateScrollHeightVar);
		observer.observe(scroll);

		return () => {
			observer.disconnect();
			window.removeEventListener("resize", updateScrollHeightVar);
		};
	});

	useCardProjection({
		board: () => board,
		// The stack layout has no drag, including external drag-in.
		projection: () => (stack ? null : cardProjection),
		model: () => $viewData,
		store,
		dnd,
	});

	onDestroy(() => {
		if (visibilityFrame) cancelAnimationFrame(visibilityFrame);
	});
</script>

<div
	class="wx-kanban"
	role="region"
	aria-label={_("Kanban board")}
	bind:this={root}
>
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<div
		class="wx-board"
		class:wx-scroll-board={!columnScroll}
		class:wx-layout-flex={!stack && !fixedColumnWidth}
		class:wx-layout-stack={stack}
		class:wx-lanes={!stack && hasSwimlanes}
		bind:this={board}
		use:cardDrag={{ dnd, store, readonly, disabled: stack }}
		use:delegateCardClick
		use:cardHotkeys
		onmousemove={tooltip ? overlay.handleTooltipMove : undefined}
		onmouseleave={tooltip ? overlay.handleTooltipLeave : undefined}
	>
		<div
			class="wx-scroll"
			bind:this={scroll}
			onscroll={scheduleColumnVisibility}
		>
			{#if stack}
				<Stack
					model={$viewData}
					{scroll}
					{readonly}
					{cardContent}
					{cardShape}
					{virtualizeCards}
					{estimatedCardHeight}
					{cardOverscan}
					{virtualizeColumns}
					{cardListStart}
					{cardListEnd}
					{cardCss}
					{columnCss}
				/>
			{:else if hasSwimlanes}
				<Swimlanes
					model={$viewData}
					{scroll}
					{readonly}
					{cardContent}
					{cardShape}
					{virtualizeCards}
					{estimatedCardHeight}
					{cardOverscan}
					{fixedColumnWidth}
					{registerColumn}
					{cardListStart}
					{cardListEnd}
					{cardCss}
					{columnCss}
					contentVisible={isColumnContentVisible}
					requestVisible={isColumnRequestVisible}
				/>
			{:else}
				<div class="wx-content">
					{#each $viewData.columns as column (column.id)}
						<Column
							{column}
							{readonly}
							{cardContent}
							{cardShape}
							contentVisible={isColumnContentVisible(column.id)}
							requestVisible={isColumnRequestVisible(column.id)}
							{virtualizeCards}
							{estimatedCardHeight}
							{cardOverscan}
							{fixedColumnWidth}
							{registerColumn}
							{cardListStart}
							{cardListEnd}
							{cardCss}
							{columnCss}
						/>
					{/each}
				</div>
			{/if}
		</div>
	</div>
	{#if brandmark}
		<a style={brandmark.style} href={brandmark.link} target="_blank">
			{brandmark.text}
		</a>
	{/if}
	<DragGhost {root} {cardContent} {cardShape} />

	{#if overlay.tooltipState && tooltip}
		{@const TooltipCmp = tooltip}
		<div
			class="wx-tooltip"
			style="position:fixed;left:{overlay.mousePos.x + 12}px;top:{overlay
				.mousePos.y + 16}px;z-index:10000;pointer-events:none"
			aria-hidden="true"
		>
			<TooltipCmp card={overlay.tooltipState.card} />
		</div>
	{/if}

	{#if overlay.cardPopupState && cardPopup}
		{@const CardPopupCmp = cardPopup}
		<Popup
			at={overlay.cardPopupState.at}
			parent={overlay.cardPopupState.element}
			oncancel={overlay.hideCardPopup}
			{...popupExtra}
		>
			<CardPopupCmp
				card={overlay.cardPopupState.card}
				close={overlay.hideCardPopup}
			/>
		</Popup>
	{/if}
</div>

<style>
	.wx-kanban {
		display: flex;
		flex-direction: column;
		height: 100%;
		width: 100%;
		position: relative;
		background: var(--wx-kanban-bg);
		overflow: hidden;
	}

	.wx-board {
		flex: 1;
		padding: 12px;
		box-sizing: border-box;
		min-height: 0;
	}

	/* The scroll wrapper sits inside the padded board, so the padding stays at
	   the edges and never scrolls away. */
	.wx-scroll {
		height: 100%;
		overflow-x: auto;
		overflow-y: hidden;
	}

	.wx-content {
		display: flex;
		gap: 12px;
		align-items: stretch;
		min-height: 100%;
		box-sizing: border-box;
	}

	.wx-board:not(.wx-scroll-board) .wx-content {
		height: 100%;
		min-height: 0;
	}

	.wx-board:not(.wx-scroll-board) :global(.wx-column:not(.wx-collapsed)) {
		height: 100%;
		min-height: 0;
	}

	.wx-board:not(.wx-scroll-board) :global(.wx-column.wx-collapsed) {
		height: 100%;
		min-height: 0;
	}

	/* board-wide vertical scroll (columnScroll: false) */
	.wx-scroll-board .wx-scroll {
		overflow-y: auto;
	}

	.wx-scroll-board :global(.wx-column) {
		max-height: none;
		overflow: visible;
	}

	.wx-scroll-board:not(.wx-lanes) :global(.wx-column.wx-collapsed) {
		position: sticky;
		top: 0;
		z-index: 1;
		align-self: flex-start;
		height: var(--wx-kanban-scroll-height, 100%);
		max-height: var(--wx-kanban-scroll-height, 100%);
		overflow: hidden;
	}

	.wx-scroll-board :global(.wx-column-cards) {
		overflow: visible;
		flex: none;
	}

	.wx-scroll-board:not(.wx-lanes) :global(.wx-column-header) {
		position: sticky;
		top: 0;
		z-index: 1;
		background: var(--wx-kanban-column-bg);
	}

	/* single vertical column of groups (layout: "stack"): one scroll axis */
	.wx-layout-stack .wx-scroll {
		overflow-x: hidden;
		overflow-y: auto;
	}

	/* Without drag, a finger starting on a card must scroll the board. */
	.wx-layout-stack :global(.wx-card) {
		touch-action: auto;
	}

	/* flexible columns sharing viewport width (fixedColumnWidth: false) */
	.wx-layout-flex :global(.wx-column:not(.wx-collapsed)) {
		flex: 1 1 0;
		min-width: 240px;
	}
</style>
