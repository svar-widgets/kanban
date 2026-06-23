<script lang="ts">
	import {
		getPriorityOptions,
		type KanbanCard,
	} from "@svar-ui/svelte-kanban";
	import { users } from "../data.js";
	import { resolveLabel, resolveLabels } from "./resolve.js";

	const { card, close } = $props<{
		card: KanbanCard;
		close: () => void;
	}>();

	const priorityLabel = $derived(
		card.priority != null
			? resolveLabel(card.priority, getPriorityOptions())
			: null
	);
	const userLabelList = $derived(resolveLabels(card.users, users.data));
	const tagLabelList = $derived(resolveLabels(card.tags));

	function handleAction(action: string) {
		alert(`Action: ${action} for "${card.label ?? card.id}"`);
		close();
	}
</script>

<div class="card-popup">
	<div class="popup-header">
		<div class="popup-title">{card.label ?? `Card ${card.id}`}</div>
		<button
			type="button"
			class="popup-close"
			aria-label="Close"
			onclick={close}>×</button
		>
	</div>
	<div class="popup-body">
		{#if card.description}
			<div class="popup-row">
				<span class="popup-label">Description</span>
				<span class="popup-value">{card.description}</span>
			</div>
		{/if}
		{#if priorityLabel}
			<div class="popup-row">
				<span class="popup-label">Priority</span>
				<span class="popup-value">{priorityLabel}</span>
			</div>
		{/if}
		{#if typeof card.progress === "number"}
			<div class="popup-row">
				<span class="popup-label">Progress</span>
				<span class="popup-value">
					{Math.round(card.progress * 100)}%
				</span>
			</div>
		{/if}
		{#if userLabelList.length > 0}
			<div class="popup-row">
				<span class="popup-label">Users</span>
				<span class="popup-value">
					{userLabelList.join(", ")}
				</span>
			</div>
		{/if}
		{#if tagLabelList.length > 0}
			<div class="popup-row">
				<span class="popup-label">Tags</span>
				<span class="popup-value">
					{tagLabelList.join(", ")}
				</span>
			</div>
		{/if}
	</div>
	<div class="popup-actions">
		<button
			type="button"
			class="btn btn-primary"
			onclick={() => handleAction("open")}
		>
			Open
		</button>
		<button
			type="button"
			class="btn btn-secondary"
			onclick={() => handleAction("share")}
		>
			Share
		</button>
	</div>
</div>

<style>
	.card-popup {
		width: 280px;
		font-size: 13px;
	}
	.popup-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 12px 16px;
		border-bottom: 1px solid #e2e8f0;
	}
	.popup-title {
		font-weight: 600;
		font-size: 15px;
		color: #1e293b;
	}
	.popup-close {
		background: none;
		border: none;
		font-size: 18px;
		line-height: 1;
		color: #64748b;
		cursor: pointer;
		padding: 0 4px;
	}
	.popup-close:hover {
		color: #1e293b;
	}
	.popup-body {
		padding: 12px 16px;
		display: flex;
		flex-direction: column;
		gap: 6px;
	}
	.popup-row {
		display: flex;
		justify-content: space-between;
		gap: 12px;
	}
	.popup-label {
		color: #64748b;
		font-size: 12px;
		flex-shrink: 0;
	}
	.popup-value {
		color: #1e293b;
		font-size: 12px;
		text-align: right;
		overflow: hidden;
		text-overflow: ellipsis;
	}
	.popup-actions {
		display: flex;
		gap: 8px;
		padding: 12px 16px;
		border-top: 1px solid #e2e8f0;
	}
	.btn {
		flex: 1;
		padding: 6px 12px;
		border-radius: 6px;
		border: none;
		cursor: pointer;
		font-size: 12px;
		font-weight: 500;
	}
	.btn-primary {
		background: #3b82f6;
		color: white;
	}
	.btn-primary:hover {
		background: #2563eb;
	}
	.btn-secondary {
		background: #f1f5f9;
		color: #475569;
		border: 1px solid #e2e8f0;
	}
	.btn-secondary:hover {
		background: #e2e8f0;
	}
</style>
