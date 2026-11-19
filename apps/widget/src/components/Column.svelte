<script lang="ts">
	import type { CardListSlotProps } from "../types.js";
	import type { Component } from "svelte";
	import { getContext } from "svelte";
	import { setID, type ILocale } from "@svar-ui/lib-dom";
	import type { ColumnID, ColumnView, KanbanCard } from "@svar-ui/kanban-store";
	import type {
		KanbanContextApi,
		CardShape,
		CardCssFn,
		ColumnCssFn,
	} from "../types.js";
	import CardList from "./CardList.svelte";
	import { createColumnCard } from "../directives/dblclick.js";

	import { KANBAN_API_CONTEXT } from "../context.js";

	type Props = {
		column: ColumnView;
		headerOnly?: boolean;
		readonly?: boolean;
		cardContent?: Component<{ card: KanbanCard; cardShape: CardShape }>;
		cardShape: CardShape;
		contentVisible: boolean;
		requestVisible: boolean;
		virtualizeCards: boolean;
		estimatedCardHeight: number;
		cardOverscan: number;
		fixedColumnWidth: boolean;
		registerColumn?: (id: ColumnID, element: HTMLElement | null) => void;
		cardListStart?: Component<CardListSlotProps>;
		cardListEnd?: Component<CardListSlotProps>;
		cardCss?: CardCssFn;
		columnCss?: ColumnCssFn;
	};

	let {
		column,
		headerOnly = false,
		readonly = false,
		cardContent,
		cardShape,
		contentVisible,
		requestVisible,
		virtualizeCards,
		estimatedCardHeight,
		cardOverscan,
		fixedColumnWidth,
		registerColumn,
		cardListStart,
		cardListEnd,
		cardCss,
		columnCss,
	}: Props = $props();

	const dynamicColumnCss = $derived(
		columnCss ? (columnCss(column.cards, column) ?? "") : ""
	);

	const store = getContext<KanbanContextApi>(KANBAN_API_CONTEXT);
	const { columnAccessor } = store.getReactiveState();
	const _ = getContext<ILocale>("wx-i18n").getGroup("kanban");
	let root: HTMLElement | undefined = $state();
	const addCardVisible = $derived(column.addCard !== false && !readonly);

	function toggleCollapsed() {
		store.exec("update-column", {
			id: column.id,
			column: { collapsed: !column.collapsed },
			skipProvider: true,
		});
	}

	function addCard() {
		if (!addCardVisible) return;

		const card = createColumnCard({}, $columnAccessor, column.id);
		store.exec("add-card", { card, edit: true });
	}

	$effect(() => {
		if (!registerColumn || !root) return;

		const id = column.id;
		registerColumn(id, root);

		return () => registerColumn(id, null);
	});

</script>

<section
	class="wx-column {column.css ?? ''} {dynamicColumnCss}"
	class:wx-collapsed={column.collapsed}
	data-column-id={column.collapsed ? setID(column.id) : undefined}
	style:box-sizing={column.width !== undefined ? "border-box" : undefined}
	style:flex={!column.collapsed && column.width !== undefined
		? `0 0 ${column.width}px`
		: undefined}
	style:min-width={!column.collapsed && column.width !== undefined
		? `${column.width}px`
		: undefined}
	bind:this={root}
>
	{#if column.collapsed}
		<button
			type="button"
			class="wx-expand"
			onclick={toggleCollapsed}
			aria-expanded={false}
			title={column.label}
			aria-label={`${_("Expand column")} ${column.label}`}
		>
			<i class="wx-icon wxi-angle-right"></i>
		</button>
		{#if !headerOnly}
			<div class="wx-body">
				<h3 class="wx-title">
					<span>{column.label}</span>
				</h3>
			</div>
		{/if}
	{:else}
		<header class="wx-column-header" data-column-id={setID(column.id)}>
			<button
				type="button"
				class="wx-toggle"
				onclick={toggleCollapsed}
				aria-expanded={true}
				aria-label={_("Collapse column")}
			>
				<i class="wx-icon wxi-angle-left"></i>
			</button>
			<h3 class="wx-title">{column.label}</h3>
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
			{#if addCardVisible}
				<button
					type="button"
					class="wx-add"
					onclick={addCard}
					aria-label="{_('Add card to')} {column.label}"
				>
					<i class="wx-icon wxi-plus"></i>
				</button>
			{/if}
		</header>
		{#if !headerOnly}
			<CardList
				{column}
				{readonly}
				{cardContent}
				{cardShape}
				{contentVisible}
				{virtualizeCards}
				{estimatedCardHeight}
				{cardOverscan}
				{fixedColumnWidth}
				{cardListStart}
				{cardListEnd}
				{cardCss}
			/>
		{/if}
	{/if}
</section>

<style>
	.wx-icon {
		font-size: 24px;
		margin-top: 5px;
	}

	.wx-column {
		display: flex;
		flex-direction: column;
		flex: 0 0 280px;
		min-width: 280px;
		max-height: 100%;
		background: var(--wx-kanban-column-bg);
		border-radius: var(--wx-radius-major);
		overflow: hidden;
	}

	.wx-collapsed {
		flex: 0 0 40px;
		min-width: 40px;
		max-width: 40px;
		align-items: center;
	}

	.wx-column-header {
		display: flex;
		align-items: center;
		gap: 8px;
		padding: 10px 12px;
		border-bottom: 1px solid var(--wx-kanban-border-color);
	}

	.wx-title {
		flex: 1;
		margin: 0;
		font-weight: var(--wx-font-weight-md);
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.wx-column-summaries {
		display: flex;
		align-items: center;
		gap: 4px;
		min-width: 0;
		max-width: 60%;
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

	.wx-add,
	.wx-column-menu,
	.wx-toggle {
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

	.wx-add:hover,
	.wx-column-menu:hover,
	.wx-toggle:hover {
		background: var(--wx-background-hover);
	}

	.wx-add:focus,
	.wx-column-menu:focus,
	.wx-toggle:focus {
		outline: none;
	}

	.wx-expand {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		background: none;
		border: none;
		padding: 0;
		width: 100%;
		height: 36px;
		flex: 0 0 36px;
		cursor: pointer;
		font-size: var(--wx-font-size-sm);
		color: var(--wx-color-font-alt);
	}

	.wx-body {
		position: relative;
		flex: 1;
		width: 100%;
		min-height: 0;
	}

	.wx-collapsed .wx-title {
		position: absolute;
		left: 50%;
		bottom: 0px;
		display: flex;
		align-items: center;
		max-width: calc(var(--wx-kanban-scroll-height, 100vh) - 96px);
		transform: rotate(-90deg);
		transform-origin: left center;
	}

	.wx-collapsed .wx-title > span:first-child {
		min-width: 0;
		overflow: hidden;
		text-overflow: ellipsis;
	}
</style>
