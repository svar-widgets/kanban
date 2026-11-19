<script lang="ts">
	import type { CardListSlotProps } from "../types.js";
	import type { Component } from "svelte";
	import { getContext, onDestroy } from "svelte";
	import { setID } from "@svar-ui/lib-dom";
	import type { CardID, ColumnView, KanbanCard } from "@svar-ui/kanban-store";
	import type { KanbanContextApi, CardShape, CardCssFn } from "../types.js";
	import CardWrapper from "./CardWrapper.svelte";

	import {
		KANBAN_API_CONTEXT,
		DND_CONTEXT,
		SCROLL_CONTAINER_CONTEXT,
		CELL_VIEWPORT_CONTEXT,
		type CellViewport,
	} from "../context.js";
	import type { DndState } from "./useDrag.svelte.js";
	import { dblclick } from "../directives/dblclick.js";

	type Props = {
		column: ColumnView;
		cards?: KanbanCard[];
		swimlane?: import("@svar-ui/kanban-store").SwimlaneID;
		swimlaneView?: CardListSlotProps["swimlane"];
		active?: boolean;
		readonly?: boolean;
		cardContent?: Component<{ card: KanbanCard; cardShape: CardShape }>;
		cardShape: CardShape;
		contentVisible: boolean;
		virtualizeCards: boolean;
		estimatedCardHeight: number;
		cardOverscan: number;
		fixedColumnWidth: boolean;
		cardListStart?: Component<CardListSlotProps>;
		cardListEnd?: Component<CardListSlotProps>;
		cardCss?: CardCssFn;
	};

	type Range = {
		start: number;
		end: number;
		top: number;
		bottom: number;
		total: number;
	};

	let {
		column,
		cards: cellCards,
		swimlane,
		swimlaneView,
		active = true,
		readonly = false,
		cardContent,
		cardShape,
		contentVisible,
		virtualizeCards,
		estimatedCardHeight,
		cardOverscan,
		fixedColumnWidth,
		cardListStart,
		cardListEnd,
		cardCss,
	}: Props = $props();

	const cards = $derived(cellCards ?? column.cards);

	function getCardExtraCss(card: KanbanCard): string {
		return cardCss ? (cardCss(card, column) ?? "") : "";
	}

	const store = getContext<KanbanContextApi>(KANBAN_API_CONTEXT);
	const dnd = getContext<DndState>(DND_CONTEXT);
	const getScrollContainer = getContext<(() => HTMLElement | null) | undefined>(
		SCROLL_CONTAINER_CONTEXT
	);
	const { columnAccessor } = store.getReactiveState();
	const viewport = getContext<CellViewport | undefined>(CELL_VIEWPORT_CONTEXT);

	let container: HTMLElement | undefined = $state();
	let range = $state<Range>({
		start: 0,
		end: -1,
		top: 0,
		bottom: 0,
		total: 0,
	});
	let cardGap = $state(8);
	let frame = 0;
	let previousVirtualizeCards = false;
	let offsetsCache: { offsets: number[]; total: number } | undefined;
	let previousCards = new Map<CardID, KanbanCard>();
	let previousTemplate: unknown;
	let previousShape: unknown;
	let measuredWidth = 0;
	let startHeight = 0;
	let paddingTop = 0;

	const HEIGHT_CACHE_LIMIT = 10000;
	const heightCache = new Map<CardID, number>();
	const measuredNodes = new Map<Element, CardID>();
	let cardObserver: ResizeObserver | undefined;

	const dropTarget = $derived(dnd?.preview ?? null);
	const isDropColumn = $derived(
		dropTarget?.column === column.id && dropTarget.swimlane === swimlane
	);
	// External projections have no measured source card.
	const placeholderHeight = $derived(
		dnd?.active ? dnd.height : Math.max(1, estimatedCardHeight || 1)
	);
	const renderStart = $derived(virtualizeCards ? range.start : 0);
	const renderEnd = $derived(virtualizeCards ? range.end : cards.length - 1);
	const renderedCards = $derived(
		contentVisible && active
			? cards.slice(renderStart, Math.max(renderStart, renderEnd + 1))
			: []
	);
	const hiddenHeight = $derived(
		range.total || estimateTotalHeight(cards.length)
	);
	const topSpacerHeight = $derived(
		range.start > 0 ? Math.max(0, range.top - cardGap) : 0
	);
	const bottomSpacerHeight = $derived(Math.max(0, range.bottom));
	const afterRenderedBeforeId = $derived(
		contentVisible &&
			virtualizeCards &&
			renderEnd >= 0 &&
			renderEnd < cards.length - 1
			? cards[renderEnd + 1]?.id
			: undefined
	);
	const trailingPlaceholder = $derived(
		isDropColumn &&
			(dropTarget!.before == null ||
				dropTarget!.before === afterRenderedBeforeId)
	);
	// An append target belongs after the full list extent, below the bottom spacer.
	const appendAfterSpacer = $derived(
		isDropColumn && dropTarget!.before == null && bottomSpacerHeight > 0
	);

	function estimateTotalHeight(count: number): number {
		if (!count) return 0;
		const height = Math.max(1, estimatedCardHeight || 1);
		return count * height + Math.max(0, count - 1) * cardGap;
	}

	function readGap() {
		if (!container) return;
		const styles = getComputedStyle(container);
		paddingTop = Number.parseFloat(styles.paddingTop) || 0;
		const configuredGap = styles.getPropertyValue("--wx-card-gap").trim();
		const raw = configuredGap || styles.rowGap || styles.gap;
		const next = Number.parseFloat(raw);
		const gap = Number.isFinite(next) ? next : 8;
		if (cardGap !== gap) {
			cardGap = gap;
			offsetsCache = undefined;
		}
	}

	function getCardHeight(card: KanbanCard): number {
		return card.id != null
			? (heightCache.get(card.id) ?? Math.max(1, estimatedCardHeight || 1))
			: Math.max(1, estimatedCardHeight || 1);
	}

	function updateMeasuredWidth(width: number): boolean {
		if (!width || measuredWidth === width) return false;

		if (measuredWidth) heightCache.clear();
		measuredWidth = width;
		offsetsCache = undefined;
		return true;
	}

	function buildOffsets() {
		if (offsetsCache) return offsetsCache;
		const offsets = [0];
		let total = 0;

		for (let i = 0; i < cards.length; i++) {
			total += getCardHeight(cards[i]);
			if (i < cards.length - 1) total += cardGap;
			offsets.push(total);
		}

		return (offsetsCache = { offsets, total });
	}

	function upperBound(values: number[], value: number): number {
		let low = 0;
		let high = values.length;

		while (low < high) {
			const mid = Math.floor((low + high) / 2);
			if (values[mid] <= value) low = mid + 1;
			else high = mid;
		}

		return low;
	}

	function recalculate() {
		if (!container) return;

		readGap();
		const contentTop =
			paddingTop + (active && cardListStart ? startHeight + cardGap : 0);

		if (typeof ResizeObserver === "undefined")
			updateMeasuredWidth(container.clientWidth);
		if (!active || !contentVisible || !virtualizeCards) {
			range = {
				start: 0,
				end: active && contentVisible ? cards.length - 1 : -1,
				top: 0,
				bottom: 0,
				total: buildOffsets().total,
			};
			return;
		}

		const count = cards.length;
		if (!count) {
			range = { start: 0, end: -1, top: 0, bottom: 0, total: 0 };
			return;
		}

		const { offsets, total } = buildOffsets();
		const boardScroll = getScrollContainer?.() ?? null;
		let viewportTop = 0;
		let viewportBottom = 0;

		if (boardScroll) {
			const boardRect = boardScroll.getBoundingClientRect();
			const containerRect = container.getBoundingClientRect();
			viewportTop = Math.max(
				0,
				boardRect.top +
					(viewport?.inset() ?? 0) -
					containerRect.top -
					contentTop
			);
			viewportBottom = Math.min(
				total,
				boardRect.bottom - containerRect.top - contentTop
			);
		} else {
			viewportTop = Math.max(0, container.scrollTop - contentTop);
			viewportBottom =
				container.scrollTop + container.clientHeight - contentTop;
		}

		if (viewportBottom < 0 || viewportTop > total) {
			range = { start: 0, end: -1, top: 0, bottom: total, total };
			return;
		}
		const safeOverscan = Math.max(0, Math.floor(cardOverscan || 0));
		let start = Math.max(0, upperBound(offsets, viewportTop) - 1);
		let end = Math.max(start, upperBound(offsets, viewportBottom) - 1);

		start = Math.max(0, start - safeOverscan);
		end = Math.min(count - 1, end + safeOverscan);

		range = {
			start,
			end,
			top: offsets[start],
			bottom: Math.max(0, total - offsets[end + 1]),
			total,
		};
	}

	function scheduleRecalculate(..._tracked: unknown[]) {
		if (viewport) {
			viewport.schedule();
			return;
		}
		if (frame) return;
		frame = requestAnimationFrame(() => {
			frame = 0;
			recalculate();
		});
	}

	function pruneHeightCache() {
		const ids = new Set(cards.map(card => card.id));
		for (const id of heightCache.keys()) {
			if (!ids.has(id)) heightCache.delete(id);
		}
		capHeightCache();
	}

	function capHeightCache() {
		while (heightCache.size > HEIGHT_CACHE_LIMIT) {
			const first = heightCache.keys().next().value;
			if (first === undefined) break;
			heightCache.delete(first);
		}
	}

	function ensureCardObserver() {
		if (cardObserver || typeof ResizeObserver === "undefined") return;

		cardObserver = new ResizeObserver(entries => {
			let changed = false;
			for (const entry of entries) {
				const id = measuredNodes.get(entry.target);
				if (id == null) continue;

				const height = Math.ceil((entry.target as HTMLElement).offsetHeight);
				if (height > 0 && heightCache.get(id) !== height) {
					heightCache.delete(id);
					heightCache.set(id, height);
					capHeightCache();
					offsetsCache = undefined;
					changed = true;
				}
			}

			if (changed) scheduleRecalculate();
		});
	}

	function measureCard(node: HTMLElement, card: KanbanCard) {
		if (card.id != null) {
			ensureCardObserver();
			measuredNodes.set(node, card.id);
			cardObserver?.observe(node);
		}

		return {
			update(next: KanbanCard) {
				cardObserver?.unobserve(node);
				if (next.id != null) {
					measuredNodes.set(node, next.id);
					cardObserver?.observe(node);
				} else {
					measuredNodes.delete(node);
				}
			},
			destroy() {
				cardObserver?.unobserve(node);
				measuredNodes.delete(node);
			},
		};
	}

	$effect(() => {
		if (virtualizeCards && !previousVirtualizeCards) {
			heightCache.clear();
		}
		previousVirtualizeCards = virtualizeCards;

		for (const card of cards) {
			if (previousCards.get(card.id) !== card) heightCache.delete(card.id);
		}
		previousCards = new Map(cards.map(card => [card.id, card]));
		if (previousTemplate !== cardContent || previousShape !== cardShape)
			heightCache.clear();
		previousShape = cardShape;
		previousTemplate = cardContent;
		offsetsCache = undefined;
		pruneHeightCache();
		scheduleRecalculate(
			cards,
			contentVisible,
			estimatedCardHeight,
			cardOverscan,
			active,
			cardShape,
			fixedColumnWidth
		);
	});

	$effect(() => {
		if (!container) return;
		if (viewport) return viewport.subscribe(recalculate);
		if (!contentVisible || !virtualizeCards) return;

		const scrollElement = getScrollContainer?.() ?? container;
		const onScroll = () => scheduleRecalculate();

		scrollElement.addEventListener("scroll", onScroll, { passive: true });
		window.addEventListener("resize", onScroll);
		scheduleRecalculate();

		return () => {
			scrollElement.removeEventListener("scroll", onScroll);
			window.removeEventListener("resize", onScroll);
		};
	});

	$effect(() => {
		if (
			!container ||
			!contentVisible ||
			!virtualizeCards ||
			typeof ResizeObserver === "undefined"
		) {
			return;
		}

		updateMeasuredWidth(container.clientWidth);
		const observer = new ResizeObserver(() => {
			const next = container?.clientWidth ?? 0;
			if (updateMeasuredWidth(next)) scheduleRecalculate();
		});

		observer.observe(container);
		return () => observer.disconnect();
	});

	onDestroy(() => {
		if (frame) cancelAnimationFrame(frame);
		cardObserver?.disconnect();
	});
	function measureStart(node: HTMLElement) {
		const measure = () => {
			startHeight = node.getBoundingClientRect().height;
			scheduleRecalculate();
		};
		measure();
		const observer = new ResizeObserver(measure);
		observer.observe(node);
		return {
			destroy() {
				observer.disconnect();
				startHeight = 0;
				scheduleRecalculate();
			},
		};
	}
