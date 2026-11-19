<script lang="ts">
	import type { CardListSlotProps } from "../types.js";
	import { flushSync, getContext, onDestroy, setContext } from "svelte";
	import type { Component } from "svelte";
	import { setID, type ILocale } from "@svar-ui/lib-dom";
	import type {
		KanbanModel,
		KanbanCard,
		ColumnID,
		ColumnView,
		SwimlaneID,
	} from "@svar-ui/kanban-store";
	import type {
		CardShape,
		CardCssFn,
		ColumnCssFn,
		KanbanContextApi,
	} from "../types.js";
	import {
		KANBAN_API_CONTEXT,
		CELL_VIEWPORT_CONTEXT,
		type CellViewport,
	} from "../context.js";
	import { stackGroups, type StackGroup } from "../layout/stack.js";
	import CardList from "./CardList.svelte";

	type Props = {
		model: KanbanModel;
		scroll?: HTMLElement;
		readonly: boolean;
		cardContent?: Component<{ card: KanbanCard; cardShape: CardShape }>;
		cardShape: CardShape;
		virtualizeCards: boolean;
		estimatedCardHeight: number;
		cardOverscan: number;
		/** Gates `request-data` on vertical visibility, as in the board layout. */
		virtualizeColumns: boolean;
		cardListStart?: Component<CardListSlotProps>;
		cardListEnd?: Component<CardListSlotProps>;
		cardCss?: CardCssFn;
		columnCss?: ColumnCssFn;
	};
	let {
		model,
		scroll,
		readonly,
		cardContent,
		cardShape,
		virtualizeCards,
		estimatedCardHeight,
		cardOverscan,
		virtualizeColumns,
		cardListStart,
		cardListEnd,
		cardCss,
		columnCss,
	}: Props = $props();

	const store = getContext<KanbanContextApi>(KANBAN_API_CONTEXT);
	const _ = getContext<ILocale>("wx-i18n").getGroup("kanban");

	const groups = $derived(stackGroups(model));
	const byColumn = $derived.by(() => {
		const map = new Map<ColumnID, StackGroup[]>();
		for (const column of model.columns) map.set(column.id, []);
		for (const group of groups) map.get(group.column.id)!.push(group);
		return map;
	});

	// Request visibility only. Rendering never depends on it.
	const pendingColumns = $derived(
		model.columns.filter(
			column => !column.collapsed && column.dataStatus === "unknown"
		)
	);
	const sections = new Map<string, HTMLElement>();
	const marks = new Map<ColumnID, HTMLElement>();
	let visible = $state(new Set<ColumnID>());
	let frame = 0;

	function register<K>(map: Map<K, HTMLElement>) {
		return (node: HTMLElement, key: K) => {
			let current = key;
			map.set(current, node);
			scheduleVisibility();
			return {
				update(next: K) {
					if (map.get(current) === node) map.delete(current);
					current = next;
					map.set(current, node);
					scheduleVisibility();
				},
				destroy() {
					if (map.get(current) === node) map.delete(current);
				},
			};
		};
	}
	const section = register(sections);
	const mark = register(marks);

	/**
	 * A column is near the viewport when one of its expanded groups is within one
	 * viewport height of it. A column without groups is located by its marker, a
	 * zero-height element where its groups would be, so an unloaded empty column
	 * can still request its data.
	 */
	function updateVisibility() {
		if (!scroll || !virtualizeColumns || !pendingColumns.length) return;
		const rect = scroll.getBoundingClientRect();
		const top = rect.top - rect.height;
		const bottom = rect.bottom + rect.height;
		const near = (node: HTMLElement | undefined) => {
			if (!node) return false;
			const box = node.getBoundingClientRect();
			return box.bottom >= top && box.top <= bottom;
		};

		const next = new Set<ColumnID>();
		for (const column of pendingColumns) {
			const own = byColumn.get(column.id) ?? [];
			const hit = own.length
				? own.some(g => !g.collapsed && near(sections.get(g.key)))
				: near(marks.get(column.id));
			if (hit) next.add(column.id);
		}
		if (next.size !== visible.size || [...next].some(id => !visible.has(id)))
			visible = next;
	}

	// A newly mounted virtual list has no height until its own first frame commits
	// its spacers. Measuring in that frame would see every later column at the
	// top and request them all, so measure one frame later.
	function scheduleVisibility(..._tracked: unknown[]) {
		if (!virtualizeColumns || !pendingColumns.length || frame) return;
		frame = requestAnimationFrame(() => {
			frame = requestAnimationFrame(() => {
				frame = 0;
				updateVisibility();
			});
		});
	}

	$effect(() => {
		scheduleVisibility(groups, virtualizeColumns);
	});

	// One range scheduler for every group list. A group moves when an earlier
	// group or the scroll viewport changes size, without any change of its own,
	// so lists refresh together from the shared scroll and resize signals.
	let root: HTMLElement | undefined = $state();
	const callbacks = new Set<() => void>();
	let rangeFrame = 0;

	function scheduleRanges() {
		if (rangeFrame) return;
		rangeFrame = requestAnimationFrame(() => {
			rangeFrame = 0;
			// Groups are stacked, so each list's position depends on the spacers of
			// the lists above it. Commit every range before the next list measures;
			// a fresh list has no height yet and would put every later group in view.
			callbacks.forEach(callback => flushSync(callback));
		});
	}

	setContext<CellViewport>(CELL_VIEWPORT_CONTEXT, {
		subscribe(callback) {
			callbacks.add(callback);
			scheduleRanges();
			return () => {
				callbacks.delete(callback);
			};
		},
		schedule: scheduleRanges,
		// The sticky header sits inside its own section and occludes nothing.
		inset: () => 0,
	});

	$effect(() => {
		if (!scroll || !root) return;
		const element = scroll;
		const onChange = () => {
			scheduleRanges();
			scheduleVisibility();
		};
		element.addEventListener("scroll", onChange, { passive: true });
		// The root grows or shrinks with any group, including committed spacers.
		const observer =
			typeof ResizeObserver === "undefined"
				? undefined
				: new ResizeObserver(onChange);
		observer?.observe(element);
		observer?.observe(root);
		if (!observer) window.addEventListener("resize", onChange);
		return () => {
			element.removeEventListener("scroll", onChange);
			observer?.disconnect();
			window.removeEventListener("resize", onChange);
		};
	});


	function toggleColumn(column: ColumnView) {
		store.exec("update-column", {
			id: column.id,
			column: { collapsed: !column.collapsed },
			skipProvider: true,
		});
	}

	function toggleLane(id: SwimlaneID, collapsed: boolean) {
		store.exec("update-swimlane", { id, swimlane: { collapsed: !collapsed } });
	}

	onDestroy(() => {
		if (frame) cancelAnimationFrame(frame);
		if (rangeFrame) cancelAnimationFrame(rangeFrame);
	});
