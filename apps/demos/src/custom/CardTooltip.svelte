<script lang="ts">
	import { getPriorityOptions, type KanbanCard } from "@svar-ui/svelte-kanban";
	import { users } from "../data.js";
	import { resolveLabel, resolveLabels } from "./resolve.js";

	const { card } = $props<{ card: KanbanCard }>();

	const priorityLabel = $derived(
		card.priority != null
			? resolveLabel(card.priority, getPriorityOptions())
			: null
	);
	const userLabelList = $derived(resolveLabels(card.users, users.data));
</script>

<div class="card-tooltip">
	<div class="tooltip-title">{card.label ?? `Card ${card.id}`}</div>
	{#if card.description}
		<div class="tooltip-desc">{card.description}</div>
	{/if}
	<div class="tooltip-meta">
		{#if priorityLabel}
			<span class="tooltip-chip">{priorityLabel}</span>
		{/if}
		{#if typeof card.progress === "number"}
			<span class="tooltip-chip">
				{Math.round(card.progress * 100)}%
			</span>
		{/if}
		{#if userLabelList.length > 0}
			<span class="tooltip-chip">
				👤 {userLabelList.join(", ")}
			</span>
		{/if}
	</div>
	<div class="tooltip-id">ID: {card.id}</div>
</div>

<style>
	.card-tooltip {
		background: #1e293b;
		color: #f1f5f9;
		border-radius: 6px;
		padding: 8px 12px;
		font-size: 12px;
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.25);
		min-width: 160px;
		max-width: 280px;
	}
	.tooltip-title {
		font-weight: 600;
		margin-bottom: 4px;
	}
	.tooltip-desc {
		color: #cbd5e1;
		font-size: 12px;
		margin-bottom: 4px;
	}
	.tooltip-meta {
		display: flex;
		flex-wrap: wrap;
		gap: 4px;
		margin-bottom: 4px;
	}
	.tooltip-chip {
		background: #334155;
		color: #e2e8f0;
		border-radius: 10px;
		padding: 1px 8px;
		font-size: 11px;
	}
	.tooltip-id {
		color: #64748b;
		font-size: 10px;
	}
</style>
