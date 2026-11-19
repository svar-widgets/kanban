<script lang="ts">
	import { Button } from "@svar-ui/svelte-core";
	import type { EventLogState } from "./log.svelte";

	// Bottom panel listing what a sample reports (events, API calls).
	let {
		log,
		title = "Event log",
		height = "140px",
	}: { log: EventLogState; title?: string; height?: string } = $props();
</script>

<div class="wx-demo-log" style:height>
	<div class="wx-demo-log-header">
		<span class="wx-demo-log-title">{title}</span>
		<Button type="link" onclick={() => log.clear()}>Clear</Button>
	</div>
	<div class="wx-demo-log-body">
		{#each log.entries as entry (entry.id)}
			<div class="wx-demo-log-entry">
				<span class="wx-demo-log-time">{entry.time}</span>
				<span>{entry.text}</span>
			</div>
		{:else}
			<div class="wx-demo-log-empty">Nothing yet</div>
		{/each}
	</div>
</div>

<style>
	.wx-demo-log {
		display: flex;
		flex-direction: column;
		flex-shrink: 0;
		border-top: var(--wx-border);
		background: var(--wx-background-alt);
	}
	.wx-demo-log-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 0 calc(var(--wx-padding) * 2);
	}
	.wx-demo-log-title {
		font-weight: var(--wx-font-weight-md);
	}
	.wx-demo-log-body {
		flex: 1;
		min-height: 0;
		overflow-y: auto;
		padding: 0 calc(var(--wx-padding) * 2) var(--wx-padding);
		font-size: var(--wx-font-size-sm);
		line-height: var(--wx-line-height-sm);
	}
	.wx-demo-log-entry {
		display: flex;
		gap: var(--wx-padding);
	}
	.wx-demo-log-time,
	.wx-demo-log-empty {
		color: var(--wx-color-font-alt);
		font-variant-numeric: tabular-nums;
	}
</style>
