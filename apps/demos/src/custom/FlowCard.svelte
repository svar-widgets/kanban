<script lang="ts">
	import type { KanbanCard } from "@svar-ui/svelte-kanban";
	let { card }: { card: KanbanCard } = $props();
</script>

<div class="card">
	<span class="team">{card.team}</span>
	<strong>{card.label}</strong>
	<span class="effort">{card.effort} hours</span>
</div>

<style>
	.card {
		display: flex;
		flex-direction: column;
		gap: 6px;
		min-height: 0;
		height: 100%;
	}
	.team {
		color: var(--wx-color-font-alt);
		font-size: var(--wx-font-size-sm);
	}
	strong {
		overflow: hidden;
		text-overflow: ellipsis;
	}
	.effort {
		margin-top: auto;
		color: var(--wx-color-primary);
	}
</style>