</script>

<div class="wx-stack" bind:this={root}>
	{#each model.columns as column (column.id)}
		<div class="wx-stack-mark" use:mark={column.id}></div>
		{#each byColumn.get(column.id) ?? [] as group (group.key)}
			{@const lane = group.swimlane}
			<section
				class="wx-stack-group {column.css ?? ''} {columnCss?.(
					group.cards,
					column
				) ?? ''}"
				class:wx-collapsed={group.collapsed}
				data-stack-column={setID(column.id)}
				data-stack-lane={lane ? setID(lane.id) : undefined}
				use:section={group.key}
			>
				<header
					class="wx-stack-header"
					data-column-id={setID(column.id)}
					data-lane-id={lane ? setID(lane.id) : undefined}
				>
					<button
						type="button"
						class="wx-toggle"
						onclick={() => toggleColumn(column)}
						aria-expanded={!column.collapsed}
						aria-label={column.collapsed
							? `${_("Expand column")} ${column.label}`
							: _("Collapse column")}
					>
						<i
							class="wx-icon {column.collapsed
								? 'wxi-angle-right'
								: 'wxi-angle-down'}"
						></i>
					</button>
					<h3 class="wx-title">{column.label}</h3>
					{#if lane}
						<button
							type="button"
							class="wx-lane-toggle"
							aria-expanded={!lane.collapsed}
							aria-label={`${_(lane.collapsed ? "Expand swimlane" : "Collapse swimlane")} ${lane.label}`}
							onclick={() => toggleLane(lane.id, !!lane.collapsed)}
						>
							<i
								class="wx-icon {lane.collapsed
									? 'wxi-angle-right'
									: 'wxi-angle-down'}"
							></i>
							<span class="wx-lane-label">{lane.label}</span>
						</button>
					{/if}
					{#if column.summaries.length}
						<div class="wx-column-summaries">
							{#each column.summaries as summary (summary.id)}
								<span
									class="wx-column-summary {summary.css ?? ''}"
									title={summary.text}>{summary.text}</span
								>
							{/each}
						</div>
					{/if}
					{#if column.menu}
						<button
							type="button"
							class="wx-column-menu"
							data-column-menu={setID(column.id)}
							aria-label="{_('Column menu')} {column.label}"
							aria-haspopup="menu"
						>
							<i class="wx-icon wxi-dots-h"></i>
						</button>
					{/if}
				</header>
				<div class="wx-stack-body">
					<CardList
						{column}
						cards={group.cards}
						swimlane={lane?.id}
						swimlaneView={lane}
						active={!group.collapsed}
						{readonly}
						{cardContent}
						{cardShape}
						contentVisible={true}
						{virtualizeCards}
						{estimatedCardHeight}
						{cardOverscan}
						fixedColumnWidth={true}
						{cardListStart}
						{cardListEnd}
						{cardCss}
					/>
				</div>
			</section>
		{/each}
	{/each}
</div>

<style>
	.wx-stack {
		min-width: 0;
		overflow-anchor: none;
	}

	.wx-stack-mark {
		height: 0;
	}

	.wx-stack-group {
		margin-bottom: 12px;
		background: var(--wx-kanban-column-bg);
		border-radius: var(--wx-radius-major);
	}

	/* The one sticky level: scoped to its own section, so consecutive headers push
	   each other out with no coordination and no measured offset. */
	.wx-stack-header {
		position: sticky;
		top: 0;
		z-index: 1;
		display: flex;
		align-items: center;
		gap: 8px;
		padding: 10px 12px;
		background: var(--wx-kanban-column-bg);
		border-bottom: 1px solid var(--wx-kanban-border-color);
		border-radius: var(--wx-radius-major) var(--wx-radius-major) 0 0;
	}

	.wx-collapsed .wx-stack-header {
		border-bottom-color: transparent;
		border-radius: var(--wx-radius-major);
	}

	/* Flow tracks never shrink; clip rather than scroll so no horizontal axis
	   appears. `clip` creates no scroll container, so sticky is unaffected. */
	.wx-stack-body {
		min-width: 0;
		overflow-x: clip;
	}

	.wx-collapsed .wx-stack-body {
		display: none;
	}

	.wx-title {
		flex: 1;
		min-width: 0;
		margin: 0;
		font-weight: var(--wx-font-weight-md);
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.wx-icon {
		font-size: var(--wx-icon-size);
	}

	.wx-toggle,
	.wx-column-menu {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		background: none;
		border: none;
		border-radius: var(--wx-icon-border-radius);
		padding: 0;
		flex: 0 0 18px;
		width: 18px;
		height: 18px;
		cursor: pointer;
		font-size: var(--wx-font-size-sm);
		color: var(--wx-color-font-alt);
	}

	.wx-toggle:hover,
	.wx-column-menu:hover,
	.wx-lane-toggle:hover {
		background: var(--wx-background-hover);
	}

	.wx-toggle:focus,
	.wx-column-menu:focus {
		outline: none;
		border: 1px solid var(--wx-color-primary);
	}

	.wx-lane-toggle {
		display: inline-flex;
		align-items: center;
		gap: 4px;
		min-width: 0;
		max-width: 40%;
		padding: 0 4px;
		border: 1px solid transparent;
		border-radius: var(--wx-icon-border-radius);
		background: transparent;
		color: var(--wx-color-font-alt);
		cursor: pointer;
		font: inherit;
	}

	.wx-lane-toggle:focus-visible {
		outline: none;
		border-color: var(--wx-color-primary);
	}

	.wx-lane-label {
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.wx-column-summaries {
		display: flex;
		align-items: center;
		gap: 4px;
		min-width: 0;
		max-width: 40%;
		overflow: hidden;
	}

	.wx-column-summary {
		min-width: 0;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
		padding: 1px 6px;
		border: 1px solid var(--wx-kanban-border-color);
		border-radius: var(--wx-border-radius);
		background: var(--wx-kanban-tag-bg);
		font-size: var(--wx-font-size-sm);
		line-height: var(--wx-line-height-sm);
		color: var(--wx-color-font-alt);
	}
</style>