</script>

<div
	class="wx-column-cards"
	data-kanban-column-cards={active ? setID(column.id) : undefined}
	data-kanban-swimlane={swimlane === undefined ? undefined : setID(swimlane)}
	data-kanban-render-start={renderStart}
	data-kanban-render-end={renderEnd}
	data-kanban-card-count={cards.length}
	data-kanban-after-rendered-before-id={afterRenderedBeforeId == null
		? undefined
		: setID(afterRenderedBeforeId)}
	bind:this={container}
	use:dblclick={{
		store,
		column: column.id,
		columnAccessor: $columnAccessor,
		swimlane,
		readonly,
	}}
>
	{#if active && cardListStart}
		{@const Slot = cardListStart}
		<div class="wx-card-list-start" use:measureStart>
			<Slot {column} swimlane={swimlaneView} {cards} {readonly} />
		</div>
	{/if}
	{#if contentVisible && active}
		{#if virtualizeCards}
			{#if topSpacerHeight > 0}
				<div class="wx-virtual-spacer" style:height="{topSpacerHeight}px"></div>
			{/if}
			{#each renderedCards as cardItem (cardItem.id)}
				{#if isDropColumn && dropTarget!.before === cardItem.id}
					<div
						class="wx-drop-placeholder"
						aria-hidden="true"
						style:height="{placeholderHeight}px"
					></div>
				{/if}
				{@const extraCss = getCardExtraCss(cardItem)}
				<div
					class="wx-card-row {cardItem.css ?? ''} {extraCss}"
					data-kanban-card-id={cardItem.id == null
						? undefined
						: setID(cardItem.id)}
					use:measureCard={cardItem}
					class:wx-dragging={dnd?.active && dnd.cardId === cardItem.id}
				>
					<CardWrapper card={cardItem} {cardContent} {cardShape} {extraCss} />
				</div>
			{/each}
			{#if trailingPlaceholder && !appendAfterSpacer}
				<div
					class="wx-drop-placeholder"
					aria-hidden="true"
					style:height="{placeholderHeight}px"
				></div>
			{/if}
			{#if bottomSpacerHeight > 0}
				<div
					class="wx-virtual-spacer"
					style:height="{bottomSpacerHeight}px"
				></div>
			{/if}
			{#if appendAfterSpacer}
				<div
					class="wx-drop-placeholder"
					aria-hidden="true"
					style:height="{placeholderHeight}px"
				></div>
			{/if}
		{:else}
			{#each cards as cardItem (cardItem.id)}
				{#if isDropColumn && dropTarget!.before === cardItem.id}
					<div
						class="wx-drop-placeholder"
						aria-hidden="true"
						style:height="{placeholderHeight}px"
					></div>
				{/if}
				{@const extraCss = getCardExtraCss(cardItem)}
				<div
					class="wx-card-row {cardItem.css ?? ''} {extraCss}"
					data-kanban-card-id={cardItem.id == null
						? undefined
						: setID(cardItem.id)}
					use:measureCard={cardItem}
					class:wx-dragging={dnd?.active && dnd.cardId === cardItem.id}
				>
					<CardWrapper card={cardItem} {cardContent} {cardShape} {extraCss} />
				</div>
			{/each}
			{#if trailingPlaceholder}
				<div
					class="wx-drop-placeholder"
					aria-hidden="true"
					style:height="{placeholderHeight}px"
				></div>
			{/if}
		{/if}
	{:else if hiddenHeight > 0 && active}
		<div class="wx-virtual-spacer" style:height="{hiddenHeight}px"></div>
	{/if}
	{#if active && cardListEnd}
		{@const Slot = cardListEnd}
		<div class="wx-card-list-end">
			<Slot {column} swimlane={swimlaneView} {cards} {readonly} />
		</div>
	{/if}
</div>

<style>
	.wx-card-list-start,
	.wx-card-list-end {
		display: flow-root;
	}
	.wx-column-cards {
		display: flex;
		flex-direction: column;
		gap: var(--wx-card-gap, 8px);
		padding: 8px;
		overflow-y: auto;
		flex: 1;
		min-height: 0;
	}

	.wx-column-cards > :global(div) {
		flex-shrink: 0;
	}

	.wx-drop-placeholder {
		border: 1px dashed var(--wx-kanban-border-color);
		border-radius: var(--wx-border-radius);
		background: var(--wx-kanban-drop-placeholder-bg);
		box-sizing: border-box;
		pointer-events: none;
	}

	.wx-dragging {
		display: none;
	}
</style>
