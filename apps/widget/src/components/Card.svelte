<script lang="ts">
	import { getContext } from "svelte";
	import { dateToString, type ILocale } from "@svar-ui/lib-dom";
	import Avatar from "./Avatar.svelte";
	import CardMenuButton from "./CardMenuButton.svelte";
	import type { CardID, KanbanCard } from "@svar-ui/kanban-store";
	import type {
		CardDeadlineShape,
		CardPriorityShape,
		CardShape,
		CardShapeItem,
		CardShapeUserItem,
		CardTagsShape,
		CardUsersShape,
	} from "../types.js";
	import { getPriorityOptions } from "../defaults.js";

	type Props = {
		card: KanbanCard;
		cardShape: CardShape;
	};

	type ResolvedCardItem = CardShapeItem & { img?: string };

	let { card, cardShape }: Props = $props();

	const i18n = getContext<ILocale>("wx-i18n");
	const _ = i18n.getGroup("kanban");

	function countOf(v: any): number {
		if (typeof v === "number") return v;
		if (Array.isArray(v)) return v.length;
		return 0;
	}

	function configOf<T>(shape: boolean | T | undefined): T | undefined {
		return typeof shape === "object" && shape !== null ? shape : undefined;
	}

	function itemID(value: any): CardID | null {
		if (typeof value === "string" || typeof value === "number") return value;
		const id = value?.id;
		if (typeof id === "string" || typeof id === "number") return id;
		return null;
	}

	function fallbackLabel(value: any): string {
		const id = itemID(value);
		if (id != null) return String(id);
		return String(value?.label ?? value?.name ?? "");
	}

	function findItem<T extends CardShapeItem>(
		collection: T[] | undefined,
		id: CardID
	): T | undefined {
		return collection?.find(item => item.id === id);
	}

	function resolveItem<T extends CardShapeItem>(
		value: any,
		collection?: T[]
	): ResolvedCardItem | null {
		const id = itemID(value);
		if (id == null) return null;

		const match = findItem(collection, id);
		if (match) return match;

		return {
			id,
			label: fallbackLabel(value),
		};
	}

	function resolveItems<T extends CardShapeItem>(
		values: any,
		collection?: T[],
		max?: number
	): ResolvedCardItem[] {
		if (!Array.isArray(values)) return [];
		const items = values
			.map(value => resolveItem(value, collection))
			.filter((item): item is ResolvedCardItem => item !== null);

		return typeof max === "number" && Number.isFinite(max)
			? items.slice(0, Math.max(0, max))
			: items;
	}

	// string formats use the wx locale tokens ("%m/%d/%Y"); default is the locale dateFormat
	function formatDeadline(
		value: any,
		format?: string | ((date: Date) => string)
	): string | null {
		if (!(value instanceof Date)) return null;
		if (typeof format === "function") return format(value);
		const { calendar, formats } = i18n.getRaw() as any;
		return dateToString(format || formats.dateFormat, calendar)(value);
	}

	let priorityConfig = $derived(
		configOf<CardPriorityShape>(cardShape.priority)
	);
	let tagConfig = $derived(configOf<CardTagsShape>(cardShape.tags));
	let userConfig = $derived(configOf<CardUsersShape>(cardShape.users));
	let deadlineConfig = $derived(
		configOf<CardDeadlineShape>(cardShape.deadline)
	);
	let progressConfig = $derived(
		configOf<{ showLabel?: boolean }>(cardShape.progress)
	);
	let progressPercent = $derived(
		Math.round(Math.max(0, Math.min(1, card.progress ?? 0)) * 100)
	);
	let priority = $derived(
		cardShape.priority
			? resolveItem(card.priority, priorityConfig?.data ?? getPriorityOptions())
			: null
	);
	let tags = $derived(
		cardShape.tags
			? resolveItems(card.tags, tagConfig?.data, tagConfig?.max)
			: []
	);
	let users = $derived(
		cardShape.users
			? resolveItems<CardShapeUserItem>(
					card.users,
					userConfig?.data,
					userConfig?.max
				)
			: []
	);
	let avatarUsers = $derived(
		users.map(u => ({ id: u.id, name: u.label, avatar: u.img }))
	);
	let deadline = $derived(
		cardShape.deadline
			? formatDeadline(card.deadline, deadlineConfig?.format)
			: null
	);
</script>

