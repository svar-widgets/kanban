<script lang="ts">
import type { KanbanCard } from "@svar-ui/svelte-kanban";

const { card } = $props<{ card: KanbanCard }>();

function countOf(value: unknown): number {
    if (typeof value === "number") return value;
    if (Array.isArray(value)) return value.length;
    return 0;
}

function progressOf(card: KanbanCard): number {
    return Math.round(Math.max(0, Math.min(1, card.progress ?? 0)) * 100);
}

function formatDeadline(value: unknown): string {
    if (
        !(value instanceof Date) &&
        typeof value !== "string" &&
        typeof value !== "number"
    ) {
        return "";
    }

    const deadline = value instanceof Date ? value : new Date(value);
    if (Number.isNaN(deadline.getTime())) return "";

    return deadline.toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
    });
}

const progress = $derived(progressOf(card));
const deadline = $derived(formatDeadline(card.deadline));
const userCount = $derived(countOf(card.users));
const attachmentCount = $derived(countOf(card.attachments));
const commentCount = $derived(countOf(card.comments));


</script>

<div class="custom-card">
    <div class="custom-card-top">
        {#if card.priority}
            <span class="custom-card-priority">P{card.priority}</span>
        {/if}
        {#if deadline}
            <span class="custom-card-date">{deadline}</span>
        {/if}
    </div>

    <strong class="custom-card-title">{card.label ?? `Card ${card.id}`}</strong>

    {#if card.description}
        <p class="custom-card-description">{card.description}</p>
    {/if}

    <div class="custom-card-progress-row">
        <div class="custom-card-progress" aria-label="progress">
            <span style:width={progress + "%"}></span>
        </div>
        <span class="custom-card-progress-value">{progress}%</span>
    </div>

    <div class="custom-card-meta">
        {#if userCount > 0}
            <span>{userCount} users</span>
        {/if}
        {#if attachmentCount > 0}
            <span>{attachmentCount} files</span>
        {/if}
        {#if commentCount > 0}
            <span>{commentCount} comments</span>
        {/if}
    </div>
</div>

<style>
    .custom-card {
		display: flex;
		flex-direction: column;
		gap: 8px;
		min-width: 0;
	}

	.custom-card-top,
	.custom-card-progress-row,
	.custom-card-meta {
		display: flex;
		align-items: center;
		gap: 8px;
	}

	.custom-card-top {
		justify-content: space-between;
		min-height: 20px;
		font-size: 12px;
	}

	.custom-card-priority {
		border-radius: 4px;
		padding: 1px 6px;
		background: #e7f2ff;
		color: #075b9c;
		font-weight: 600;
	}

	.custom-card-date,
	.custom-card-description,
	.custom-card-progress-value,
	.custom-card-meta {
		color: var(--wx-color-font-alt, #666a76);
	}

	.custom-card-date {
		margin-left: auto;
		white-space: nowrap;
	}

	.custom-card-title {
		font-size: 15px;
		line-height: 20px;
		overflow: hidden;
		display: -webkit-box;
		-webkit-line-clamp: 2;
		line-clamp: 2;
		-webkit-box-orient: vertical;
	}

	.custom-card-description {
		margin: 0;
		font-size: 13px;
		line-height: 18px;
		overflow: hidden;
		display: -webkit-box;
		-webkit-line-clamp: 2;
		line-clamp: 2;
		-webkit-box-orient: vertical;
	}

	.custom-card-progress {
		flex: 1;
		height: 6px;
		border-radius: 3px;
		overflow: hidden;
		background: #e2e7ee;
	}

	.custom-card-progress span {
		display: block;
		height: 100%;
		border-radius: inherit;
		background: #2f8fed;
	}

	.custom-card-progress-value {
		min-width: 34px;
		text-align: right;
		font-size: 12px;
	}

	.custom-card-meta {
		flex-wrap: wrap;
		font-size: 12px;
	}

	.custom-card-meta span {
		border-radius: 4px;
		padding: 1px 6px;
		background: #f1f3f6;
	}
</style>