{#if card.cover && cardShape.cover}
	<div class="wx-cover" style="background-image: url({card.cover});"></div>
{/if}

{#if priority || deadline}
	<div class="wx-header">
		{#if priority}
			<span class="wx-priority {priority.css ?? ''}">{_(priority.label)}</span>
		{/if}
		{#if deadline}
			<span class="wx-deadline">{deadline}</span>
		{/if}
		{#if cardShape.menu}
			<CardMenuButton {card} />
		{/if}
	</div>
{/if}

<div class="wx-body">
	<div class="wx-title-row">
		{#if card.label}
			<div class="wx-title">
				{card.label}

				{#if cardShape.menu && !priority && !deadline}
					<CardMenuButton {card} />
				{/if}
			</div>
		{/if}
	</div>
	{#if card.description && cardShape.description}
		<p class="wx-description">{card.description}</p>
	{/if}
	{#if tags.length > 0}
		<div class="wx-tags">
			{#each tags as tag (tag.id)}
				<span class="wx-tag {tag.css ?? ''}">{tag.label}</span>
			{/each}
		</div>
	{/if}
	{#if card.progress > 0 && cardShape.progress}
		<div class="wx-progress-row">
			<div class="wx-progress" aria-label={_("Progress")}>
				<div class="wx-progress-fill" style="width: {progressPercent}%;"></div>
			</div>
			{#if progressConfig?.showLabel}
				<span class="wx-progress-label">{progressPercent}%</span>
			{/if}
		</div>
	{/if}
</div>

{#if users.length > 0 || (countOf(card.attachments) > 0 && cardShape.attachments) || (countOf(card.comments) > 0 && cardShape.comments)}
	<div class="wx-footer">
		{#if avatarUsers.length > 0}
			<Avatar value={avatarUsers} size={24} />
		{/if}
		<div class="wx-counters">
			{#if countOf(card.attachments) > 0 && cardShape.attachments}
				<span class="wx-counter" aria-label={_("Attachments")}>
					<i class="wx-icon wxi-paperclip"></i>
					{countOf(card.attachments)}
				</span>
			{/if}
			{#if countOf(card.comments) > 0 && cardShape.comments}
				<span class="wx-counter" aria-label={_("Comments")}>
					<i class="wx-icon wxi-message"></i>
					{countOf(card.comments)}
				</span>
			{/if}
		</div>
	</div>
{/if}

<style>
	.wx-cover {
		margin: -12px;
		margin-bottom: 0;
		height: 80px;
		background-size: cover;
		background-position: center;
		border-top-left-radius: var(--wx-border-radius);
		border-top-right-radius: var(--wx-border-radius);
	}

	.wx-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 6px;
		font-size: var(--wx-font-size-sm);
	}

	.wx-priority {
		background: var(--wx-kanban-tag-bg);
		border-radius: var(--wx-border-radius);
		padding: 1px 6px;
		font-weight: var(--wx-font-weight-md);
	}

	.wx-header :global(.wx-card-priority-low) {
		background: var(--wx-kanban-priority-low-bg);
		color: var(--wx-kanban-priority-low-color);
	}

	.wx-header :global(.wx-card-priority-medium) {
		background: var(--wx-kanban-priority-medium-bg);
		color: var(--wx-kanban-priority-medium-color);
	}

	.wx-header :global(.wx-card-priority-high) {
		background: var(--wx-kanban-priority-high-bg);
		color: var(--wx-kanban-priority-high-color);
	}

	.wx-deadline {
		margin-left: auto;
		color: var(--wx-color-font-alt);
	}

	.wx-title :global(.wx-menu) {
		float: right;
	}

	.wx-body {
		display: flex;
		flex-direction: column;
		gap: 4px;
	}

	.wx-title {
		font-weight: var(--wx-font-weight-md);
		overflow: hidden;
		display: -webkit-box;
		-webkit-line-clamp: 2;
		line-clamp: 2;
		-webkit-box-orient: vertical;
	}

	.wx-description {
		margin: 0;
		color: var(--wx-color-font-alt);
		font-size: 13px;
		overflow: hidden;
		display: -webkit-box;
		-webkit-line-clamp: 2;
		line-clamp: 2;
		-webkit-box-orient: vertical;
		margin-bottom: 4px;
	}

	.wx-tags {
		display: flex;
		flex-wrap: wrap;
		gap: 4px;
		margin-bottom: 4px;
	}

	.wx-tag {
		background: var(--wx-kanban-tag-bg);
		border-radius: 10px;
		padding: 1px 8px;
		font-size: 11px;
		color: var(--wx-color-font-alt);
	}

	.wx-progress-row {
		display: flex;
		align-items: center;
		gap: 6px;
	}

	.wx-progress {
		flex: 1;
		height: 4px;
		background: var(--wx-kanban-progress-bg);
		border-radius: 2px;
		overflow: hidden;
	}

	.wx-progress-label {
		font-size: 11px;
		color: var(--wx-color-font-alt);
		min-width: 32px;
		text-align: right;
	}

	.wx-progress-fill {
		height: 100%;
		background: var(--wx-kanban-progress-fill);
	}

	.wx-footer {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-top: 2px;
	}

	.wx-counters {
		display: flex;
		gap: 12px;
		font-size: var(--wx-font-size-sm);
		color: var(--wx-color-font-alt);
		margin-top: -5px;
		margin-left: auto;
	}

	.wx-counter {
		display: inline-flex;
		align-items: center;
		gap: 2px;
	}

	.wx-counter .wx-icon {
		font-size: 16px;
		margin-top: 7px;
		margin-bottom: 5px;
	}
</style>
